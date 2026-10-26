import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// `inject()` only works while Angular is running the guard synchronously, so both services are
// taken before the first `await`.

/** Blocks the admin area for signed-out visitors, after restoring a returning admin's session. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ready();
  return auth.isAuthenticated() ? true : router.createUrlTree(['/admin/login']);
};

/** Keeps signed-in users away from the login page. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ready();
  return auth.isAuthenticated() ? router.createUrlTree(['/admin']) : true;
};
