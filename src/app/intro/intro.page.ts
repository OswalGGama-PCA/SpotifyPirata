import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonProgressBar,
  AnimationController,
  GestureController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  chevronForwardOutline, 
  arrowForwardOutline,
  rocketOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.simple.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonButton,
    IonIcon,
    IonProgressBar,
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

  private swipeGesture: any;
  private _parallaxHandlers?: { onMove: (e: MouseEvent) => void; onLeave: () => void; el?: any };

  constructor(
    private router: Router, 
    private storageService: StorageService,
    private authService: AuthService,
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController,
    private toastController: ToastController
  ) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      arrowForwardOutline,
      rocketOutline
    });
    
    // Establecer tema dark (premium) por defecto
    this.setDarkTheme();
  }

  /**
   * Establece el tema dark premium por defecto
   */
  private setDarkTheme(): void {
    document.body.classList.remove('light-theme', 'ocean-theme', 'sunset-theme', 'forest-theme', 'pirate-theme');
    document.body.classList.add('dark-theme');
  }

  async ngOnInit() {
    this.checkMobile();
    this.detectSwipeGestures();
    this.prefersReducedMotion = !!(window && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    this.preloadImages(); // Precargar imágenes para mejor performance
  }

  /**
   * Precarga todas las imágenes de los slides
   * Mejora la experiencia de usuario al evitar delays en la navegación
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
   * @returns Slide en el índice especificado o el primero como fallback
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

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

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
          slide.style.transform = `translateX(${ev.deltaX}px) scale(${1 - Math.abs(ev.deltaX) / 1000})`;
          slide.style.opacity = `${1 - Math.abs(ev.deltaX) / 300}`;
        }
      },
      onEnd: (ev) => {
        const slide = element.querySelector('.slide.active');
        if (slide) {
          slide.style.transform = '';
          slide.style.opacity = '';
        }

        if (Math.abs(ev.deltaX) > 80) {
          if (ev.deltaX > 0) {
            this.prevWithAnimation();
          } else {
            this.nextWithAnimation();
          }
        }
      }
    });
    
    this.swipeGesture.enable(true);
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.nextWithAnimation();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.prevWithAnimation();
    }
  }

  private nextWithAnimation() {
    if (this.currentIndex >= this.slides.length - 1) return;
    
    const currentSlide = this.slidesWrapper?.nativeElement.querySelector('.slide.active');
    if (currentSlide) {
      const animation = this.animationCtrl.create()
        .addElement(currentSlide)
        .duration(300)
        .fromTo('transform', 'translateX(0)', 'translateX(-100%)')
        .fromTo('opacity', '1', '0');
      
      animation.play();
    }
    
    setTimeout(() => {
      this.currentIndex++;
      this.playEntranceAnimation();
    }, 150);
  }

  private prevWithAnimation() {
    if (this.currentIndex <= 0) return;
    
    const currentSlide = this.slidesWrapper?.nativeElement.querySelector('.slide.active');
    if (currentSlide) {
      const animation = this.animationCtrl.create()
        .addElement(currentSlide)
        .duration(300)
        .fromTo('transform', 'translateX(0)', 'translateX(100%)')
        .fromTo('opacity', '1', '0');
      
      animation.play();
    }
    
    setTimeout(() => {
      this.currentIndex--;
      this.playEntranceAnimation();
    }, 150);
  }

  private playEntranceAnimation() {
    const run = () => {
      const newSlide = this.slidesWrapper?.nativeElement.querySelector('.slide.active');
      if (newSlide) {
        const slideAnimation = this.animationCtrl.create()
          .addElement(newSlide)
          .duration(450)
          .fromTo('transform', 'translateY(20px) scale(0.95)', 'translateY(0) scale(1)')
          .fromTo('opacity', '0', '1');

        slideAnimation.play();

        const img = newSlide.querySelector('img');
        if (img) {
          const imgAnim = this.animationCtrl.create()
            .addElement(img)
            .duration(700)
            .easing('cubic-bezier(.22,.9,.3,1)')
            .fromTo('transform', 'translateY(12px) scale(0.98)', 'translateY(0) scale(1)')
            .fromTo('opacity', '0', '1');
          imgAnim.play();
        }
      }

      // Accessibility: announce and move focus
      this.announceSlide();
      setTimeout(() => this.focusDot(this.currentIndex), 80);
    };

    if (this.prefersReducedMotion) {
      run();
    } else {
      setTimeout(run, 50);
    }
  }


  /**
   * Navega al Home y marca la intro como vista
   * @returns Promise<void>
   */
  async goHome() {
    this.isLoading = true;
    
    // Desenfocar cualquier elemento activo
    (document.activeElement as HTMLElement)?.blur();
    
    // Animación de salida
    const content = document.querySelector('ion-content');
    if (content) {
      const animation = this.animationCtrl.create()
        .addElement(content)
        .duration(400)
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateY(0)', 'translateY(-30px)');
      
      await animation.play();
    }
    
    // Guardar que vio la intro y navegar (User Specific)
    const user = this.authService.currentUser;
    if (user) {
      const key = `introSeen_${user.id}`;
      await this.storageService.set(key, true);
    } else {
      console.warn('No user found when creating storage key, falling back to global key');
      await this.storageService.set('introSeen', true);
    }

    // Navegar a /menu/home (la nueva ruta con el layout de menú)
    this.router.navigate(['/menu/home'], {
      replaceUrl: true
    });
  }

  onImageLoad() {
    this.imageLoaded = true;
    this.imageError = false;
    
    // Animación sutil al cargar la imagen
    const image = this.slidesWrapper?.nativeElement.querySelector('.slide.active img');
    if (image) {
      const animation = this.animationCtrl.create()
        .addElement(image)
        .duration(500)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'scale(1.05)', 'scale(1)');
      
      animation.play();
    }
  }

  /**
   * Maneja errores de carga de imágenes
   * Muestra un placeholder o ícono de respaldo
   */
  onImageError() {
    this.imageError = true;
    this.imageLoaded = false;
    console.warn(`Error loading image for slide: ${this.slides[this.currentIndex]?.title}`);
  }

  async skipToEnd() {
    // Si estamos en el último slide, ir a home
    if (this.currentIndex === this.slides.length - 1) {
      await this.goHome();
    } else {
      // Si no, saltar al último slide
      this.currentIndex = this.slides.length - 1;
      this.playEntranceAnimation();
      
      // Accesibilidad: anunciar y mover el foco al indicador correspondiente
      this.announceSlide();
      setTimeout(() => this.focusDot(this.currentIndex), 80);
    }
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.slides.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.playEntranceAnimation();

      // Accessibility: announce and focus the corresponding dot
      this.announceSlide();
      setTimeout(() => this.focusDot(this.currentIndex), 60);
    }
  }

  private announceSlide() {
    const s = this.slides[this.currentIndex];
    this.announceMessage = `${s.title}. ${s.subtitle}`;
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