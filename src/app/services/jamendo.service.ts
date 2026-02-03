import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  artist_id: string;
  album_name: string;
  album_id: string;
  album_image: string;
  duration: number;
  audio: string;
  audiodownload: string;
  image: string;
  license_ccurl: string;
  position: number;
  releasedate: string;
}

export interface JamendoArtist {
  id: string;
  name: string;
  website: string;
  image: string;
  shorturl: string;
}

export interface JamendoAlbum {
  id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  image: string;
  releasedate: string;
}

@Injectable({
  providedIn: 'root'
})
export class JamendoService {
  private readonly BASE_URL = 'https://api.jamendo.com/v3.0';
  private readonly CLIENT_ID = '889efe26'; // Client ID de la aplicación
  
  // Formato de audio
  private readonly AUDIO_FORMAT = 'mp32'; // mp31 (96kbps), mp32 (VBR), ogg, flac

  constructor(private http: HttpClient) {}

  /**
   * Busca tracks en Jamendo
   * @param query Término de búsqueda
   * @param limit Cantidad de resultados (máximo 200)
   */
  searchTracks(query: string, limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('search', query)
      .set('audioformat', this.AUDIO_FORMAT)
      .set('include', 'musicinfo')
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/tracks`, { params }).pipe(
      map(response => {
        console.log('🔍 Respuesta completa de Jamendo:', response);
        console.log('🎵 Jamendo tracks:', response.results?.length || 0);
        return this.mapTracks(response.results || []);
      }),
      catchError(error => {
        console.error('❌ Error buscando en Jamendo:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene tracks por artista
   */
  getTracksByArtist(artistId: string, limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('artist_id', artistId)
      .set('audioformat', this.AUDIO_FORMAT)
      .set('include', 'musicinfo')
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/tracks`, { params }).pipe(
      map(response => this.mapTracks(response.results || [])),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene detalles de un track específico
   */
  getTrack(trackId: string): Observable<JamendoTrack | null> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('id', trackId)
      .set('audioformat', this.AUDIO_FORMAT)
      .set('include', 'musicinfo')
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/tracks`, { params }).pipe(
      map(response => {
        const tracks = this.mapTracks(response.results || []);
        return tracks.length > 0 ? tracks[0] : null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Busca artistas
   */
  searchArtists(query: string, limit: number = 20): Observable<JamendoArtist[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('search', query)
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/artists`, { params }).pipe(
      map(response => response.results || []),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene detalles de un artista
   */
  getArtist(artistId: string): Observable<JamendoArtist | null> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('id', artistId)
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/artists`, { params }).pipe(
      map(response => {
        const artists = response.results || [];
        return artists.length > 0 ? artists[0] : null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Obtiene álbumes de un artista
   */
  getArtistAlbums(artistId: string, limit: number = 20): Observable<JamendoAlbum[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('artist_id', artistId)
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/albums`, { params }).pipe(
      map(response => response.results || []),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene tracks populares
   */
  getPopularTracks(limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('order', 'popularity_total')
      .set('audioformat', this.AUDIO_FORMAT)
      .set('include', 'musicinfo')
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/tracks`, { params }).pipe(
      map(response => this.mapTracks(response.results || [])),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene tracks por género/tag
   */
  getTracksByTag(tag: string, limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('tags', tag)
      .set('audioformat', this.AUDIO_FORMAT)
      .set('include', 'musicinfo')
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/tracks`, { params }).pipe(
      map(response => this.mapTracks(response.results || [])),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene tracks de radio/playlist
   */
  getRadioTracks(limit: number = 20): Observable<JamendoTrack[]> {
    const params = new HttpParams()
      .set('client_id', this.CLIENT_ID)
      .set('format', 'json')
      .set('limit', limit.toString())
      .set('order', 'releasedate_desc')
      .set('audioformat', this.AUDIO_FORMAT)
      .set('include', 'musicinfo')
      .set('imagesize', '500');

    return this.http.get<any>(`${this.BASE_URL}/tracks`, { params }).pipe(
      map(response => this.mapTracks(response.results || [])),
      catchError(() => of([]))
    );
  }

  /**
   * Mapea los tracks de Jamendo a un formato consistente
   */
  private mapTracks(tracks: any[]): JamendoTrack[] {
    return tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      artist_id: track.artist_id,
      album_name: track.album_name,
      album_id: track.album_id,
      album_image: track.album_image || track.image,
      duration: track.duration,
      audio: track.audio || '',
      audiodownload: track.audiodownload || '',
      image: track.image || track.album_image,
      license_ccurl: track.license_ccurl || '',
      position: track.position || 0,
      releasedate: track.releasedate || ''
    }));
  }

  /**
   * Convierte un track de Jamendo al formato usado en la app
   */
  convertToAppFormat(track: JamendoTrack): any {
    return {
      id: track.id,
      name: track.name,
      artists: [{ name: track.artist_name, id: track.artist_id }],
      album: {
        name: track.album_name,
        images: [{ url: track.album_image || track.image }]
      },
      duration_ms: track.duration * 1000,
      preview: track.audio,
      preview_url: track.audio,
      external_urls: {
        jamendo: `https://www.jamendo.com/track/${track.id}`
      }
    };
  }

  /**
   * Obtiene tags/géneros disponibles
   */
  async getTags(): Promise<string[]> {
    // Tags populares de Jamendo
    return [
      'pop', 'rock', 'electronic', 'jazz', 'classical',
      'hiphop', 'metal', 'folk', 'country', 'reggae',
      'blues', 'ambient', 'instrumental', 'dance', 'indie'
    ];
  }
}
