import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

// ============================================
// INTERFACES (SENA Best Practices)
// ============================================

export interface User {
  id?: number | string;
  email: string;
  name: string;
  last_name?: string;
  username?: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginRequest {
  user: {
    email: string;
    password: string;
  };
}

export interface SignupRequest {
  user: {
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
    last_name: string;
  };
}

export interface AuthResponse {
  msg: string;
  status: 'OK' | 'ERROR';
  user?: User;
}

// ============================================
// AUTH SERVICE
// ============================================

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API URL - Using the provided music.fly.dev backend
  private readonly API_URL = 'https://music.fly.dev';

  // Storage keys
  private readonly USER_KEY = 'current_user';
  private readonly AUTH_STATUS_KEY = 'is_authenticated';

  // State Management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Initialization flag for guards
  private isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$ = this.isReadySubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  /**
   * Loads stored user data from local storage on service initialization
   */
  private async loadStoredAuth(): Promise<void> {
    try {
      const user = await this.storage.get<User>(this.USER_KEY);
      const isAuthenticated = await this.storage.get<boolean>(this.AUTH_STATUS_KEY);

      if (user && isAuthenticated) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      // Always mark as ready even if it fails
      this.isReadySubject.next(true);
    }
  }

  /**
   * Logs in a user using the remote API
   * POST /login
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    const payload: LoginRequest = {
      user: {
        email: credentials.email,
        password: credentials.password
      }
    };

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
      tap(response => {
        if (response.status === 'OK' && response.user) {
          this.handleAuthSuccess(response.user);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Registers a new user using the remote API
   * POST /signup
   */
  signup(data: SignupRequest['user']): Observable<AuthResponse> {
    const payload: SignupRequest = {
      user: data
    };

    return this.http.post<AuthResponse>(`${this.API_URL}/signup`, payload).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Persists user session data
   */
  private async handleAuthSuccess(user: User): Promise<void> {
    try {
      await this.storage.set(this.USER_KEY, user);
      await this.storage.set(this.AUTH_STATUS_KEY, true);

      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error storing session data:', error);
    }
  }

  /**
   * Clears the user session
   */
  async logout(redirect: boolean = true): Promise<void> {
    try {
      await Promise.all([
        this.storage.remove(this.USER_KEY),
        this.storage.remove(this.AUTH_STATUS_KEY),
        this.storage.remove('login')
      ]);

      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);

      if (redirect) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Robust Error Handling (Professor's Requirement)
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
          break;
        case 422:
          // Unprocessable Content (Professor's Requirement)
          errorMessage = error.error?.msg || 'Datos inválidos. El usuario ya existe o el formato es incorrecto.';
          break;
        case 500:
          errorMessage = 'Error en el servidor. Inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.msg || error.message}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================
  // GETTERS (Maintained for compatibility)
  // ============================================

  /**
   * Returns the current authenticated user
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Returns the current authentication status
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
