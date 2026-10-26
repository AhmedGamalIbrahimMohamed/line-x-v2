import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const withToken = (request: HttpRequest<unknown>, token: string | null) =>
  token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

/**
 * Sends API calls with credentials (so the httpOnly refresh cookie travels) and the in-memory
 * access token. On a 401 it refreshes once and retries; if that fails the session is ended and
 * admin pages go back to the login screen.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl)) return next(request);

  const auth = inject(AuthService);
  const apiRequest = request.clone({ withCredentials: true });
  const isAuthCall = /\/auth\/(login|refresh|logout)$/.test(request.url);

  return next(withToken(apiRequest, auth.accessToken)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthCall || !auth.isAuthenticated()) return throwError(() => error);

      return auth.refresh().pipe(
        // Only a failed refresh ends the session. A 401 from the retried call itself is a real answer
        // (for example a wrong current password) and is passed on untouched.
        catchError((refreshError) => {
          auth.endSession();
          return throwError(() => refreshError);
        }),
        switchMap((session) => next(withToken(apiRequest, session.accessToken)))
      );
    })
  );
};
