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
}
