# 🔐 Sistema de Autenticación - Spotify Pirata

## 📋 Resumen

Se ha implementado un **sistema de autenticación completo y profesional** con las siguientes características:

- ✅ Servicio de autenticación con gestión de tokens
- ✅ Guards para proteger rutas
- ✅ HTTP Interceptor para tokens automáticos
- ✅ Persistencia de sesión con Ionic Storage
- ✅ Estado reactivo con RxJS
- ✅ Modo DEMO para desarrollo
- ✅ Preparado para producción

---

## 🏗️ Arquitectura

### Componentes Principales

```
src/app/
├── services/
│   ├── auth.service.ts          # Servicio principal de autenticación
│   └── storage.service.ts       # Persistencia de datos
├── guards/
│   ├── auth.guard.ts            # Guards de autenticación
│   └── intro.guard.ts           # Guard de intro
├── interceptors/
│   └── auth.interceptor.ts      # Interceptor HTTP
└── login/
    ├── login.page.ts            # Página de login
    ├── login.page.html          # Template
    └── login.page.scss          # Estilos
```

---

## 🔧 AuthService

### Características

1. **Gestión de Tokens**
   - Token de acceso (access token)
   - Token de refresco (refresh token)
   - Renovación automática de tokens

2. **Estado Reactivo**
   ```typescript
   // Observables para suscribirse
   authService.currentUser$      // Usuario actual
   authService.isAuthenticated$  // Estado de autenticación
   ```

3. **Persistencia**
   - Tokens guardados en Ionic Storage
   - Sesión persiste entre reinicios de app
   - Auto-carga al iniciar

### Métodos Principales

```typescript
// Login
login(credentials: LoginCredentials): Observable<AuthResponse>

// Registro
register(data: RegisterData): Observable<AuthResponse>

// Logout
logout(): Promise<void>

// Obtener token
getToken(): Promise<string | null>

// Refrescar token
refreshToken(): Promise<string | null>

// Getters
get currentUser: User | null
get isAuthenticated: boolean
```

### Interfaces

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
```

---

## 🛡️ Guards

### authGuard

Protege rutas que requieren autenticación.

**Uso:**
```typescript
{
  path: 'home',
  loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  canActivate: [authGuard]
}
```

**Comportamiento:**
- ✅ Si está autenticado → Permite acceso
- ❌ Si NO está autenticado → Redirige a `/login`
- 📍 Guarda la URL intentada para redirigir después del login

### publicGuard

Protege rutas públicas (login, register).

**Uso:**
```typescript
{
  path: 'login',
  loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
  canActivate: [publicGuard]
}
```

**Comportamiento:**
- ✅ Si NO está autenticado → Permite acceso
- ❌ Si está autenticado → Redirige a `/home`

---

## 🔄 HTTP Interceptor

### Funcionalidades

1. **Agregar Token Automáticamente**
   ```
   Authorization: Bearer {token}
   ```

2. **Manejo de Errores 401**
   - Detecta cuando el token expiró
   - Intenta refrescar automáticamente
   - Reintenta la petición con nuevo token

3. **URLs Públicas**
   - No agrega token a `/login`, `/register`, `/refresh`

### Configuración

**En `app.config.ts`:**
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

---

## 🎯 LoginPage

### Características

1. **Validaciones Reactivas**
   - Email: requerido + formato válido
   - Password: requerido + mínimo 6 caracteres

2. **Estados Visuales**
   - Loading spinner durante login
   - Mensajes de error específicos
   - Toast de éxito/error

3. **Navegación Inteligente**
   - Redirige a `returnUrl` después del login
   - Si no hay `returnUrl`, va a `/home`

### Métodos

```typescript
// Login principal
login(): Promise<void>

// Helpers
showToast(message, color): Promise<void>
goToRegister(): void
goToForgotPassword(): void
```

---

## 🚀 Modo DEMO vs PRODUCCIÓN

### Modo DEMO (Actual)

El servicio actualmente funciona en **modo DEMO** para desarrollo:

```typescript
// En auth.service.ts
login(credentials): Observable<AuthResponse> {
  return this.simulateLogin(credentials); // DEMO
}
```

**Características DEMO:**
- ✅ No requiere backend
- ✅ Validaciones básicas
- ✅ Genera tokens de prueba
- ✅ Simula respuestas exitosas
- ✅ Perfecto para desarrollo UI/UX

### Migrar a PRODUCCIÓN

**Paso 1:** Configurar URL del API
```typescript
// En auth.service.ts
private readonly API_URL = 'https://tu-api.com/api/auth';
```

**Paso 2:** Descomentar llamadas HTTP reales
```typescript
login(credentials): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
    tap(response => this.handleAuthSuccess(response)),
    catchError(error => this.handleError(error))
  );
}
```

**Paso 3:** Eliminar métodos de simulación
```typescript
// Eliminar:
// - simulateLogin()
// - simulateRegister()
```

---

## 📊 Flujo de Autenticación

### Login Exitoso

```
1. Usuario ingresa credenciales
   ↓
