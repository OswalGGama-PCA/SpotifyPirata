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
import { DeezerService } from '../services/deezer.service';
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
  closeCircle
} from 'ionicons/icons';

import { ActivatedRoute } from '@angular/router';

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

  // Audio Player State
  currentTrack: any = null;
  isPlaying: boolean = false;
  audio = new Audio();

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
    private deezerService: DeezerService,
    private route: ActivatedRoute,
    private favoritesService: FavoritesService
  ) {
    addIcons({
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
      closeCircle
    });

    // Cargar búsquedas recientes del localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      this.recentSearches = JSON.parse(saved);
    }
  }

  ngOnInit() {
    // Detectar si venimos con una búsqueda predefinida
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        const query = params['q'];
        this.searchTerm = query;
        this.search(query);
      } else {
        // Carga inicial por defecto
        this.search('Top Hits 2024');
      }
    });

    // Event listeners para el audio
    this.audio.addEventListener('ended', () => this.onTrackEnded());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
  }

  ngOnDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
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

    this.deezerService.searchTracks(query).subscribe({
      next: (data) => {
        this.tracks = data;
        this.queue = [...data]; // Inicializar cola con resultados
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error buscando en Deezer:', err);
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

  togglePlay(track: any) {
    // Si es la misma canción, pausar/reanudar
    if (this.currentTrack?.id === track.id) {
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      } else {
        this.audio.play();
        this.isPlaying = true;
      }
      return;
    }

    // Nueva canción
    this.playTrack(track);
  }

  playTrack(track: any) {
    if (this.audio) {
      this.audio.pause();
    }

    this.currentTrack = track;
    this.currentIndex = this.queue.findIndex(t => t.id === track.id);
    this.audio.src = track.preview;
    this.audio.load();
    this.audio.play();
    this.isPlaying = true;
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
      this.currentIndex = this.queue.findIndex(t => t.id === this.currentTrack?.id);
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

  onTrackEnded() {
    if (this.repeatMode === 'one') {
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (this.repeatMode === 'all' || this.currentIndex < this.queue.length - 1) {
      this.playNext();
    } else {
      this.isPlaying = false;
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

  formatCurrentTime(): string {
    if (!this.audio || !this.audio.currentTime) return '0:00';
    return this.formatDuration(Math.floor(this.audio.currentTime));
  }

  formatTotalTime(): string {
    if (!this.audio || !this.audio.duration) return '0:00';
    return this.formatDuration(Math.floor(this.audio.duration));
  }

  getProgress(): number {
    if (!this.audio || !this.audio.duration) return 0;
    return (this.audio.currentTime / this.audio.duration) * 100;
  }

  updateProgress() {
    // Forzar detección de cambios para la barra de progreso
  }

  seekTo(event: any) {
    const progressBar = event.target;
    const clickX = event.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;

    if (this.audio && this.audio.duration) {
      this.audio.currentTime = this.audio.duration * percentage;
    }
  }
}
