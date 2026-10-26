import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('admin guards', () => {
  const authenticated = signal(false);
  let ready: jasmine.Spy;

  beforeEach(() => {
    authenticated.set(false);
    ready = jasmine.createSpy('ready').and.returnValue(Promise.resolve());
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { ready, isAuthenticated: () => authenticated() } }],
    });
  });

  const run = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard({} as never, {} as never)) as Promise<boolean | UrlTree>;

  it('sends a signed-out visitor to the login page', async () => {
    const result = (await run(authGuard)) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/admin/login');
  });

  it('lets a signed-in admin through, after restoring the session', async () => {
    authenticated.set(true);
    expect(await run(authGuard)).toBeTrue();
    expect(ready).toHaveBeenCalled();
  });

  it('keeps signed-in admins off the login page', async () => {
    authenticated.set(true);
    const result = (await run(guestGuard)) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/admin');
  });

  it('shows the login page to a signed-out visitor', async () => {
    expect(await run(guestGuard)).toBeTrue();
  });
});
