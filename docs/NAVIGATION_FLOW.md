# 🔄 Flujo de Navegación - Spotify Pirata

## 📊 Flujo Actualizado

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DE LA APP                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ ¿Autenticado?    │
                  └──────────────────┘
                     │           │
                 NO  │           │  SÍ
                     ▼           ▼
            ┌─────────────┐  ┌──────────────┐
            │   LOGIN     │  │ ¿Vio Intro?  │
            └─────────────┘  └──────────────┘
                  │              │        │
                  │          NO  │        │  SÍ
                  │              ▼        ▼
                  │         ┌────────┐  ┌──────┐
                  │         │ INTRO  │  │ HOME │
                  │         └────────┘  └──────┘
                  │              │
                  │              ▼
                  │         ┌──────┐
                  │         │ HOME │
                  │         └──────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Ingresa          │
         │ credenciales     │
         └──────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Login exitoso    │
         └──────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ ¿Vio Intro?      │
         └──────────────────┘
              │        │
          NO  │        │  SÍ
              ▼        ▼
         ┌────────┐  ┌──────┐
         │ INTRO  │  │ HOME │
         └────────┘  └──────┘
              │
              ▼
         ┌──────┐
         │ HOME │
         └──────┘
```

---

## 🎯 Descripción del Flujo

### **1. Usuario NO Autenticado**

```
App inicia
    ↓
publicGuard detecta: NO autenticado
    ↓
Redirige a: /login
    ↓
Usuario ingresa credenciales
    ↓
AuthService.login() exitoso
    ↓
SIEMPRE navega a: /intro
    ↓
Usuario completa intro o la salta
    ↓
Navega a: /home
```

### **2. Usuario Autenticado (Con sesión activa)**

```
App inicia
    ↓
authGuard detecta: Autenticado
    ↓
IntroGuard verifica: ¿introSeen?
    ├─ NO → Redirige a /intro
    └─ SÍ → Permite acceso a /home
```

### **3. Comportamiento del Login**

```
Login exitoso
    ↓
SIEMPRE → /intro (sin verificar introSeen)
    ↓
Desde Intro:
    ├─ Botón "Empezar ahora" → Marca introSeen = true → /home
    └─ Botón "Saltar Intro" → Marca introSeen = true → /home
```

**Nota importante**: El login SIEMPRE redirige a Intro, independientemente de si el usuario ya la vio antes. Esto permite que el usuario vea la intro cada vez que hace login si lo desea, o puede saltarla usando el botón correspondiente.

---

## 🛡️ Protección de Rutas

### Login (`/login`)
- **Guard**: `publicGuard`
- **Acceso**: Solo si NO está autenticado
- **Si autenticado**: Redirige a `/home`

### Intro (`/intro`)
- **Guard**: `authGuard`
- **Acceso**: Solo si está autenticado
- **Si NO autenticado**: Redirige a `/login`

### Home (`/home`)
- **Guards**: `authGuard` + `IntroGuard`
- **Acceso**: Solo si está autenticado Y vio intro
- **Si NO autenticado**: Redirige a `/login`
- **Si NO vio intro**: Redirige a `/intro`

---

## 📝 Código Relevante

### app.routes.ts
```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canActivate: [publicGuard] // Solo si NO está autenticado
  },
  {
    path: 'intro',
    loadComponent: () => import('./intro/intro.page').then(m => m.IntroPage),
    canActivate: [authGuard] // Requiere autenticación
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [authGuard, IntroGuard] // Autenticación + Intro vista
  }
];
```

### login.page.ts (Navegación después del login)
```typescript
async login() {
  // ... validaciones y login ...
  
  // Verificar si ya vio la intro
  const introSeen = await this.storageService.get('introSeen');
  
  if (introSeen) {
    // Ya vio la intro, ir directo a Home
    this.router.navigate(['/home'], { replaceUrl: true });
  } else {
    // No ha visto la intro, ir a Intro
    this.router.navigate(['/intro'], { replaceUrl: true });
  }
}
```

---

## 🔄 Casos de Uso

### Caso 1: Usuario Nuevo
1. Abre app → `/login`
2. Hace login → Navega a `/intro`
3. Completa intro → Navega a `/home`
4. Cierra app
5. Reabre app → Va directo a `/home` (autenticado + intro vista)

### Caso 2: Usuario que ya vio Intro
1. Abre app → `/login`
2. Hace login → Navega directo a `/home` (intro ya vista)

### Caso 3: Usuario Autenticado
1. Abre app → Va directo a `/home` (sesión activa)

### Caso 4: Usuario hace Logout
1. Presiona logout en `/home`
2. AuthService limpia sesión
3. Redirige a `/login`
4. Debe hacer login nuevamente

---

## 🎨 Experiencia de Usuario

### Primera Experiencia
```
Login → Intro (onboarding) → Home
```
**Tiempo estimado**: 2-3 minutos

### Experiencias Posteriores
```
Login → Home
```
**Tiempo estimado**: 5 segundos

### Con Sesión Activa
```
App → Home
```
**Tiempo estimado**: Instantáneo

---

## 🔐 Seguridad

### Rutas Protegidas
- ✅ `/home` requiere autenticación
- ✅ `/intro` requiere autenticación
- ✅ `/login` solo accesible sin autenticación

### Prevención de Accesos No Autorizados
- ❌ Usuario NO autenticado intenta `/home` → Redirige a `/login`
- ❌ Usuario NO autenticado intenta `/intro` → Redirige a `/login`
- ❌ Usuario autenticado intenta `/login` → Redirige a `/home`

---

## 📱 Persistencia

### Storage Keys
```typescript
'auth_token'      // Token de acceso
'refresh_token'   // Token de refresco
'current_user'    // Datos del usuario
'introSeen'       // Flag de intro vista
```

### Limpieza en Logout
```typescript
await Promise.all([
  storage.remove('auth_token'),
  storage.remove('refresh_token'),
  storage.remove('current_user')
  // 'introSeen' se mantiene
]);
```

---

## 🧪 Testing del Flujo

### Test 1: Login Primera Vez
1. Borrar storage de la app
2. Abrir app → Debe mostrar `/login`
3. Ingresar credenciales válidas
4. Debe navegar a `/intro`
5. Completar intro
6. Debe navegar a `/home`

### Test 2: Login Usuario Recurrente
1. Hacer login (intro ya vista)
2. Debe navegar directo a `/home`

### Test 3: Sesión Persistente
1. Hacer login
2. Cerrar app
3. Reabrir app
4. Debe ir directo a `/home` (sin pedir login)

### Test 4: Logout
1. Estar en `/home`
2. Hacer logout
3. Debe redirigir a `/login`
4. Intentar navegar a `/home` → Debe bloquear

---

**Fecha de actualización**: 2026-01-23  
**Flujo**: Login → Intro → Home  
**Estado**: ✅ Implementado y funcional
