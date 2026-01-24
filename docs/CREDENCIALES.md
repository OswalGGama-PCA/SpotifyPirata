# 🔐 Credenciales de Acceso - Spotify Pirata

## 📧 Credenciales Válidas (DEMO)

El sistema actualmente está configurado para **aceptar SOLO** las siguientes credenciales:

```
Email:    oswalggama@gmail.com
Password: Oswal26..
```

⚠️ **IMPORTANTE**: Cualquier otra combinación de email/password será **rechazada** con el mensaje "Credenciales incorrectas".

---

## 🔒 Configuración Actual

### Ubicación del Código
**Archivo**: `src/app/services/auth.service.ts`  
**Método**: `simulateLogin()`  
**Líneas**: ~293-327

### Código de Validación
```typescript
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
```

---

## 🧪 Pruebas

### ✅ Login Exitoso
```
Email:    oswalggama@gmail.com
Password: Oswal26..
Resultado: Login exitoso → Navega a Intro/Home
```

### ❌ Login Fallido (Ejemplos)
```
Email:    otro@email.com
Password: Oswal26..
Resultado: Error "Credenciales incorrectas"

Email:    oswalggama@gmail.com
Password: 123456
Resultado: Error "Credenciales incorrectas"

Email:    oswalggama@gmail.com
Password: oswal26..  (minúsculas)
Resultado: Error "Credenciales incorrectas"
```

---

## 🔧 Cómo Agregar Más Usuarios

Si necesitas agregar más usuarios válidos, modifica el método `simulateLogin`:

```typescript
private simulateLogin(credentials: LoginCredentials): Observable<AuthResponse> {
  // Lista de usuarios válidos
  const VALID_USERS = [
    { email: 'oswalggama@gmail.com', password: 'Oswal26..' },
    { email: 'usuario2@gmail.com', password: 'Pass123!' },
    { email: 'usuario3@gmail.com', password: 'Test456#' }
  ];

  return of(null).pipe(
    map(() => {
      // Buscar usuario válido
      const validUser = VALID_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (validUser) {
        // Login correcto
        const user: User = {
          id: 'user_' + Date.now(),
          email: validUser.email,
          name: validUser.email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${validUser.email}&background=1DB954&color=fff`,
          createdAt: new Date().toISOString()
        };

        return {
          user,
          token: 'demo_token_' + Date.now(),
          refreshToken: 'demo_refresh_' + Date.now()
        };
      } else {
        throw new Error('Credenciales incorrectas');
      }
    })
  );
}
```

---

## 🚀 Migración a Producción

Cuando tengas un backend real:

1. **Eliminar** el método `simulateLogin()`
2. **Descomentar** la llamada HTTP en el método `login()`:
   ```typescript
   login(credentials: LoginCredentials): Observable<AuthResponse> {
     return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
       tap(response => this.handleAuthSuccess(response)),
       catchError(error => this.handleError(error))
     );
   }
   ```
3. **Configurar** la URL del API:
   ```typescript
   private readonly API_URL = 'https://tu-api-real.com/api/auth';
   ```

---

## 📝 Notas Importantes

- ✅ Las credenciales son **case-sensitive** (distinguen mayúsculas/minúsculas)
- ✅ El email debe coincidir **exactamente**: `oswalggama@gmail.com`
- ✅ La contraseña debe coincidir **exactamente**: `Oswal26..`
- ✅ No hay límite de intentos de login (en producción deberías implementarlo)
- ✅ El token generado es único por sesión (usa timestamp)

---

## 🔐 Seguridad

**⚠️ ADVERTENCIA**: Este método es **SOLO PARA DESARROLLO**.

**NO uses credenciales hardcodeadas en producción** porque:
- ❌ Cualquiera puede ver el código fuente
- ❌ No hay encriptación
- ❌ No hay protección contra ataques
- ❌ No hay rate limiting

**En producción**, siempre:
- ✅ Valida credenciales en el servidor
- ✅ Usa HTTPS
- ✅ Implementa rate limiting
- ✅ Hashea las contraseñas
- ✅ Usa tokens JWT con expiración

---

**Última actualización**: 2026-01-23  
**Modo**: DEMO con credenciales fijas  
**Usuario válido**: oswalggama@gmail.com
