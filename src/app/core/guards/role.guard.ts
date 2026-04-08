import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de roles para rutas restringidas a MANAGER / ADMIN.
 * TODO (Día 3): decodificar el JWT y leer el claim 'roles'.
 */
export const roleGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // TODO: extraer roles del JWT cuando esté jwt-decode instalado
  // const decoded: any = jwtDecode(token);
  // const roles: string[] = decoded.roles ?? [];
  // if (roles.includes('ROLE_MANAGER') || roles.includes('ROLE_ADMIN')) return true;

  router.navigate(['/forbidden']);
  return false;
};
