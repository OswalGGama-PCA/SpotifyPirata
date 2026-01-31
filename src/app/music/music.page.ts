import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonIcon,
  IonSkeletonText,
  IonButton
} from '@ionic/angular/standalone';
import { DeezerService } from '../services/deezer.service';
import { addIcons } from 'ionicons';
import { FavoritesService } from '../services/favorites.service';
import { play, pause, musicalNotes, timeOutline, searchOutline, heart, heartOutline } from 'ionicons/icons';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-music',
  templateUrl: './music.page.html',
  styleUrls: ['./music.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonIcon,
    IonSkeletonText,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class MusicPage implements OnInit {
  tracks: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  // Audio Player State
  currentTrack: any = null;
  isPlaying: boolean = false;
  audio = new Audio();

  constructor(
    private deezerService: DeezerService,
    private route: ActivatedRoute,
    private favoritesService: FavoritesService
  ) {
    addIcons({ play, pause, musicalNotes, timeOutline, searchOutline, heart, heartOutline });
    console.log('MusicPage initialized');
  }

  isFavorite(track: any): boolean {
    return this.favoritesService.isFavorite(track.id);
  }

  async toggleFavorite(event: Event, track: any) {
    event.stopPropagation(); // Para no disparar el play al dar like
    await this.favoritesService.toggleFavorite(track);
  }

  ngOnInit() {
    // Detectar si venimos con una búsqueda predefinida (ej: desde Artistas)
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        const query = params['q'];
        this.searchTerm = query; // Para que aparezca en la barra
        this.search(query);
      } else {
        // Carga inicial por defecto si no hay búsqueda
        this.search('Top Hits');
      }
    });
  }

  handleSearch(event: any) {
    const query = event.target.value;
    this.search(query);
  }

  search(query: string) {
    if (!query || query.length < 2) return;

    this.isLoading = true;
    this.searchTerm = query;

    this.deezerService.searchTracks(query).subscribe({
      next: (data) => {
        this.tracks = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error buscando en Deezer:', err);
        this.isLoading = false;
      }
    });
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
    if (this.audio) {
      this.audio.pause();
    }

    this.currentTrack = track;
    this.audio.src = track.preview;
    this.audio.load();
    this.audio.play();
    this.isPlaying = true;

    // Reset al terminar
    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    if (!this.audio || !this.audio.duration) return 0;
    return (this.audio.currentTime / this.audio.duration) * 100;
  }
}
