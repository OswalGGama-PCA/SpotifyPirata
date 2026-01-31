import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, play, pause, heart, heartOutline, arrowForward } from 'ionicons/icons';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-songs-modal',
  templateUrl: './songs-modal.page.html',
  styleUrls: ['./songs-modal.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    CommonModule,
    FormsModule
  ]
})
export class SongsModalPage implements OnInit {
  @Input() artistName: string = '';
  @Input() songs: any[] = [];

  currentTrack: any = null;
  isPlaying: boolean = false;
  audio = new Audio();

  constructor(
    private modalController: ModalController,
    private favoritesService: FavoritesService
  ) {
    addIcons({ closeOutline, play, pause, heart, heartOutline, arrowForward });
  }

  ngOnInit() { }

  dismiss() {
    this.audio.pause();
    this.modalController.dismiss();
  }

  goToMusic() {
    this.audio.pause();
    this.modalController.dismiss({
      goToMusic: true
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

    this.audio.pause();
    this.currentTrack = track;
    this.audio.src = track.preview;
    this.audio.load();
    this.audio.play();
    this.isPlaying = true;

    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }

  isFavorite(track: any): boolean {
    return this.favoritesService.isFavorite(track.id);
  }

  async toggleFavorite(event: Event, track: any) {
    event.stopPropagation();
    await this.favoritesService.toggleFavorite(track);
  }
}
