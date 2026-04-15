import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN
 * ---------------------------------------------------------
 * Registra todos los servicios globales en el inyector raíz.
 * Usamos Zone.js estándar para que la detección de cambios funcione
 * automáticamente con suscripciones RxJS (llamadas HTTP al backend).
 *
 * provideTranslateHttpLoader: carga los archivos JSON de traducción
 * desde /i18n/ (carpeta public/ del proyecto → servida en la raíz).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideTranslateService({ defaultLanguage: 'en' }),
    ...provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
  ]
};
