import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'favorites';
  private favorites: any[] = [];
  // Observable para que los componentes reaccionen a cambios en tiempo real
  public favorites$ = new BehaviorSubject<any[]>([]);

  constructor(private storage: StorageService) {
    this.loadFavorites();
  }

  async loadFavorites() {
    this.favorites = await this.storage.get(this.STORAGE_KEY) || [];
    this.favorites$.next(this.favorites);
  }

  getFavorites() {
    return this.favorites;
  }

  isFavorite(trackId: number): boolean {
    return this.favorites.some(t => t.id === trackId);
  }

  async toggleFavorite(track: any) {
    if (this.isFavorite(track.id)) {
      await this.removeFavorite(track.id);
    } else {
      await this.addFavorite(track);
    }
  }

  async addFavorite(track: any) {
    if (this.isFavorite(track.id)) return;
    this.favorites.push(track);
    await this.save();
  }

  async removeFavorite(trackId: number) {
    this.favorites = this.favorites.filter(t => t.id !== trackId);
    await this.save();
  }

  private async save() {
    await this.storage.set(this.STORAGE_KEY, this.favorites);
    this.favorites$.next(this.favorites);
  }
}
