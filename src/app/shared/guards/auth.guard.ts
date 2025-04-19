import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isAuthenticatedGuard = (): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If auth is not initialized yet, wait for it
    if (!authService.isAuthInitialized()) {
      return new Promise<boolean>((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait time
        const checkAuth = setInterval(() => {
          attempts++;
          if (authService.isAuthInitialized()) {
            clearInterval(checkAuth);
            if (authService.user()) {
              resolve(true);
            } else {
              resolve(router.parseUrl('auth/login') as any);
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(checkAuth);
            console.error('Auth guard timeout: Auth state not initialized in time');
            resolve(router.parseUrl('auth/login') as any);
          }
        }, 100);
      });
    }

    if (authService.user()) {
      return true;
    }

    return router.parseUrl('auth/login');
  };
};
