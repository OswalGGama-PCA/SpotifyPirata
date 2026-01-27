import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter, switchMap } from 'rxjs/operators';

/**
 * Guard de autenticación
 * Protege rutas que requieren que el usuario esté autenticado
 * 
 * Uso en app.routes.ts:
 * {
 *   path: 'home',
 *   loadComponent: () => import('./home/home.page').then(m => m.HomePage),
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperamos a que el servicio esté listo (que haya leído el storage)
  return authService.isReady$.pipe(
    filter(ready => ready),
    switchMap(() => authService.isAuthenticated$),
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Guardar la URL intentada para redirigir después del login
      const returnUrl = state.url;
      
      // Redirigir al login
      router.navigate(['/login'], {
        queryParams: { returnUrl },
        replaceUrl: true
      });

      return false;
    })
  );
};

/**
 * Guard para rutas públicas (login, register)
 * Redirige al intro si el usuario ya está autenticado
 * 
 * Uso en app.routes.ts:
 * {
 *   path: 'login',
 *   loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
 *   canActivate: [publicGuard]
 * }
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperamos a que el servicio esté listo
  return authService.isReady$.pipe(
    filter(ready => ready),
    switchMap(() => authService.isAuthenticated$),
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Si ya está autenticado, redirigir al home (el menú principal)
      // Si NO ha visto la intro, el IntroGuard de /menu/home lo redirigirá a /intro
      router.navigate(['/menu/home'], { replaceUrl: true });
      return false;
    })
  );
};
