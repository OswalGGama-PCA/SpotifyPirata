import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

/**
 * Servicio de Favoritos - Almacenamiento local con Jamendo
 */
@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'jamendo_favorites';

  private favorites: any[] = [];
  public favorites$ = new BehaviorSubject<any[]>([]);

  constructor(
    private storage: StorageService
  ) {
    this.init();
  }

  async init() {
    await this.loadLocalFavorites();
  }

  private async loadLocalFavorites() {
    const local = await this.storage.get(this.STORAGE_KEY) || [];
    this.favorites = local;
    this.favorites$.next(this.favorites);
  }

  /**
   * Obtiene la lista de favoritos (desde cache)
   */
  getFavorites() {
    return this.favorites;
  }

  isFavorite(trackId: string | number): boolean {
    const id = String(trackId);
    return this.favorites.some(t => String(t.id) === id);
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

    // Guardar localmente
    this.favorites.push(track);
    await this.storage.set(this.STORAGE_KEY, this.favorites);
    this.favorites$.next(this.favorites);
    console.log(`✅ Favorito agregado: ${track.title || track.name}`);
  }

  async removeFavorite(trackId: string | number) {
    const id = String(trackId);
    this.favorites = this.favorites.filter(t => String(t.id) !== id);
    await this.storage.set(this.STORAGE_KEY, this.favorites);
    this.favorites$.next(this.favorites);
    console.log(`❌ Favorito eliminado: ${id}`);
  }

  async clearAllFavorites() {
    this.favorites = [];
    await this.storage.set(this.STORAGE_KEY, []);
    this.favorites$.next([]);
  }

  /**
   * Recarga los favoritos desde storage
   */
  async refreshFavorites() {
    await this.loadLocalFavorites();
  }
}
