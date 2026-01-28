import { Routes } from '@angular/router';
import { IntroGuard } from './guards/intro.guard';
import { authGuard, publicGuard } from './guards/auth.guard';

/**
 * FLUJO DE NAVEGACIÓN:
 * 
 * 1. Usuario NO autenticado:
 *    App → /login → Login exitoso → /intro → /menu/home
 * 
 * 2. Usuario autenticado (primera vez):
 *    App → /intro → /menu/home
 * 
 * 3. Usuario autenticado (recurrente):
 *    App → /menu/home (directo)
 * 
 * 4. Usuario autenticado intenta acceder a login/register:
 *    Redirige a /intro (IntroGuard decide si va a /menu/home)
 */

export const routes: Routes = [
  // Ruta raíz: Redirige a login por defecto
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // ============================================
  // RUTAS PÚBLICAS (Solo accesibles sin autenticación)
  // ============================================
  
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canActivate: [publicGuard] // Solo si NO está autenticado
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage),
    canActivate: [publicGuard] // Solo si NO está autenticado
  },

  // ============================================
  // RUTAS PROTEGIDAS (Requieren autenticación)
  // ============================================
  
  {
    path: 'intro',
    loadComponent: () => import('./intro/intro.page').then(m => m.IntroPage),
    canActivate: [authGuard] // Requiere estar autenticado
  },
  {
    path: 'menu',
    loadComponent: () => import('./menu/menu.page').then(m => m.MenuPage),
    canActivate: [authGuard], // Requiere autenticación
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
        canActivate: [IntroGuard] // Verifica que haya visto la intro
      },
      {
        path: 'artists',
        loadComponent: () => import('./artists/artists.page').then(m => m.ArtistsPage),
        canActivate: [IntroGuard]
      },
      {
        path: 'music',
        loadComponent: () => import('./music/music.page').then(m => m.MusicPage),
        canActivate: [IntroGuard]
      },
      {
        path: 'library',
        loadComponent: () => import('./library/library.page').then(m => m.LibraryPage),
        canActivate: [IntroGuard]
      },
       {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
        canActivate: [IntroGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // ============================================
  // WILDCARD (Debe ir al final)
  // ============================================
  
  {
    path: '**',
    redirectTo: 'login'
  },

];
