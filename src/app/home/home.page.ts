import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonProgressBar,
  IonButton,
  IonSkeletonText,
  IonRippleEffect,
  ModalController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  locationOutline,
  flag,
  colorWandOutline,
  playCircleOutline,
  play
} from 'ionicons/icons';
import { ThemeService } from '../services/theme.service';
import { MusicService } from '../services/music.service';
import { DeezerService } from '../services/deezer.service';
import { SongsModalPage } from '../songs-modal/songs-modal.page';

// 1. Import register to initialize Swiper Web Components
import { register } from 'swiper/element/bundle';

// Initialize Swiper Elements
register();

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
    IonSkeletonText,
    IonRippleEffect
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  currentTheme = 'dark';
  progress = 0;
  artists: any[] = [];
  isLoading = true;

  constructor(
    private themeService: ThemeService,
    private musicService: MusicService,
    private deezerService: DeezerService,
    private modalController: ModalController,
    private router: Router
  ) {
    addIcons({
      refreshOutline,
      locationOutline,
      flag,
      colorWandOutline,
      playCircleOutline,
      play
    });
  }

  ngOnInit() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.loadArtists();
  }

  /**
   * Carga los artistas con mapeo defensivo para evitar "undefined"
   */
  async loadArtists() {
    this.isLoading = true;
    this.musicService.getArtists().subscribe({
      next: (data: any) => {
        // Mapeo defensivo: asegura que 'title' e 'img' existan para el HTML
        const artistsData = Array.isArray(data) ? data : (data.artists || []);

        this.artists = artistsData.map((a: any) => ({
          id: a.id,
          title: a.name || a.title || 'Artista desconocido',
          img: a.image || a.img || a.avatar || 'assets/default-artist.png',
          genre: (a.genres && a.genres.length > 0) ? a.genres[0] : 'Género variado',
          followers: a.followers || 0
        }));

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar artistas:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Muestra las canciones del artista usando la API de Deezer (Data Real)
   */
  async showSongsByArtist(artist: any) {
    // Usamos el nombre del artista para buscar sus canciones en Deezer
    const query = `artist:"${artist.title}"`;

    this.deezerService.searchTracks(query).subscribe({
      next: async (data: any[]) => {
        // Limitamos a 5 canciones para el modal
        const mappedSongs = data.slice(0, 5).map(track => ({
          id: track.id,
          name: track.title,
          album: track.album.title,
          image: track.album.cover_medium,
          preview: track.preview
        }));

        const modal = await this.modalController.create({
          component: SongsModalPage,
          componentProps: {
            artistName: artist.title,
            songs: mappedSongs
          },
          breakpoints: [0, 0.5, 0.9],
          initialBreakpoint: 0.9,
          cssClass: 'custom-songs-modal'
        });

        await modal.present();

        // Manejamos el cierre del modal para saber si quiere ir a ver más
        const { data: modalResult } = await modal.onDidDismiss();
        if (modalResult?.goToMusic) {
          this.router.navigate(['/menu/music'], {
            queryParams: { q: artist.title }
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar canciones de Deezer:', err);
      }
    });
  }

  onSlideChange(event: any) {
    const swiper = event.target.swiper;
    if (this.artists.length > 0 && swiper) {
      this.progress = (swiper.realIndex + 1) / this.artists.length;
    }
  }

  async reloadArtists() {
    this.artists = [];
    this.musicService.refreshArtists().subscribe({
      next: (data) => this.loadArtists() // Recargamos usando el mapeo defensivo
    });
  }

  getCurrentThemeLabel(): string {
    return this.themeService.getThemeLabel(this.currentTheme);
  }
}
