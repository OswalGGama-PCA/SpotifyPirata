import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
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
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  chevronForwardOutline, 
  arrowForwardOutline,
  colorPaletteOutline,
  imageOutline,
  musicalNotesOutline,
  searchOutline,
  sparklesOutline,
  rocketOutline,
  globeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.simple.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
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
      img: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'><defs>
        <linearGradient id='grad1' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='%23667eea' stop-opacity='0.9'/>
          <stop offset='100%' stop-color='%23764ba2' stop-opacity='0.9'/>
        </linearGradient>
        <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='10' stdDeviation='15' flood-color='rgba(102,126,234,0.4)'/>
        </filter>
      </defs>
      <rect width='400' height='240' rx='32' fill='url(%23grad1)' filter='url(%23shadow)'/>
      <text x='200' y='120' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' 
            font-family='Arial, sans-serif' font-weight='bold' opacity='0.9'>🎵</text>
      </svg>`,
      icon: musicalNotesOutline
    },
    {
      title: 'Explora',
      subtitle: 'Encuentra tu música favorita',
      text: 'Navega entre miles de artistas, géneros y playlists cuidadosamente seleccionadas para todos los gustos musicales.',
      img: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'><defs>
        <linearGradient id='grad2' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='%23f093fb' stop-opacity='0.9'/>
          <stop offset='100%' stop-color='%23f5576c' stop-opacity='0.9'/>
        </linearGradient>
        <filter id='shadow2' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='10' stdDeviation='15' flood-color='rgba(245,87,108,0.4)'/>
        </filter>
      </defs>
      <rect width='400' height='240' rx='32' fill='url(%23grad2)' filter='url(%23shadow2)'/>
      <text x='200' y='120' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' 
            font-family='Arial, sans-serif' font-weight='bold' opacity='0.9'>🔍</text>
      </svg>`,
      icon: searchOutline
    },
    {
      title: 'Descubre',
      subtitle: 'Recomendaciones inteligentes',
      text: 'Recibe sugerencias personalizadas diariamente basadas en tus gustos y hábitos de escucha.',
      img: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'><defs>
        <linearGradient id='grad3' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='%230ba360' stop-opacity='0.9'/>
          <stop offset='100%' stop-color='%233cba92' stop-opacity='0.9'/>
        </linearGradient>
        <filter id='shadow3' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='10' stdDeviation='15' flood-color='rgba(59,186,146,0.4)'/>
        </filter>
      </defs>
      <rect width='400' height='240' rx='32' fill='url(%23grad3)' filter='url(%23shadow3)'/>
      <text x='200' y='120' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' 
            font-family='Arial, sans-serif' font-weight='bold' opacity='0.9'>✨</text>
      </svg>`,
      icon: sparklesOutline
    },
    {
      title: 'Listo',
      subtitle: 'Comienza tu experiencia',
      text: 'Todo está configurado. Presiona comenzar y sumérgete en el mundo de la música como nunca antes.',
      img: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'><defs>
        <linearGradient id='grad4' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='%23cc0000' stop-opacity='0.9'/>
          <stop offset='100%' stop-color='%23ffd700' stop-opacity='0.9'/>
        </linearGradient>
        <filter id='shadow4' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='10' stdDeviation='15' flood-color='rgba(204,0,0,0.4)'/>
        </filter>
      </defs>
      <rect width='400' height='240' rx='32' fill='url(%23grad4)' filter='url(%23shadow4)'/>
      <text x='200' y='120' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' 
            font-family='Arial, sans-serif' font-weight='bold' opacity='0.9'>🚀</text>
      </svg>`,
      icon: rocketOutline
    }
  ];

  currentIndex = 0;
  slideTheme = 'theme-default';
  imageLoaded = false;
  isLoading = false;
  isMobile = false;
  prefersReducedMotion = false;
  announceMessage = '';

  // Map slide theme class -> base theme name used across the app and storage
  private slideToBaseMap: Record<string, string> = {
    'theme-default': 'light',
    'theme-dark': 'dark',
    'theme-ocean': 'ocean',
    'theme-sunset': 'sunset',
    'pirate-theme': 'pirate'
  };

  // List of body theme classes used by global styles
  private bodyThemeClasses = ['light-theme', 'dark-theme', 'ocean-theme', 'sunset-theme', 'forest-theme', 'pirate-theme'];

  // User friendly labels for themes
  private themeLabels: Record<string, string> = {
    light: 'Claro',
    dark: 'Oscuro',
    ocean: 'Ocean',
    sunset: 'Atardecer',
    forest: 'Bosque',
    pirate: '☠️ PIRATA'
  };

  private swipeGesture: any;
  private _parallaxHandlers?: { onMove: (e: MouseEvent) => void; onLeave: () => void; el?: any };

  constructor(
    private router: Router, 
    private storageService: StorageService,
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController,
    private toastController: ToastController
  ) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      arrowForwardOutline,
      colorPaletteOutline,
      imageOutline,
      musicalNotesOutline,
      searchOutline,
      sparklesOutline,
      rocketOutline,
      globeOutline
    });
  }

  private async restoreSlideTheme(): Promise<void> {
    const saved = await this.storageService.get<string>('theme');
    if (saved && this.bodyThemeClasses.includes(`${saved}-theme`)) {
      const baseToSlide: Record<string, string> = {
        light: 'theme-default',
        dark: 'theme-dark',
        ocean: 'theme-ocean',
        sunset: 'theme-sunset',
        pirate: 'pirate-theme'
      };
      this.slideTheme = baseToSlide[saved] || 'theme-default';

      document.body.classList.remove(...this.bodyThemeClasses);
      document.body.classList.add(`${saved}-theme`);
    } else {
      document.body.classList.remove(...this.bodyThemeClasses);
      document.body.classList.add('light-theme');
    }
  }

  async ngOnInit() {
    this.checkMobile();
    this.detectSwipeGestures();
    this.prefersReducedMotion = !!(window && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    await this.restoreSlideTheme();
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

  async toggleTheme() {
    // Ciclo entre temas con animación
    const themes = ['theme-default', 'theme-dark', 'theme-ocean', 'theme-sunset', 'pirate-theme'];
    const currentIdx = themes.indexOf(this.slideTheme);
    this.slideTheme = themes[(currentIdx + 1) % themes.length];

    // Map slideTheme -> base theme and apply to body
    const base = this.slideToBaseMap[this.slideTheme] || 'light';
    document.body.classList.remove(...this.bodyThemeClasses);
    document.body.classList.add(`${base}-theme`);

    // Save selected base theme for Home and other pages
    await this.storageService.set('theme', base);

    // Animación del botón de tema
    const button = document.querySelector('.theme-toggle ion-button');
    if (button) {
      const animation = this.animationCtrl.create()
        .addElement(button)
        .duration(600)
        .keyframes([
          { offset: 0, transform: 'rotate(0deg) scale(1)' },
          { offset: 0.5, transform: 'rotate(180deg) scale(0.9)' },
          { offset: 1, transform: 'rotate(360deg) scale(1)' }
        ]);
      
      if (!this.prefersReducedMotion) animation.play();
    }

    // Pirate badge feedback
    if (this.slideTheme === 'pirate-theme') {
      this.announceMessage = 'Tema pirata activado';
      const badge = document.querySelector('.pirate-badge') as HTMLElement | null;
      if (badge) {
        badge.classList.add('flash');
        setTimeout(() => badge.classList.remove('flash'), 900);
      }
      setTimeout(() => this.announceMessage = '', 1400);
    }
  }

  private async showThemeToast(base: string) {
    const label = this.themeLabels[base] || base;
    const toast = await this.toastController.create({
      message: `Tema: ${label}`,
      duration: 1400,
      position: 'bottom',
      cssClass: 'theme-toast'
    });

    await toast.present();
  }

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
    
    // Guardar en storage y navegar
    const base = this.slideToBaseMap[this.slideTheme] || 'light';
    await this.storageService.set('introSeen', true);
    await this.storageService.set('theme', base);

    // Mostrar toast con el tema activo antes de navegar
    await this.showThemeToast(base);

    this.router.navigate(['/home'], {
      state: { theme: base },
      replaceUrl: true
    });
  }

  onImageLoad() {
    this.imageLoaded = true;
    
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

  skipToEnd() {
    // Si estamos en el último slide, volver al inicio; si no, saltar al final.
    if (this.currentIndex === this.slides.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = this.slides.length - 1;
    }

    this.playEntranceAnimation();

    // Accesibilidad: anunciar y mover el foco al indicador correspondiente
    this.announceSlide();
    setTimeout(() => this.focusDot(this.currentIndex), 80);
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