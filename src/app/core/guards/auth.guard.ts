import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas privadas.
 * Redirige a /forbidden si no hay token válido.
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
