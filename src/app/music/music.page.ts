import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonIcon,
  IonSkeletonText,
  IonButton,
  IonChip,
  IonBadge
} from '@ionic/angular/standalone';
import { JamendoService } from '../services/jamendo.service';
import { PlayerService } from '../services/player.service';
import { addIcons } from 'ionicons';
import { FavoritesService } from '../services/favorites.service';
import {
  play,
  pause,
  musicalNotes,
  timeOutline,
  searchOutline,
  heart,
  heartOutline,
  playSkipForward,
  playSkipBack,
  shuffle,
  repeat,
  list,
  closeCircle, playCircle } from 'ionicons/icons';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-music',
  templateUrl: './music.page.html',
  styleUrls: ['./music.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonIcon,
    IonSkeletonText,
    IonButton,
    IonChip,
    IonBadge,
    CommonModule,
    FormsModule
  ]
})
export class MusicPage implements OnInit, OnDestroy {
  tracks: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  // Observables del PlayerService
  currentTrack$ = this.playerService.currentTrack$;
  isPlaying$ = this.playerService.isPlaying$;

  private subscriptions = new Subscription();

  // Nuevas funcionalidades
  searchFilter: string = 'all'; // all, track, album, artist, playlist
  popularSearches: string[] = ['Top Hits 2024', 'Rock Clásico', 'Pop Latino', 'Reggaeton', 'Jazz'];
  recentSearches: string[] = [];
  showQueue: boolean = false;
  queue: any[] = [];
  currentIndex: number = 0;
  isShuffleOn: boolean = false;
  repeatMode: 'off' | 'all' | 'one' = 'off';

  constructor(
    private jamendoService: JamendoService,
    private route: ActivatedRoute,
    private favoritesService: FavoritesService,
    private playerService: PlayerService
  ) {
    addIcons({searchOutline,timeOutline,closeCircle,musicalNotes,pause,play,playCircle,shuffle,playSkipBack,playSkipForward,repeat,list,heart,heartOutline});

    // Cargar búsquedas recientes del localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      this.recentSearches = JSON.parse(saved);
    }
  }

  ngOnInit() {
    // Detectar si venimos con una búsqueda predefinida
    const queryParams = this.route.queryParams.subscribe(params => {
      if (params['q']) {
        const query = params['q'];
        this.searchTerm = query;
        this.search(query);
      } else {
        // Carga inicial por defecto
        this.search('Top Hits 2024');
      }
    });
    this.subscriptions.add(queryParams);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isFavorite(track: any): boolean {
    return this.favoritesService.isFavorite(track.id);
  }

  async toggleFavorite(event: Event, track: any) {
    event.stopPropagation();
    await this.favoritesService.toggleFavorite(track);
  }

  handleSearch(event: any) {
    const query = event.target.value;
    this.search(query);
  }

  search(query: string) {
    if (!query || query.length < 2) return;

    this.isLoading = true;
    this.searchTerm = query;

    // Agregar a búsquedas recientes
    this.addToRecentSearches(query);

    // Buscar en Jamendo
    this.jamendoService.searchTracks(query).subscribe({
      next: (jamendoTracks) => {
        // Convertir tracks de Jamendo al formato de la app
        this.tracks = jamendoTracks.map(track => ({
          id: track.id,
          title: track.name,
          artist: track.artist_name,
          album: track.album_name,
          album_art: track.album_image || track.image,
          preview_url: track.audio,
          duration: track.duration,
          external_id: `jamendo:${track.id}`,
          source: 'jamendo',
          jamendo_data: track // Guardar datos originales
        }));

        this.queue = [...this.tracks];
        this.isLoading = false;
        console.log(`🎵 ${this.tracks.length} tracks encontrados en Jamendo`);
      },
      error: (err) => {
        console.error('Error buscando canciones en Jamendo:', err);
        this.isLoading = false;
      }
    });
  }

  quickSearch(term: string) {
    this.searchTerm = term;
    this.search(term);
  }

  addToRecentSearches(query: string) {
    // Evitar duplicados
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    // Agregar al inicio
    this.recentSearches.unshift(query);
    // Limitar a 5
    this.recentSearches = this.recentSearches.slice(0, 5);
    // Guardar en localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  removeRecentSearch(event: Event, search: string) {
    event.stopPropagation();
    this.recentSearches = this.recentSearches.filter(s => s !== search);
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  hasPreview(track: any): boolean {
    return !!(track?.preview_url || track?.preview);
  }

  togglePlay(track: any) {
    this.playerService.playTrack(track);
  }

  playTrack(track: any) {
    // En Jamendo todos los tracks tienen audio completo
    this.currentIndex = this.queue.findIndex(t => t.id === track.id);
    this.playerService.playTrack(track);
  }

  playNext() {
    if (this.queue.length === 0) return;

    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.queue.length) {
      nextIndex = 0; // Volver al inicio
    }

    this.playTrack(this.queue[nextIndex]);
  }

  playPrevious() {
    if (this.queue.length === 0) return;

    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.queue.length - 1; // Ir al final
    }

    this.playTrack(this.queue[prevIndex]);
  }

  toggleShuffle() {
    this.isShuffleOn = !this.isShuffleOn;

    if (this.isShuffleOn) {
      // Mezclar la cola (excepto la canción actual)
      const current = this.queue[this.currentIndex];
      const rest = this.queue.filter((_, i) => i !== this.currentIndex);
      this.queue = [current, ...this.shuffleArray(rest)];
      this.currentIndex = 0;
    } else {
      // Restaurar orden original
      this.queue = [...this.tracks];
    }
  }

  toggleRepeat() {
    if (this.repeatMode === 'off') {
      this.repeatMode = 'all';
    } else if (this.repeatMode === 'all') {
      this.repeatMode = 'one';
    } else {
      this.repeatMode = 'off';
    }
  }

  shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  toggleQueue() {
    this.showQueue = !this.showQueue;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
