import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes = ['light', 'dark', 'ocean', 'sunset', 'forest', 'pirate'];
  private themeLabels: Record<string, string> = {
    light: 'Claro',
    dark: 'Oscuro',
    ocean: 'Ocean',
    sunset: 'Atardecer',
    forest: 'Bosque',
    pirate: 'Pirata'
  };

  private currentThemeSubject = new BehaviorSubject<string>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(
    private storage: StorageService,
    private toastController: ToastController
  ) {
    this.initTheme();
  }

  private async initTheme() {
    const saved = await this.storage.get<string>('theme');
    const theme = (saved && this.themes.includes(saved)) ? saved : 'dark';
    this.applyTheme(theme);
  }

  private applyTheme(theme: string) {
    // Remove old themes
    this.themes.forEach(t => document.body.classList.remove(`${t}-theme`));
    // Apply new
    document.body.classList.add(`${theme}-theme`);
    this.currentThemeSubject.next(theme);
  }

  async toggleTheme() {
    const current = this.currentThemeSubject.value;
    const index = this.themes.indexOf(current);
    const nextIdx = (index + 1) % this.themes.length;
    const nextTheme = this.themes[nextIdx];

    this.applyTheme(nextTheme);
    await this.storage.set('theme', nextTheme);
    this.showThemeToast(nextTheme);
  }

  getThemeLabel(theme: string): string {
    return this.themeLabels[theme] || theme;
  }

  private async showThemeToast(theme: string) {
    const label = this.getThemeLabel(theme);
    const toast = await this.toastController.create({
      message: `Tema: ${label}`,
      duration: 1200,
      position: 'bottom',
      cssClass: 'theme-toast'
    });
    await toast.present();
  }

  getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }
}
