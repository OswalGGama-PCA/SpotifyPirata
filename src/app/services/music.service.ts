import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de artistas desde el backend
   */
  getArtists(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/artists`);
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
