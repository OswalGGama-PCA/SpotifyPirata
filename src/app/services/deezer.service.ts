import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeezerService {
  // Usamos un proxy CORS si es necesario, pero intentaremos directo primero
  // Si falla por CORS en navegador, usaremos api.allorigins.win
  private readonly BASE_URL = 'https://api.deezer.com';
  // Proxy para evitar bloqueo CORS en desarrollo local
  // Cambiamos a corsproxy.io por mejor estabilidad
  private readonly CORS_PROXY = 'https://corsproxy.io/?';

  constructor(private http: HttpClient) { }

  /**
   * Busca canciones en Deezer
   * @param query Término de búsqueda (ej: 'Bad Bunny')
   */
  searchTracks(query: string): Observable<any[]> {
    const url = `${this.BASE_URL}/search?q=${encodeURIComponent(query)}`;
    // Usamos el proxy wrapping para desarrollo
    const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtiene detalles de un track específico
   */
  getTrack(id: number): Observable<any> {
    const url = `${this.BASE_URL}/track/${id}`;
    const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
    return this.http.get(proxyUrl);
  }
}
