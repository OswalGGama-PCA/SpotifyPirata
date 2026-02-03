import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonMenuButton,
  IonBadge
} from '@ionic/angular/standalone';
import { FavoritesService } from '../services/favorites.service';
import { PlayerService } from '../services/player.service';
import { addIcons } from 'ionicons';
import { play, pause, trashOutline, musicalNotes, playCircle, pauseCircle } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-library',
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonBadge
  ]
})
export class LibraryPage implements OnInit, OnDestroy {
  favorites: any[] = [];

  // Observables del PlayerService
  currentTrack$ = this.playerService.currentTrack$;
  isPlaying$ = this.playerService.isPlaying$;

  private subscriptions = new Subscription();

  constructor(
    private favoritesService: FavoritesService,
    private playerService: PlayerService
  ) {
    addIcons({ play, pause, trashOutline, musicalNotes, playCircle, pauseCircle });
  }

  ngOnInit() {
    const favSub = this.favoritesService.favorites$.subscribe(favs => {
      this.favorites = favs;
    });
    this.subscriptions.add(favSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  togglePlay(track: any) {
    this.playerService.playTrack(track);
  }

  hasPreview(track: any): boolean {
    return !!(track?.preview_url || track?.preview);
  }

  async removeFavorite(event: Event, track: any) {
    event.stopPropagation();
    await this.favoritesService.removeFavorite(track.id);
  }

  // Helper para obtener la URL de la carátula del álbum
  getAlbumCover(track: any, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: 2,
      medium: 1,
      large: 0
    };

    if (track.album_art) return track.album_art;

    if (track.album?.images) {
      const idx = sizeMap[size];
      const img = track.album.images[idx] || track.album.images[0];
      if (img?.url) return img.url;
    }

    if (track.image) return track.image;

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

  // Manejar errores de carga de imagen
  onImageError(event: any) {
    event.target.src = 'assets/default-album.png';
  }
}

