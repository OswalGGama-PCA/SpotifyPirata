import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// ============================================
// AUTH SERVICE
// ============================================

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API URL - Cambiar por tu backend real
  private readonly API_URL = 'https://tu-api.com/api/auth';
  
  // Storage keys
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  // Estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Para saber si ya terminamos de leer el storage al arrancar
  private isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$ = this.isReadySubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  /**
   * Carga la autenticación almacenada al iniciar la app
   */
  private async loadStoredAuth(): Promise<void> {
    try {
      const [token, user] = await Promise.all([
        this.storage.get<string>(this.TOKEN_KEY),
        this.storage.get<User>(this.USER_KEY)
      ]);

      if (token && user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
      
      // Ya terminamos de revisar, pase lo que pase
      this.isReadySubject.next(true);
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.isReadySubject.next(true); // También marcamos como listo si falla
    }
  }

  // ============================================
  // AUTENTICACIÓN
  // ============================================

  /**
   * Inicia sesión con email y contraseña
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // MODO DEMO: Simula autenticación exitosa
    // En producción, reemplazar con llamada HTTP real
    return this.simulateLogin(credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleError(error))
    );

    // PRODUCCIÓN: Descomentar cuando tengas backend
    // return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
    //   tap(response => this.handleAuthSuccess(response)),
    //   catchError(error => this.handleError(error))
    // );
  }

  /**
   * Registra un nuevo usuario
   */
  register(data: RegisterData): Observable<AuthResponse> {
    // MODO DEMO
    return this.simulateRegister(data).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleError(error))
    );

    // PRODUCCIÓN
    // return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
    //   tap(response => this.handleAuthSuccess(response)),
    //   catchError(error => this.handleError(error))
    // );
  }

  /**
   * Cierra la sesión del usuario
   * @param redirect - Si debe redirigir al login después del logout (default: true)
   */
  async logout(redirect: boolean = true): Promise<void> {
    try {
      // Opcional: Notificar al backend
      // await this.http.post(`${this.API_URL}/logout`, {}).toPromise();

      // Limpiar storage
      await Promise.all([
        this.storage.remove(this.TOKEN_KEY),
        this.storage.remove(this.REFRESH_TOKEN_KEY),
        this.storage.remove(this.USER_KEY)
      ]);

      // Actualizar estado
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);

      // Redirigir al login solo si se solicita
      if (redirect) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // ============================================
  // GESTIÓN DE TOKENS
  // ============================================

  /**
   * Obtiene el token de autenticación actual
   */
  async getToken(): Promise<string | null> {
    return await this.storage.get<string>(this.TOKEN_KEY);
  }

  /**
   * Refresca el token de autenticación
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.storage.get<string>(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // PRODUCCIÓN: Llamada real al backend
      // const response = await this.http.post<AuthResponse>(
      //   `${this.API_URL}/refresh`,
      //   { refreshToken }
      // ).toPromise();

      // DEMO: Simular refresh
      const response: AuthResponse = {
        user: this.currentUserSubject.value!,
        token: 'new_demo_token_' + Date.now(),
        refreshToken: 'new_refresh_token_' + Date.now()
      };

      await this.storage.set(this.TOKEN_KEY, response.token);
      if (response.refreshToken) {
        await this.storage.set(this.REFRESH_TOKEN_KEY, response.refreshToken);
      }

      return response.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await this.logout();
      return null;
    }
  }

  // ============================================
  // GETTERS
  // ============================================

  /**
   * Obtiene el usuario actual
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  /**
   * Maneja el éxito de autenticación
   */
  private async handleAuthSuccess(response: AuthResponse): Promise<void> {
    try {
      // Guardar en storage
      await Promise.all([
        this.storage.set(this.TOKEN_KEY, response.token),
        this.storage.set(this.USER_KEY, response.user),
        response.refreshToken 
          ? this.storage.set(this.REFRESH_TOKEN_KEY, response.refreshToken)
          : Promise.resolve()
      ]);

      // Actualizar estado
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  /**
   * Maneja errores de autenticación
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 401:
          errorMessage = 'Credenciales inválidas';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 422:
          errorMessage = 'Datos inválidos';
          break;
        case 500:
          errorMessage = 'Error del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Auth error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================
  // SIMULACIÓN (SOLO PARA DEMO)
  // ============================================

  /**
   * Aqui simulamos el login para desarrollo
   * SOLO acepta credenciales predefinidas
   */
  private simulateLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    // Credenciales válidas predefinidas
    const VALID_EMAIL = 'oswalggama@gmail.com';
    const VALID_PASSWORD = 'Oswal26..';

    return of(null).pipe(
      map(() => {
        // Validar que las credenciales coincidan exactamente
        if (
          credentials.email === VALID_EMAIL &&
          credentials.password === VALID_PASSWORD
        ) {
          // Login correcto - Crear usuario
          const user: User = {
            id: 'user_oswal_123',
            email: VALID_EMAIL,
            name: 'Oswal GGama',
            avatar: 'https://ui-avatars.com/api/?name=Oswal+GGama&background=1DB954&color=fff',
            createdAt: new Date().toISOString()
          };

          const response: AuthResponse = {
            user,
            token: 'demo_token_' + Date.now(),
            refreshToken: 'demo_refresh_' + Date.now()
          };

          return response;
        } else {
          // Login incorrecto
          throw new Error('Credenciales incorrectas');
        }
      })
    );
  }

  /**
   * Simula registro para desarrollo
   * ELIMINAR EN PRODUCCIÓN
   */
  private simulateRegister(data: RegisterData): Observable<AuthResponse> {
    return of(null).pipe(
      map(() => {
        // Validación básica
        if (!data.email || !data.password || !data.name) {
          throw new Error('Todos los campos son requeridos');
        }

        if (data.password.length < 6) {
          throw new Error('Contraseña debe tener al menos 6 caracteres');
        }

        // Simular respuesta exitosa
        const user: User = {
          id: 'demo_user_' + Date.now(),
          email: data.email,
          name: data.name,
          avatar: `https://ui-avatars.com/api/?name=${data.name}&background=1DB954&color=fff`,
          createdAt: new Date().toISOString()
        };

        const response: AuthResponse = {
          user,
          token: 'demo_token_' + Date.now(),
          refreshToken: 'demo_refresh_' + Date.now()
        };

        return response;
      })
    );
  }
}
