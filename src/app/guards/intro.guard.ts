import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class IntroGuard implements CanActivate {
  constructor(private storage: StorageService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const seen = await this.storage.get<boolean>('introSeen');
    if (seen) return true;
    return this.router.parseUrl('/intro');
  }
}
