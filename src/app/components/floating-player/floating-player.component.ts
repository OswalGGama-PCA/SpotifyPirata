import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonIcon,
  IonThumbnail
} from '@ionic/angular/standalone';
import { PlayerService } from '../../services/player.service';
import { addIcons } from 'ionicons';
import { play, pause, playCircle, pauseCircle, closeCircle } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-floating-player',
  templateUrl: './floating-player.component.html',
  styleUrls: ['./floating-player.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,

    IonThumbnail
  ]
})
export class FloatingPlayerComponent implements OnInit, OnDestroy {
  currentTrack: any = null;
  isPlaying: boolean = false;
  progress: number = 0;
  duration: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(private playerService: PlayerService) {
    addIcons({ play, pause, playCircle, pauseCircle, closeCircle });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.playerService.currentTrack$.subscribe((track: any) => {
        this.currentTrack = track;
      }),
      this.playerService.isPlaying$.subscribe((playing: boolean) => {
        this.isPlaying = playing;
      }),
      this.playerService.progress$.subscribe((progress: number) => {
        this.progress = progress;
      }),
      this.playerService.duration$.subscribe((duration: number) => {
        this.duration = duration;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  togglePlay() {
    this.playerService.togglePlay();
  }

  close() {
    this.playerService.stop();
  }

  seek(event: any) {
    const bar = event.target;
    const newTime = (event.offsetX / bar.clientWidth) * this.duration;
    this.playerService.seek(newTime);
  }

  formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    return (this.progress / this.duration) * 100 || 0;
  }
}
