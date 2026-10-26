import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession } from './admin.models';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

const session: AuthSession = {
  user: { id: '1', email: 'a@b.co', name: 'A', role: 'ADMIN', lastLogin: null },
  accessToken: 'fresh-token',
  expiresIn: '7d',
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: { accessToken: string | null; isAuthenticated: jasmine.Spy; refresh: jasmine.Spy; endSession: jasmine.Spy };

  beforeEach(() => {
    auth = {
      accessToken: 'old-token',
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
      refresh: jasmine.createSpy('refresh').and.returnValue(of(session)),
      endSession: jasmine.createSpy('endSession'),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  const api = (path: string) => `${environment.apiUrl}${path}`;
  const unauthorized = { status: 401, statusText: 'Unauthorized' };

  it('sends the access token and credentials on API calls only', () => {
    http.get(api('/projects')).subscribe();
    const apiCall = controller.expectOne(api('/projects'));
    expect(apiCall.request.headers.get('Authorization')).toBe('Bearer old-token');
    expect(apiCall.request.withCredentials).toBeTrue();
    apiCall.flush({});

    http.get('assets/data/projects.json').subscribe();
    const other = controller.expectOne('assets/data/projects.json');
    expect(other.request.headers.has('Authorization')).toBeFalse();
    other.flush({});
  });

  it('refreshes once on a 401 and retries with the new token', () => {
    let result: unknown;
    http.get(api('/projects')).subscribe((value) => (result = value));

    controller.expectOne(api('/projects')).flush({}, unauthorized);
    const retry = controller.expectOne(api('/projects'));
    expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retry.flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(auth.refresh).toHaveBeenCalledTimes(1);
    expect(auth.endSession).not.toHaveBeenCalled();
  });

  it('ends the session when the refresh itself fails', () => {
    auth.refresh.and.returnValue(throwError(() => new Error('refresh rejected')));
    let failed = false;
    http.get(api('/projects')).subscribe({ error: () => (failed = true) });

    controller.expectOne(api('/projects')).flush({}, unauthorized);

    expect(failed).toBeTrue();
    expect(auth.endSession).toHaveBeenCalledTimes(1);
  });

  it('does NOT sign the admin out when the retried call is itself a legitimate 401', () => {
    let status = 0;
    http.post(api('/auth/change-password'), {}).subscribe({ error: (error) => (status = error.status) });

    controller.expectOne(api('/auth/change-password')).flush({}, unauthorized);
    controller.expectOne(api('/auth/change-password')).flush({}, unauthorized);

    expect(status).toBe(401);
    expect(auth.endSession).not.toHaveBeenCalled();
  });

  it('never tries to refresh for the auth endpoints themselves', () => {
    http.post(api('/auth/login'), {}).subscribe({ error: () => undefined });
    controller.expectOne(api('/auth/login')).flush({}, unauthorized);

    expect(auth.refresh).not.toHaveBeenCalled();
  });

  it('passes a 401 straight through when nobody is signed in', () => {
    auth.isAuthenticated.and.returnValue(false);
    let status = 0;
    http.get(api('/projects?includeUnpublished=true')).subscribe({ error: (error) => (status = error.status) });
    controller.expectOne(api('/projects?includeUnpublished=true')).flush({}, unauthorized);

    expect(status).toBe(401);
    expect(auth.refresh).not.toHaveBeenCalled();
  });
});
