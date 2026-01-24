# 🔄 Flujo de Navegación Optimizado - Spotify Pirata

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP INICIA                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ AuthService      │
                    │ Verifica sesión  │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ ¿Autenticado?    │
                    └──────────────────┘
                       │            │
                   NO  │            │  SÍ
                       ↓            ↓
              ┌─────────────┐  ┌──────────────┐
              │   /login    │  │ ¿Vio Intro?  │
              └─────────────┘  └──────────────┘
                     │            │         │
                     │        NO  │         │  SÍ
                     ↓            ↓         ↓
              ┌─────────────┐  ┌────────┐  ┌────────────┐
              │ Usuario     │  │ /intro │  │ /menu/home │
              │ ingresa     │  └────────┘  └────────────┘
              │ credenciales│       │
              └─────────────┘       │
                     │              │
                     ↓              │
              ┌─────────────┐       │
              │ AuthService │       │
              │ .login()    │       │
              └─────────────┘       │
                     │              │
                     ↓              │
              ┌─────────────┐       │
              │ ¿Exitoso?   │       │
              └─────────────┘       │
                 │        │         │
             SÍ  │        │  NO     │
                 ↓        ↓         │
         ┌────────────┐  ┌──────┐  │
         │ Guardar    │  │ Error│  │
         │ en Storage │  └──────┘  │
         └────────────┘             │
                 │                  │
                 ↓                  │
         ┌──────────────┐           │
         │ ¿Vio Intro?  │           │
         └──────────────┘           │
            │        │              │
        NO  │        │  SÍ          │
            ↓        ↓              │
         ┌────────┐  ┌────────────┐ │
         │ /intro │  │ /menu/home │ │
         └────────┘  └────────────┘ │
            │              ↑         │
            │              │         │
            └──────────────┴─────────┘
                     │
                     ↓
              ┌────────────┐
              │ /menu/home │
              │ (Destino   │
              │  Final)    │
              └────────────┘
```

---

## 🎯 Casos de Uso Detallados

### **Caso 1: Usuario Nuevo (Primera Vez)**

```
1. Abre la app
   ↓
2. No tiene sesión → Redirige a /login
   ↓
3. Hace click en "Regístrate gratis"
   ↓
4. Completa formulario de registro
   ↓
5. AuthService.register() exitoso
   ↓
6. Guarda datos en Storage
   ↓
7. Navega a /login (para confirmar credenciales)
   ↓
8. Ingresa credenciales
   ↓
9. AuthService.login() exitoso
   ↓
10. Verifica introSeen = false
    ↓
11. Navega a /intro
    ↓
12. Completa las 4 slides
    ↓
13. Click en "Empezar ahora"
    ↓
14. Marca introSeen = true
    ↓
15. Navega a /menu/home
    ↓
16. ✅ Usuario en la app principal
```

**Tiempo estimado**: 2-3 minutos

---

### **Caso 2: Usuario Recurrente (Ya vio Intro)**

```
1. Abre la app
   ↓
2. No tiene sesión → Redirige a /login
   ↓
3. Ingresa credenciales
   ↓
4. AuthService.login() exitoso
   ↓
5. Verifica introSeen = true
   ↓
6. Navega directo a /menu/home
   ↓
7. ✅ Usuario en la app principal
```

**Tiempo estimado**: 5-10 segundos

---

### **Caso 3: Usuario con Sesión Activa (App cerrada y reabierta)**

```
1. Abre la app
   ↓
2. AuthService detecta token en Storage
   ↓
3. isAuthenticated = true
   ↓
4. authGuard permite acceso
   ↓
5. IntroGuard verifica introSeen = true
   ↓
6. Navega directo a /menu/home
   ↓
7. ✅ Usuario en la app principal
```

**Tiempo estimado**: Instantáneo (< 1 segundo)

---

### **Caso 4: Usuario Autenticado Intenta Acceder a Login**

```
1. Usuario en /menu/home
   ↓
2. Navega manualmente a /login
   ↓
3. publicGuard detecta: isAuthenticated = true
   ↓
4. Redirige a /intro
   ↓
5. IntroGuard detecta: introSeen = true
   ↓
6. Redirige a /menu/home
   ↓
7. ✅ Usuario permanece en la app
```

**Resultado**: No puede acceder a login si ya está autenticado

---

### **Caso 5: Usuario Hace Logout**

```
1. Usuario en /menu/home
   ↓
2. Click en "Cerrar Sesión"
   ↓
3. AuthService.logout() ejecuta
   ↓
4. Limpia Storage (tokens, user)
   ↓
5. isAuthenticated = false
   ↓
6. Navega a /login
   ↓
7. ✅ Usuario debe iniciar sesión nuevamente
```

**Nota**: `introSeen` NO se borra (persiste)

---

## 🛡️ Protección de Rutas

### **Tabla de Guards**

| Ruta | Guard | Comportamiento |
|------|-------|----------------|
| `/` | - | Redirige a `/login` |
| `/login` | `publicGuard` | Solo si NO autenticado → Si autenticado: redirige a `/intro` |
| `/register` | `publicGuard` | Solo si NO autenticado → Si autenticado: redirige a `/intro` |
| `/intro` | `authGuard` | Solo si autenticado → Si NO: redirige a `/login` |
| `/menu` | `authGuard` | Solo si autenticado → Si NO: redirige a `/login` |
| `/menu/home` | `authGuard` + `IntroGuard` | Autenticado + Intro vista → Si no vio intro: redirige a `/intro` |

### **Jerarquía de Guards**

```
publicGuard (login, register)
    ↓
