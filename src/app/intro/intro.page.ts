import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonProgressBar,
  IonFab,
  IonFabButton,
  AnimationController,
  GestureController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  chevronForwardOutline, 
  arrowForwardOutline,
  rocketOutline,
  colorPaletteOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonButton,
    IonIcon,
    IonProgressBar,
    IonFab,
    IonFabButton,
    CommonModule, 
    FormsModule
  ]
})
export class IntroPage implements OnInit, AfterViewInit {
  @ViewChild('slidesWrapper', { static: false }) slidesWrapper!: ElementRef;

  slides = [
    {
      title: 'Bienvenido',
      subtitle: 'Descubre una experiencia única',
      text: 'Explora todas las características que tenemos preparadas para ti. Una plataforma diseñada para amantes de la música.',

      img: 'assets/images/intro_1.png'
    },
    {
      title: 'Explora',
      subtitle: 'Encuentra tu música favorita',
      text: 'Navega entre miles de artistas, géneros y playlists cuidadosamente seleccionadas para todos los gustos musicales.',

      img: 'assets/images/intro_2.png'
    },
    {
      title: 'Descubre',
      subtitle: 'Recomendaciones inteligentes',
      text: 'Recibe sugerencias personalizadas diariamente basadas en tus gustos y hábitos de escucha.',

      img: 'assets/images/intro_3.png'
    },
    {
      title: 'Listo',
      subtitle: 'Comienza tu experiencia',
      text: 'Todo está configurado. Presiona comenzar y sumérgete en el mundo de la música como nunca antes.',

      img: 'assets/images/intro_4.png'
    }
  ];

  currentIndex = 0;
  imageLoaded = false;
  imageError = false;
  isLoading = false;
  isMobile = false;
  prefersReducedMotion = false;
  announceMessage = '';
  isAnimating = false;

  private swipeGesture: any;
  private _parallaxHandlers?: { onMove: (e: MouseEvent) => void; onLeave: () => void; el?: any };

