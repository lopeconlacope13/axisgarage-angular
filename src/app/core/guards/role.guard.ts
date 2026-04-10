import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de roles para rutas restringidas a MANAGER / ADMIN.
 * ---------------------------------------------------------
 * Reutiliza getCurrentUser() de AuthService para extraer los roles
 * del JWT sin duplicar la lógica de decodificación (principio DRY).
 *
 * Acceso permitido: ROLE_ADMIN, ROLE_MANAGER
 * Acceso denegado:  redirige al home '/'
 */
export const roleGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Decodificamos el token y extraemos usuario + roles en un solo paso
  const user = auth.getCurrentUser();

  if (!user) {
    // No hay token válido — mandamos al login
    router.navigate(['/login']);
    return false;
  }

  // Verificamos si el usuario tiene rol con permisos de gestión
  const isAuthorized = user.roles.some(
    r => r === 'ROLE_ADMIN' || r === 'ROLE_MANAGER'
  );

  if (isAuthorized) return true;

  // Rol insuficiente (ej: ROLE_USER) — redirigimos al home
  router.navigate(['/']);
  return false;
};
