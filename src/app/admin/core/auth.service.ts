import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, ApiResponse, AuthSession } from './admin.models';

/**
 * Not a credential: it only records that this browser has signed in before, so a first-time
 * visitor to the public site never makes a pointless refresh request.
 */
const HINT_KEY = 'x-line-admin-hint';

/**
 * The access token lives in memory only. The long-lived refresh token is an httpOnly cookie that
 * page scripts cannot read, so an XSS bug cannot steal a session that outlasts the tab.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<AuthSession | null>(null);
  private restoring: Promise<void> | null = null;

  readonly user = computed<AdminUser | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  get accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  /** Resolves once a returning admin's session has been restored from the refresh cookie (or failed). */
  ready(): Promise<void> {
    if (!this.restoring) {
      this.restoring = this.hasHint()
        ? firstValueFrom(this.refresh().pipe(map(() => undefined), catchError(() => of(undefined))))
        : Promise.resolve();
    }
    return this.restoring;
  }

  login(email: string, password: string): Observable<AdminUser> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => this.setSession(response.data)),
        map((response) => response.data.user)
      );
  }

  /** Exchanges the refresh cookie for a new access token. Fails without side effects on the UI. */
  refresh(): Observable<AuthSession> {
    return this.http.post<ApiResponse<AuthSession>>(`${environment.apiUrl}/auth/refresh`, {}).pipe(
      map((response) => response.data),
      tap((session) => this.setSession(session)),
      catchError((error) => {
        this.clearLocal();
        return throwError(() => error);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword })
      .pipe(map(() => undefined));
  }

  /** Signs out on the server (clears the cookie) and locally. */
  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(catchError(() => of(null))).subscribe();
    this.endSession();
  }

  /** Drops the local session; sends the user to the login page only when they are in the admin area. */
  endSession(): void {
    this.clearLocal();
    if (this.router.url.startsWith('/admin')) this.router.navigate(['/admin/login']);
  }

  private setSession(session: AuthSession): void {
    this.session.set(session);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      // Without storage the session simply will not be restored after a reload.
    }
  }

  private clearLocal(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(HINT_KEY);
    } catch {
      // Nothing to clear.
    }
  }

  private hasHint(): boolean {
    try {
      return localStorage.getItem(HINT_KEY) === '1';
    } catch {
      return false;
    }
  }
}
