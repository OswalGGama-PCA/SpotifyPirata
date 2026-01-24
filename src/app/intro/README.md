# 📱 Intro Page - Spotify Pirata

## Descripción

Página de introducción interactiva con 4 slides que presenta las características principales de la aplicación. Incluye soporte para múltiples temas, animaciones suaves, y accesibilidad completa.

## ✨ Características

### Funcionalidades Principales
- ✅ **4 Slides Dinámicos**: Presentación visual con imágenes generadas por IA
- ✅ **Sistema de Temas**: 5 temas diferentes (Claro, Oscuro, Ocean, Sunset, Pirata)
- ✅ **Navegación Intuitiva**: Botones, dots, swipe gestures
- ✅ **Persistencia**: Guarda el estado de "intro vista" y tema seleccionado
- ✅ **Guard de Navegación**: Redirige automáticamente si no se ha visto la intro

### Mejoras de Calidad
- 🛡️ **Manejo de Errores**: Gestión de errores de carga de imágenes
- ♿ **Accesibilidad**: ARIA labels, anuncios para lectores de pantalla
- 🚀 **Performance**: Precarga de imágenes, animaciones condicionales
- 📚 **Documentación**: JSDoc completo en todos los métodos
- 🧪 **Testing**: Suite completa de tests unitarios (15+ tests)
- 🎨 **Animaciones Condicionales**: Respeta preferencias de `prefers-reduced-motion`

## 🏗️ Arquitectura

### Componentes
```
intro/
├── intro.page.html       # Template con estructura de slides
├── intro.page.scss       # Estilos Spotify-themed
├── intro.page.ts         # Lógica del componente
└── intro.page.spec.ts    # Tests unitarios
```

### Servicios Utilizados
- `StorageService`: Persistencia de datos
- `AnimationController`: Animaciones Ionic
- `GestureController`: Gestos táctiles
- `ToastController`: Notificaciones
- `Router`: Navegación

## 📊 Estructura de Datos

### Slide Interface
```typescript
{
  title: string;        // Título del slide
  subtitle: string;     // Subtítulo
  text: string;         // Descripción
  img: string;          // Ruta de la imagen
}
```

### Temas Disponibles
1. **theme-default** (Claro)
2. **theme-dark** (Oscuro)
3. **theme-ocean** (Azul)
4. **theme-sunset** (Atardecer)
5. **pirate-theme** (Pirata)

## 🔧 Métodos Principales

### Navegación
- `next()`: Avanza al siguiente slide
- `prev()`: Retrocede al slide anterior
- `goToSlide(index)`: Salta a un slide específico
- `skipToEnd()`: Salta al último slide o vuelve al inicio

### Temas
- `toggleTheme()`: Cambia al siguiente tema
- `getCurrentThemeLabel()`: Obtiene el nombre del tema actual

### Utilidades
- `getSafeSlide(index)`: Acceso seguro a slides
- `shouldAnimate()`: Verifica si ejecutar animaciones
- `preloadImages()`: Precarga imágenes para mejor UX

### Eventos
- `onImageLoad()`: Maneja carga exitosa de imagen
- `onImageError()`: Maneja error de carga de imagen
- `goHome()`: Navega al Home y marca intro como vista

## 🧪 Testing

### Ejecutar Tests
```bash
npm test
```

### Cobertura de Tests
- ✅ Creación del componente
- ✅ Navegación entre slides
- ✅ Límites de navegación
- ✅ Persistencia en Storage
- ✅ Cálculo de progreso
- ✅ Manejo de errores de imágenes
- ✅ Acceso seguro a datos
- ✅ Preferencias de animación

## 🎨 Personalización

### Cambiar Imágenes
Reemplaza las imágenes en `src/assets/images/`:
- `intro_1.png` - Bienvenido
- `intro_2.png` - Explora
- `intro_3.png` - Descubre
- `intro_4.png` - Listo

### Agregar Nuevo Tema
1. Agregar en `variables.scss`:
```scss
body.mi-tema-theme {
  --slide-background: #color;
  --slide-text-color: #color;
  --slide-secondary-text: #color;
  --slide-button-background: #color;
  --slide-button-text-color: #color;
}
```

2. Actualizar arrays en `intro.page.ts`:
```typescript
private slideToBaseMap = {
  // ...
  'mi-tema': 'mi-tema'
};

private bodyThemeClasses = [
  // ...
  'mi-tema-theme'
];
```

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Optimizado para todos los tamaños de pantalla con breakpoints adaptativos.

## ♿ Accesibilidad

- ✅ ARIA labels descriptivos
- ✅ Navegación por teclado
- ✅ Anuncios para lectores de pantalla
- ✅ Respeto a `prefers-reduced-motion`
- ✅ Contraste de colores adecuado
- ✅ Estructura semántica HTML

## 🚀 Performance

### Optimizaciones Implementadas
- Precarga de imágenes
- Lazy loading de animaciones
- Debouncing de eventos
- Cleanup en `ngOnDestroy`
- Animaciones con `will-change`

## 📝 Notas de Desarrollo

### Dependencias
- `@ionic/angular`: Framework UI
- `@angular/router`: Navegación
- `ionicons`: Iconografía

### Compatibilidad
- iOS 12+
- Android 5+
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🐛 Troubleshooting

### Las imágenes no cargan
- Verificar rutas en `assets/images/`
- Revisar consola para errores 404
- El sistema mostrará error y lo registrará en consola

### Los temas no cambian
- Verificar que `StorageService` esté funcionando
- Limpiar storage: `localStorage.clear()`

### Tests fallan
- Ejecutar `npm install` para dependencias
- Verificar que todos los servicios estén mockeados

## 📄 Licencia

Proyecto educativo - Spotify Pirata
