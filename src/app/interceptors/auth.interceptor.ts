import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { from } from 'rxjs';

/**
 * Interceptor HTTP para agregar token de autenticación
 * 
 * Funcionalidades:
 * - Agrega automáticamente el token a todas las peticiones
 * - Maneja errores 401 (no autorizado)
 * - Intenta refrescar el token automáticamente
 * 
 * Configuración en app.config.ts:
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([authInterceptor]))
 *   ]
 * };
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // URLs que no requieren token
  const publicUrls = ['/login', '/register', '/refresh'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  if (isPublicUrl) {
    return next(req);
  }

  // Agregar token a la petición
  return from(authService.getToken()).pipe(
    switchMap(token => {
      // Clonar la petición y agregar el header de autorización
      const authReq = token
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          })
        : req;

      // Continuar con la petición
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si es error 401, intentar refrescar el token
          if (error.status === 401 && !req.url.includes('/refresh')) {
            return from(authService.refreshToken()).pipe(
              switchMap(newToken => {
                if (newToken) {
                  // Reintentar la petición con el nuevo token
                  const retryReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`
                    }
                  });
                  return next(retryReq);
                }
                
                // Si no se pudo refrescar, hacer logout
                return throwError(() => error);
              }),
              catchError(refreshError => {
                // Error al refrescar, hacer logout
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          }

          return throwError(() => error);
        })
      );
    })
  );
};
