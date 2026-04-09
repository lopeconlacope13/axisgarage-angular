import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP que añade el token JWT en la cabecera Authorization
 * de todas las peticiones que no sean públicas.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // No enviar token para rutas de login o registro
  if (req.url.includes('/authenticate') || req.url.includes('/register')) {
    return next(req);
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
