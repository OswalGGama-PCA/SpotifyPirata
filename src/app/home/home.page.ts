import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonIcon, 
  IonProgressBar, 
  IonButton, 
  IonItem, 
  IonBadge,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { 
  refreshOutline, 
  locationOutline, 
  flag,
  colorWandOutline
} from 'ionicons/icons';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonIcon, 
    IonProgressBar, 
    IonButton, 
    IonItem, 
    IonBadge,
    IonSkeletonText
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  currentTheme = 'dark';
  progress = 0;
  artists: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient, 
    private themeService: ThemeService,
    private router: Router
  ) {
    addIcons({
      refreshOutline,
      locationOutline,
      flag,
      colorWandOutline
    });
  }

  async ngOnInit() {
    // Suscribirse al tema actual para lógica condicional (ej. textos "PIRATA")
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    this.loadArtists();
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

      setTimeout(() => resolve(artists), 400);
    });
  }

  onSlideChange(event: any) {
    const swiper = event.target.swiper;
    if (this.artists.length > 0) {
      this.progress = (swiper.realIndex + 1) / this.artists.length;
    }
  }

  async reloadArtists() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.artists = [];
    await this.loadArtists();
  }

  getCurrentThemeLabel(): string {
    return this.themeService.getThemeLabel(this.currentTheme);
  }
}
