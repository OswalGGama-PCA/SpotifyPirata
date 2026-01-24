import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class IntroGuard implements CanActivate {
  constructor(
    private storage: StorageService, 
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const user = this.authService.currentUser;
    
    // Si no hay usuario (caso raro si authGuard pasó), redirigir
    if (!user) {
      return this.router.parseUrl('/login');
    }

    const key = `introSeen_${user.id}`;
    const seen = await this.storage.get<boolean>(key);
    
    if (seen) return true;
    return this.router.parseUrl('/intro');
  }
}
