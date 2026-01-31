import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonIcon,
  IonButton,
  IonButtons,
  IonMenuButton
} from '@ionic/angular/standalone';
import { FavoritesService } from '../services/favorites.service';
import { addIcons } from 'ionicons';
import { play, pause, trashOutline, musicalNotes } from 'ionicons/icons';

@Component({
  selector: 'app-library',
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonIcon,
    IonButton,
    IonButtons,
    IonMenuButton,
    CommonModule,
    FormsModule
  ]
})
export class LibraryPage implements OnInit {
  favorites: any[] = [];

  // Audio Player State
  currentTrack: any = null;
  isPlaying: boolean = false;
  audio = new Audio();

  constructor(private favoritesService: FavoritesService) {
    addIcons({ play, pause, trashOutline, musicalNotes });
  }

  ngOnInit() {
    this.favoritesService.favorites$.subscribe(favs => {
      this.favorites = favs;
    });
  }

  togglePlay(track: any) {
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

    if (this.audio) {
      this.audio.pause();
    }

    this.currentTrack = track;
    this.audio.src = track.preview;
    this.audio.load();
    this.audio.play();
    this.isPlaying = true;

    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }

  async removeFavorite(event: Event, track: any) {
    event.stopPropagation();
    await this.favoritesService.removeFavorite(track.id);
  }

  // Helper para obtener la URL de la carátula del álbum
  getAlbumCover(track: any, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: 'cover_small',
      medium: 'cover_medium',
      large: 'cover_big'
    };

    // Intentar obtener la imagen del álbum
    if (track.album) {
      const coverUrl = track.album[sizeMap[size]] || track.album.cover_medium || track.album.cover;
      if (coverUrl) return coverUrl;
    }

    // Fallback a la imagen directa del track si existe
    if (track.image) return track.image;
    if (track.cover_medium) return track.cover_medium;

    // Imagen por defecto
    return 'assets/default-album.png';
  }

  // Helper para obtener el nombre del artista
  getArtistName(track: any): string {
    if (track.artist?.name) return track.artist.name;
    if (track.artist) return track.artist;
    return 'Artista desconocido';
  }

  // Formatear duración
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Obtener progreso de reproducción
  getProgress(): number {
    if (!this.audio || !this.audio.duration) return 0;
    return (this.audio.currentTime / this.audio.duration) * 100;
  }

  // Manejar errores de carga de imagen
  onImageError(event: any) {
    event.target.src = 'assets/default-album.png';
  }
}
