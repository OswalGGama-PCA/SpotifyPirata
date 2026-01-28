import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Servicio para conectar con la API de Música (Rails)
 * Proporciona acceso a artistas, álbumes y canciones
 */
@Injectable({
  providedIn: 'root'
})
export class MusicService {
  // URL base definida en la colección de Postman
  private readonly BASE_URL = 'https://music.fly.dev';

  // Cache en memoria para evitar peticiones redundantes
  private artistsCache: any[] = [];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de artistas desde el backend
   * Implementa estrategia Cache-First
   */
  getArtists(): Observable<any> {
    if (this.artistsCache.length > 0) {
      // Si ya tenemos datos, los devolvemos inmediatamente
      return of(this.artistsCache);
    }
    
    // Si no, hacemos la petición y guardamos en caché
    return this.http.get<any[]>(`${this.BASE_URL}/artists`).pipe(
      tap(data => {
        // CORRECCIÓN ESPECÍFICA: La imagen de BZRP de la API falla (403/Broken)
        // La reemplazamos manualmente por una segura
        const bzrp = data.find(a => a.name === 'BZRP');
        if (bzrp) {
          // Usamos una imagen de placeholders confiable o un asset local si lo tuviéramos
          // Por ahora usaré una URL pública estable de BZRP
          bzrp.image = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bizarrap_in_2024.jpg';
        }
        
        this.artistsCache = data;
      })
    );
  }

  /**
   * Fuerza la recarga de artistas ignorando el caché
   */
  refreshArtists(): Observable<any> {
    this.artistsCache = [];
    return this.getArtists();
  }

  /**
   * Obtiene la información detallada de un artista por su ID
   */
  getArtistById(id: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/artists/${id}`);
  }

  /**
   * Obtiene todos los álbumes disponibles
   */
  getAlbums(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/albums`);
  }

  /**
   * Obtiene los álbumes de un artista específico
   */
  getAlbumsByArtist(artistId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/albums/artist/${artistId}`);
  }

  /**
   * Obtiene todos los tracks
   */
  getTracks(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tracks`);
  }

  /**
   * Busca tracks por un término específico
   */
  searchTracks(query: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/search_track`, { q: query });
  }

  /**
   * Obtiene tracks por artista
   */
  getTracksByArtist(artistId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tracks/artist/${artistId}`);
  }

  /**
   * Obtiene tracks por álbum
   */
  getTracksByAlbum(albumId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tracks/album/${albumId}`);
  }
}
