import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP que añade el token JWT en la cabecera Authorization
 * de todas las peticiones que no sean públicas.
 *
 * Además, si el backend devuelve un 401 (token expirado o inválido),
 * cierra la sesión automáticamente y redirige al usuario al inicio.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // No enviar token para rutas de login o registro
  if (req.url.includes('/authenticate') || req.url.includes('/register')) {
    return next(req);
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      // Solo cerramos sesión si el usuario tenía un token activo (sesión iniciada).
      // Si no hay token, el 401 puede venir de un recurso que simplemente requiere
      // autenticación para ciertas operaciones, y no debemos redirigir al home.
      if (err.status === 401 && token) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
