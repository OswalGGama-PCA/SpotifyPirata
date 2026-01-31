import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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

  // Cache en memoria para optimizar el rendimiento
  private artistsCache: any[] = [];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de artistas desde el backend
   * Utiliza una estrategia de cache-first para evitar peticiones innecesarias
   */
  getArtists(): Observable<any[]> {
    if (this.artistsCache.length > 0) {
      return of(this.artistsCache);
    }

    return this.http.get<any[]>(`${this.BASE_URL}/artists`).pipe(
      tap(data => {
        // Corrección de imagen para BZRP (La de la API suele fallar)
        const bzrp = data.find(a => a.name === 'BZRP');
        if (bzrp) {
          bzrp.image = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bizarrap_in_2024.jpg';
        }
        this.artistsCache = data;
      }),
      catchError(error => {
        console.error('Error fetching artists:', error);
        return of([]);
      })
    );
  }

  /**
   * Fuerza la actualización de la lista de artistas
   */
  refreshArtists(): Observable<any[]> {
    this.artistsCache = [];
    return this.getArtists();
  }

  /**
   * Obtiene los detalles de un artista por ID
   */
  getArtistById(id: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/artists/${id}`);
  }

  /**
   * Obtiene todos los álbumes
   */
  getAlbums(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/albums`);
  }

  /**
   * Obtiene tracks de un artista específico (Requisito Modal)
   */
  getTracksByArtist(artistId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tracks/artist/${artistId}`);
  }

  /**
   * Busca canciones por término
   */
  searchTracks(query: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/search_track`, { q: query });
  }
}