2. LoginPage.login() valida formulario
   ↓
3. Muestra loading spinner
   ↓
4. AuthService.login() procesa
   ↓
5. Backend responde con user + tokens
   ↓
6. AuthService guarda en Storage
   ↓
7. Actualiza estado (currentUser$, isAuthenticated$)
   ↓
8. LoginPage cierra loading
   ↓
9. Muestra toast de éxito
   ↓
10. Navega a returnUrl o /home
```

### Petición HTTP con Token

```
1. App hace petición HTTP
   ↓
2. authInterceptor intercepta
   ↓
3. Obtiene token del AuthService
   ↓
4. Agrega header: Authorization: Bearer {token}
   ↓
5. Envía petición
   ↓
6. Si responde 401:
   ├─ Intenta refresh token
   ├─ Si éxito: reintenta con nuevo token
   └─ Si falla: logout y redirige a login
```

### Protección de Rutas

```
Usuario navega a /home
   ↓
authGuard verifica isAuthenticated$
   ↓
¿Está autenticado?
   ├─ SÍ → Permite acceso
   └─ NO → Redirige a /login?returnUrl=/home
```

---

## 🔒 Seguridad

### Implementado

- ✅ Tokens almacenados de forma segura (Ionic Storage)
- ✅ Refresh tokens para renovación
- ✅ Logout limpia toda la sesión
- ✅ Guards protegen rutas sensibles
- ✅ Interceptor maneja tokens automáticamente

### Recomendaciones para Producción

1. **HTTPS Obligatorio**
   - Nunca enviar tokens por HTTP

2. **Tokens JWT**
   - Usar JWT con expiración corta (15-30 min)
   - Refresh token con expiración larga (7-30 días)

3. **Almacenamiento Seguro**
   - En web: HttpOnly cookies (más seguro que localStorage)
   - En móvil: Ionic Storage es adecuado

4. **Validación Backend**
   - Siempre validar tokens en el servidor
   - No confiar en validaciones del cliente

5. **Rate Limiting**
   - Limitar intentos de login
   - Implementar CAPTCHA después de X intentos

---

## 📝 Ejemplos de Uso

### Verificar si está autenticado

```typescript
// En cualquier componente
constructor(private authService: AuthService) {
  this.authService.isAuthenticated$.subscribe(isAuth => {
    console.log('¿Autenticado?', isAuth);
  });
}
```

### Obtener usuario actual

```typescript
// Opción 1: Observable
this.authService.currentUser$.subscribe(user => {
  console.log('Usuario:', user);
});

// Opción 2: Getter síncrono
const user = this.authService.currentUser;
```

### Hacer logout

```typescript
async logout() {
  await this.authService.logout();
  // Automáticamente redirige a /login
}
```

### Petición HTTP protegida

```typescript
// El interceptor agrega el token automáticamente
this.http.get('https://api.com/protected-data').subscribe(data => {
  console.log(data);
});
```

---

## 🧪 Testing

### Credenciales de DEMO

En modo DEMO, cualquier email/password funciona si:
- Email tiene formato válido
- Password tiene mínimo 6 caracteres

**Ejemplo:**
```
Email: pirata@spotify.com
Password: 123456
```

---

## 🔄 Próximos Pasos

1. **Registro de Usuarios**
   - Crear página de registro
   - Conectar con AuthService.register()

2. **Recuperación de Contraseña**
   - Página "Olvidé mi contraseña"
   - Flujo de reset por email

3. **Perfil de Usuario**
   - Página de perfil
   - Editar datos del usuario
   - Cambiar contraseña

4. **Social Login**
   - Google OAuth
   - Apple Sign In
   - Facebook Login

5. **Backend Real**
   - Implementar API REST
   - Conectar con base de datos
   - Migrar de DEMO a PRODUCCIÓN

---

## 📚 Referencias

- [Ionic Storage](https://ionicframework.com/docs/angular/storage)
- [Angular Guards](https://angular.io/guide/router#preventing-unauthorized-access)
- [HTTP Interceptors](https://angular.io/guide/http-intercept-requests-and-responses)
- [RxJS](https://rxjs.dev/)

---

**Fecha de creación**: 2026-01-23  
**Estado**: ✅ Completado y funcional  
**Modo**: DEMO (listo para migrar a producción)
