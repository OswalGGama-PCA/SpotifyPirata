import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonFab, IonFabButton, IonIcon, IonProgressBar, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonFab, IonFabButton, IonIcon, IonProgressBar, IonButton, IonSpinner],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  currentTheme = 'light';
  themes = ['light', 'dark', 'ocean', 'sunset', 'forest', 'pirate'];

  progress = 0;

  artists: any[] = [];
  isLoading = true;

  // Friendly theme labels
  private themeLabels: Record<string, string> = {
    light: 'Claro',
    dark: 'Oscuro',
    ocean: 'Ocean',
    sunset: 'Atardecer',
    forest: 'Bosque',
    pirate: '☠️ PIRATA'
  };

  constructor(private http: HttpClient, private storageService: StorageService, private router: Router, private toastController: ToastController) {}

  async ngOnInit() {
    await this.restoreTheme();
    this.loadArtists();
  }

  private async restoreTheme() {
    const saved = await this.storageService.get<string>('theme');
    if (saved && this.themes.includes(saved)) {
      this.currentTheme = saved;
    }
    document.body.classList.add(`${this.currentTheme}-theme`);
  }

  async loadArtists() {
    this.isLoading = true;
    try {
      this.artists = await this.obtenerArtistas();
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private obtenerArtistas(): Promise<any[]> {
    const artistNames = [
      'Coldplay', 'Metallica', 'Beyonce', 'Bad Bunny', 'Daft Punk', 'Marc Anthony',
      'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Drake', 'Rihanna',
      'The Weeknd', 'Billie Eilish', 'Justin Bieber', 'Lady Gaga', 'Bruno Mars',
      'Adele', 'Queen', 'The Beatles', 'Michael Jackson', 'Madonna', 'Eminem',
      'Shakira', 'U2', 'Bob Marley', 'David Bowie'
    ];

    return new Promise(async (resolve) => {
      const requests = artistNames.map(name =>
        firstValueFrom(
          this.http.get(`https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(name)}`)
            .pipe(catchError(() => of(null)))
        )
      );

      const results = await Promise.allSettled(requests);
      const artists: any[] = [];

      results.forEach((r: any) => {
        if (r.status === 'fulfilled' && r.value && r.value.artists && r.value.artists.length > 0) {
          const a = r.value.artists[0];
          artists.push({
            title: a.strArtist,
            img: a.strArtistThumb || a.strArtistBanner || 'assets/default-artist.png',
            description: ((a.strBiographyEN || a.strBiographyES || 'No description available') + '').substring(0, 200) + '...',
            genre: a.strGenre,
            country: a.strCountry
          });
        }
      });

      // Pequeña demora para simular un proceso de carga (opcional)
      setTimeout(() => resolve(artists), 400);
    });
  }

  onSlideChange(event: any) {
    const [swiper] = event.detail;
    if (this.artists.length > 0) {
      this.progress = (swiper.realIndex + 1) / this.artists.length;
    }
  }

  async reloadArtists() {
    // Blur any active element and reset list, then re-trigger load
    (document.activeElement as HTMLElement | null)?.blur();
    this.artists = [];
    await this.loadArtists();
  }

  async cambiarColor() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    
    // Remover tema anterior
    document.body.classList.remove(`${this.currentTheme}-theme`);
    
    // Aplicar nuevo tema
    this.currentTheme = this.themes[nextIndex];
    document.body.classList.add(`${this.currentTheme}-theme`);

    await this.storageService.set('theme', this.currentTheme);

    // Mostrar toast con el tema actual
    await this.showThemeToast(this.currentTheme);
  }

  private async showThemeToast(base: string) {
    const label = this.themeLabels[base] || base;
    const toast = await this.toastController.create({
      message: `Tema: ${label}`,
      duration: 1200,
      position: 'bottom',
      cssClass: 'theme-toast'
    });
    await toast.present();
  }

  async goIntro() {
    (document.activeElement as HTMLElement | null)?.blur();
    await this.storageService.remove('introSeen');
    this.router.navigate(['/intro']);
  }
}