import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonSkeletonText,
  IonRippleEffect,
  IonSearchbar,
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
  play,
  heart,
  musicalNotes,
  people,
  searchOutline
} from 'ionicons/icons';
import { ThemeService } from '../services/theme.service';
import { JamendoService } from '../services/jamendo.service';
import { PlayerService } from '../services/player.service';
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
    FormsModule,
    IonContent,
    IonIcon,
    IonButton,
    IonSkeletonText,
    IonRippleEffect,
    IonSearchbar
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  currentTheme = 'dark';
  progress = 0;
  artists: any[] = [];
  isLoading = true;

  // Nuevas secciones
  trendingSong: any = null;
  playlists: any[] = [];
  genres: any[] = [];
  searchTerm = '';

  constructor(
    private themeService: ThemeService,
    private jamendoService: JamendoService,
    private playerService: PlayerService,
    private modalController: ModalController,
    private router: Router
  ) {
    addIcons({
      refreshOutline,
      locationOutline,
      flag,
      colorWandOutline,
      playCircleOutline,
      play,
      heart,
      musicalNotes,
      people,
      searchOutline
    });
  }

  ngOnInit() {
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.loadAllContent();
  }

  /**
   * Carga todo el contenido de la página
   */
  async loadAllContent() {
    this.isLoading = true;
    await Promise.all([
      this.loadArtists(),
      this.loadTrendingSong(),
      this.loadGenres(),
      this.loadPlaylists()
    ]);
    this.isLoading = false;
  }

  /**
   * Carga la canción trending del momento usando Jamendo
   */
  async loadTrendingSong() {
    this.jamendoService.getPopularTracks(1).subscribe({
      next: (tracks) => {
        if (tracks && tracks.length > 0) {
          const track = tracks[0];
          this.trendingSong = {
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            albumArt: track.album_image || track.image,
            preview: track.audio
          };
        }
      },
      error: (err) => console.error('Error loading trending:', err)
    });
  }

  /**
   * Carga géneros musicales populares
   */
  loadGenres() {
    this.genres = [
      { id: 1, name: 'Rock', image: 'assets/genres/rock.jpg', color: '#E13300' },
      { id: 2, name: 'Pop', image: 'assets/genres/pop.jpg', color: '#FF6B9D' },
      { id: 3, name: 'Hip Hop', image: 'assets/genres/hiphop.jpg', color: '#FFD700' },
      { id: 4, name: 'Electrónica', image: 'assets/genres/electronic.jpg', color: '#00D9FF' },
      { id: 5, name: 'Jazz', image: 'assets/genres/jazz.jpg', color: '#8E44AD' },
      { id: 6, name: 'Reggaeton', image: 'assets/genres/reggaeton.jpg', color: '#1DB954' }
    ];
  }

  /**
   * Carga playlists destacadas usando Jamendo tags
   */
  async loadPlaylists() {
    const playlistTags = ['workout', 'chill', 'party', 'study'];

    for (const tag of playlistTags) {
      this.jamendoService.getTracksByTag(tag, 1).subscribe({
        next: (tracks) => {
          if (tracks && tracks.length > 0) {
            const track = tracks[0];
            this.playlists.push({
              id: this.playlists.length + 1,
              name: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Mix`,
              image: track.album_image || track.image || 'assets/default-playlist.png',
              trackCount: Math.floor(Math.random() * 50) + 20
            });
          }
        }
      });
    }
  }

  /**
   * Carga artistas populares desde Jamendo
   */
  async loadArtists() {
    this.jamendoService.searchArtists('popular', 10).subscribe({
      next: (artists) => {
        this.artists = artists.map((a: any) => ({
          id: a.id,
          title: a.name || 'Artista desconocido',
          img: a.image || 'assets/default-artist.png',
          genre: 'Varios',
          followers: 0
        }));
      },
      error: (err) => {
        console.error('Error al cargar artistas:', err);
      }
    });
  }

  /**
   * Búsqueda rápida
   */
  quickSearch(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
      this.router.navigate(['/menu/music'], {
        queryParams: { q: query }
      });
    }
  }

  /**
   * Navega a una sección específica
   */
  navigateTo(section: string) {
    switch (section) {
      case 'favorites':
        this.router.navigate(['/menu/library']);
        break;
      case 'music':
        this.router.navigate(['/menu/music']);
        break;
      case 'artists':
        this.router.navigate(['/menu/artists']);
        break;
    }
  }

  /**
   * Reproduce la canción trending
   */
  playTrending() {
    if (this.trendingSong && this.trendingSong.preview) {
      this.playerService.playTrack({
        id: this.trendingSong.id,
        name: this.trendingSong.title,
        title: this.trendingSong.title,
        artist: this.trendingSong.artist,
        album_art: this.trendingSong.albumArt,
        preview_url: this.trendingSong.preview
      });
    }
  }

  /**
   * Navega a un género específico
   */
  exploreGenre(genre: any) {
    this.router.navigate(['/menu/music'], {
      queryParams: { q: genre.name }
    });
  }

  /**
   * Abre una playlist
   */
  openPlaylist(playlist: any) {
    this.router.navigate(['/menu/music'], {
      queryParams: { q: playlist.name }
    });
  }

  /**
   * Muestra las canciones del artista usando Jamendo
   */
  async showSongsByArtist(artist: any) {
    this.jamendoService.searchTracks(artist.title, 10).subscribe({
      next: async (tracks) => {
        const mappedSongs = tracks.slice(0, 5).map(track => ({
          id: track.id,
          name: track.name,
          album: track.album_name || 'Álbum Desconocido',
          image: track.album_image || track.image || 'assets/default-album.png',
          preview: track.audio
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

        const { data: modalResult } = await modal.onDidDismiss();
        if (modalResult?.goToMusic) {
          this.router.navigate(['/menu/music'], {
            queryParams: { q: artist.title }
          });
        }
      },
      error: (err: any) => {
        console.error('Error al cargar canciones de Jamendo:', err);
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
    await this.loadArtists();
  }

  getCurrentThemeLabel(): string {
    return this.themeService.getThemeLabel(this.currentTheme);
  }
}
