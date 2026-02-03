import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio = new Audio();
  public currentTrack$ = new BehaviorSubject<any>(null);
  public isPlaying$ = new BehaviorSubject<boolean>(false);
  public progress$ = new BehaviorSubject<number>(0);
  public duration$ = new BehaviorSubject<number>(0);

  constructor() {
    this.setupAudioListeners();
  }

  private setupAudioListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.progress$.next(this.audio.currentTime);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration$.next(this.audio.duration);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying$.next(false);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying$.next(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying$.next(false);
    });
  }

  playTrack(track: any) {
    if (!track?.preview_url && !track?.preview) {
      console.warn('No hay preview disponible para esta canción.');
      return false;
    }

    const previewUrl = track.preview_url || track.preview;
    this.currentTrack$.next(track);
    this.audio.src = previewUrl;
    this.audio.load();
    this.audio.play();
    this.isPlaying$.next(true);
    return true;
  }

  togglePlay() {
    if (this.isPlaying$.value) {
      this.audio.pause();
      this.isPlaying$.next(false);
    } else {
      this.audio.play();
      this.isPlaying$.next(true);
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying$.next(false);
  }

  stop() {
    this.audio.pause();
    this.audio.src = '';
    this.currentTrack$.next(null);
    this.isPlaying$.next(false);
    this.progress$.next(0);
    this.duration$.next(0);
  }

  seek(seconds: number) {
    this.audio.currentTime = seconds;
  }

  getCurrentTrack() {
    return this.currentTrack$.value;
  }

  getProgress() {
    return this.progress$.value;
  }

  getDuration() {
    return this.duration$.value;
  }

  getAudio() {
    return this.audio;
  }
}