  constructor(
    private router: Router, 
    private storageService: StorageService,
    private authService: AuthService,
    private themeService: ThemeService,
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController,
    private toastController: ToastController
  ) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      arrowForwardOutline,
      rocketOutline,
      colorPaletteOutline
    });
  }


  /**
   * Al iniciar, configuramos gestos y detectamos si es móvil.
   */
  async ngOnInit() {
    this.checkMobile();
    this.detectSwipeGestures();
    this.prefersReducedMotion = !!(window && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    this.preloadImages();
  }

  /**
   * Precarga las imágenes para que la navegación sea fluida.
   */
  private preloadImages(): void {
    this.slides.forEach(slide => {
      if (slide.img) {
        const img = new Image();
        img.src = slide.img;
      }
    });
  }

  /**
   * Obtiene un slide de forma segura
   * @param index - Índice del slide
   * @returns 
   */
  getSafeSlide(index: number) {
    return this.slides[index] || this.slides[0];
  }

  /**
   * Verifica si se deben ejecutar animaciones
   * Respeta las preferencias de accesibilidad del usuario
   * @returns boolean - true si se deben animar
   */
  private shouldAnimate(): boolean {
    return !this.prefersReducedMotion;
  }

  ngAfterViewInit() {
    this.setupSwipeGestures();
    this.enableParallax();
  }

  /**
   * Detecta cambios en el tamaño de la pantalla.
   */
  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  /**
   * Revisa si la pantalla es de tamaño móvil.
   */
  private checkMobile() {
    this.isMobile = window.innerWidth <= 767;
  }

  private detectSwipeGestures() {
    let startX: number;
    let startY: number;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Solo procesar si el movimiento es principalmente horizontal
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }

  private setupSwipeGestures() {
    const element = this.slidesWrapper?.nativeElement;
    if (!element) return;

    this.swipeGesture = this.gestureCtrl.create({
      el: element,
      gestureName: 'swipe',
      onStart: () => {},
      onMove: (ev) => {
        // Efecto visual durante el swipe
        const slide = element.querySelector('.slide.active');
        if (slide) {
          // Desactivar transición CSS para evitar "doble" efecto o lag
          slide.style.transition = 'none'; 
          slide.style.transform = `translateX(${ev.deltaX}px) scale(${1 - Math.abs(ev.deltaX) / 1000})`;
          slide.style.opacity = `${1 - Math.abs(ev.deltaX) / 300}`;
        }
      },
      onEnd: (ev) => {
        const slide = element.querySelector('.slide.active') as HTMLElement;
        if (slide) {
          // Restaurar transición y limpiar estilos inline
          slide.style.transition = ''; 
          slide.style.transform = '';
          slide.style.opacity = '';
        }

        if (Math.abs(ev.deltaX) > 80) {
          if (ev.deltaX > 0) {
            this.prev();
          } else {
            this.next();
          }
        }
      }
    });
    
    this.swipeGesture.enable(true);
  }

  /**
   * Botón para ir al siguiente slide.
   */
  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
      this.announceSlide();
    }
  }

  /**
   * Botón para volver al slide anterior.
   */
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.announceSlide();
    }
  }

  // Métodos simplificados eliminando animaciones JS complejas que causan conflictos
  // Las transiciones ahora se manejan puramente via CSS en intro.page.scss
  
  /**
   * Navega directamente a un slide específico (para los dots)
   */
  goToSlide(index: number) {
    if (index >= 0 && index < this.slides.length) {
      this.currentIndex = index;
      this.announceSlide();
    }
  }

  /**
   * Navega al Home y marca la intro como vista
   */
  async goHome() {
    this.isLoading = true;
    
    // Guardar que vio la intro y navegar (User Specific)
    const user = this.authService.currentUser;
    if (user) {
      const key = `introSeen_${user.id}`;
      await this.storageService.set(key, true);
    } else {
      await this.storageService.set('introSeen', true);
    }

    // Navegar a /menu/home
    this.router.navigate(['/menu/home'], {
      replaceUrl: true
    });
  }

  onImageLoad() {
    this.imageLoaded = true;
    this.imageError = false;
  }

  onImageError() {
    this.imageError = true;
    this.imageLoaded = false;
  }

  async skipToEnd() {
    await this.goHome();
  }

  async restartIntro() {
    this.currentIndex = 0;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private announceSlide() {
    const s = this.slides[this.currentIndex];
    if (s) {
      this.announceMessage = `${s.title}. ${s.subtitle}`;
    }
  }

  private focusDot(index: number) {
    const el = this.slidesWrapper?.nativeElement;
    const dots = el?.querySelectorAll('.dots button.dot');
    if (dots && dots[index]) {
      (dots[index] as HTMLElement).focus();
    }
  }

  private enableParallax() {
    const el = this.slidesWrapper?.nativeElement;
    if (!el || this.isMobile || this.prefersReducedMotion) return;

    const onMove = (ev: MouseEvent) => {
      const img = el.querySelector('.card-image img') as HTMLElement | null;
      if (!img) return;
      const rect = el.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width - 0.5;
      const y = (ev.clientY - rect.top) / rect.height - 0.5;
      const tx = x * 10;
      const ty = y * 6;
      img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
    };

    const onLeave = () => {
      const img = el.querySelector('.card-image img') as HTMLElement | null;
      if (img) img.style.transform = '';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    this._parallaxHandlers = { onMove, onLeave, el };
  }

  /**
   * Obtiene el valor para la barra de progreso de la intro.
   */
  getProgressValue(): number {
    return (this.currentIndex + 1) / this.slides.length;
  }

  ngOnDestroy() {
    // Limpiar gesture
    if (this.swipeGesture) {
      this.swipeGesture.destroy();
    }

    // Limpiar parallax
    if (this._parallaxHandlers) {
      this._parallaxHandlers.el.removeEventListener('mousemove', this._parallaxHandlers.onMove);
      this._parallaxHandlers.el.removeEventListener('mouseleave', this._parallaxHandlers.onLeave);
    }
  }
}