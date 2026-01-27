import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonSplitPane,
  IonMenu,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle,
  IonRouterOutlet
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  playCircleOutline,
  settingsOutline,
  logOutOutline,
  menuOutline,
  peopleOutline,
  colorPaletteOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonSplitPane,
    IonMenu,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    IonRouterOutlet,
    CommonModule, 
    FormsModule
  ]
})
export class MenuPage implements OnInit {
  currentPage: 'home' | 'intro' | 'artists' = 'home';
  pageTitle = 'Inicio';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private storageService: StorageService,
    private router: Router
  ) {
    // Registrar iconos
    addIcons({
      homeOutline,
      playCircleOutline,
      settingsOutline,
      logOutOutline,
      menuOutline,
      peopleOutline,
      colorPaletteOutline
    });

    // Detectar cambios de ruta para actualizar el título y página activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateCurrentPage(event.url);
    });
  }

  /**
   * Al iniciar, revisamos en qué ruta estamos para marcar el menú.
   */
  ngOnInit() {
    // Establecer página inicial basada en la ruta actual
    this.updateCurrentPage(this.router.url);
  }

  /**
   * Mira en qué parte de la app estamos para poner el título correcto arriba.
   */
  private updateCurrentPage(url: string) {
    if (url.includes('/menu/home')) {
      this.currentPage = 'home';
      this.pageTitle = 'Inicio';
    } else if (url.includes('/menu/artists')) {
      this.currentPage = 'artists';
      this.pageTitle = 'Artistas';
    } else if (url.includes('/intro')) {
      this.currentPage = 'intro';
      this.pageTitle = 'Introducción';
    }
  }

  /**
   * Me manda directo al inicio.
   */
  navigateToHome() {
    this.router.navigate(['/menu/home']);
  }

  /**
   * Navegación a la lista de artistas.
   */
  navigateToArtists() {
    this.router.navigate(['/menu/artists']);
  }

  /**
   * Nos lleva de vuelta a la introducción de la app.
   */
  navigateToIntro() {
    this.router.navigate(['/intro']);
  }

  /**
   * Botón para cambiar entre los diferentes estilos visuales.
   */
  async cambiarTema() {
    await this.themeService.toggleTheme();
  }

  /**
   * Opción para volver a ver los slides de bienvenida.
   */
  async verIntro() {
    const user = this.authService.currentUser;
    if (user) {
      await this.storageService.remove(`introSeen_${user.id}`);
    }
    await this.storageService.remove('introSeen');
    
    this.router.navigate(['/intro']);
  }

  /**
   * Sale de la cuenta y nos manda al login.
   */
  async logout() {
    await this.authService.logout();
  }
}