authGuard (intro, menu)
    ↓
IntroGuard (menu/home)
```

---

## 📱 Flujo de Navegación por Componente

### **LoginPage**

```typescript
async login() {
  // ... validaciones ...
  
  await this.authService.login(credentials);
  
  // Verificar si ya vio la intro
  const introSeen = await this.storageService.get('introSeen');
  
  if (introSeen) {
    this.router.navigate(['/menu/home']);
  } else {
    this.router.navigate(['/intro']);
  }
}
```

### **RegisterPage**

```typescript
async register() {
  // ... validaciones ...
  
  await this.authService.register(data);
  
  // Siempre navega a login después del registro
  this.router.navigate(['/login'], {
    state: { registered: true, email: data.email }
  });
}
```

### **IntroPage**

```typescript
async goHome() {
  // Marcar intro como vista
  await this.storageService.set('introSeen', true);
  
  // Navegar a home
  this.router.navigate(['/menu/home']);
}
```

### **MenuPage**

```typescript
async logout() {
  // Cerrar sesión (limpia tokens pero NO introSeen)
  await this.authService.logout();
  
  // Automáticamente redirige a /login
}
```

---

## 🔄 Estados de la Aplicación

### **Estado 1: No Autenticado**

```
Storage:
  auth_token: null
  current_user: null
  introSeen: false (o true si ya la vio antes)

Rutas Accesibles:
  ✅ /login
  ✅ /register
  ❌ /intro
  ❌ /menu
  ❌ /menu/home
```

### **Estado 2: Autenticado + No vio Intro**

```
Storage:
  auth_token: "demo_token_123..."
  current_user: { id, email, name, ... }
  introSeen: false

Rutas Accesibles:
  ❌ /login (redirige a /intro)
  ❌ /register (redirige a /intro)
  ✅ /intro
  ✅ /menu
  ❌ /menu/home (redirige a /intro)
```

### **Estado 3: Autenticado + Vio Intro**

```
Storage:
  auth_token: "demo_token_123..."
  current_user: { id, email, name, ... }
  introSeen: true

Rutas Accesibles:
  ❌ /login (redirige a /intro → /menu/home)
  ❌ /register (redirige a /intro → /menu/home)
  ✅ /intro (puede volver a verla)
  ✅ /menu
  ✅ /menu/home
```

---

## ⚡ Optimizaciones Implementadas

### **1. Lazy Loading**

Todas las páginas se cargan solo cuando se necesitan:

```typescript
loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
```

**Beneficio**: App inicial más rápida

### **2. Guards Jerárquicos**

```typescript
{
  path: 'menu',
  canActivate: [authGuard], // Protege todo el menú
  children: [
    {
      path: 'home',
      canActivate: [IntroGuard] // Solo verifica intro
    }
  ]
}
```

**Beneficio**: No duplicar `authGuard` en cada hijo

### **3. Persistencia Inteligente**

```typescript
// Se borra en logout:
- auth_token
- refresh_token
- current_user

// NO se borra en logout:
- introSeen (persiste para siempre)
```

**Beneficio**: Usuario no ve intro cada vez que hace login

---

## 🎯 Recomendaciones Adicionales

### **1. Agregar Splash Screen**

```
App inicia
    ↓
Splash Screen (2s)
    ↓
Verifica autenticación
    ↓
Navega a ruta correspondiente
```

### **2. Implementar Deep Linking**

```typescript
// Si usuario recibe link: app://menu/playlist/123
// Y NO está autenticado:
authGuard guarda: returnUrl = '/menu/playlist/123'
    ↓
Redirige a /login
    ↓
Login exitoso
    ↓
Navega a returnUrl guardado
```

### **3. Agregar Loading State**

```typescript
// En app.component.ts
async ngOnInit() {
  this.showSplash = true;
  await this.authService.loadStoredAuth();
  this.showSplash = false;
}
```

---

## 📊 Resumen del Flujo Óptimo

| Escenario | Flujo |
|-----------|-------|
| **Usuario nuevo** | Login → Register → Login → Intro → Menu/Home |
| **Primera sesión** | Login → Intro → Menu/Home |
| **Sesión recurrente** | Login → Menu/Home |
| **Sesión activa** | App → Menu/Home (directo) |
| **Logout** | Menu/Home → Login |

---

## ✅ Ventajas de Este Flujo

1. ✅ **Intuitivo**: Sigue el patrón estándar de apps
2. ✅ **Seguro**: Guards protegen rutas sensibles
3. ✅ **Eficiente**: Lazy loading + persistencia
4. ✅ **Escalable**: Fácil agregar nuevas rutas
5. ✅ **UX optimizada**: Intro solo una vez
6. ✅ **Mantenible**: Código claro y documentado

---

**Fecha**: 2026-01-23  
**Estado**: ✅ Flujo optimizado e implementado  
**Próximo paso**: Agregar más páginas al menú
