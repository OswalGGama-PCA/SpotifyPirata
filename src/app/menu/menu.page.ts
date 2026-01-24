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
  menuOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

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
  currentPage: 'home' | 'intro' = 'home';
  pageTitle = 'Inicio';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    // Registrar iconos
    addIcons({
      homeOutline,
      playCircleOutline,
      settingsOutline,
      logOutOutline,
      menuOutline
    });

    // Detectar cambios de ruta para actualizar el título y página activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateCurrentPage(event.url);
    });
  }

  ngOnInit() {
    // Establecer página inicial basada en la ruta actual
    this.updateCurrentPage(this.router.url);
  }

  /**
   * Actualiza la página actual y el título basado en la URL
   */
  private updateCurrentPage(url: string) {
    if (url.includes('/menu/home')) {
      this.currentPage = 'home';
      this.pageTitle = 'Inicio';
    } else if (url.includes('/intro')) {
      this.currentPage = 'intro';
      this.pageTitle = 'Introducción';
    }
  }

  /**
   * Navega a la página Home
   */
  navigateToHome() {
    this.router.navigate(['/menu/home']);
  }

  /**
   * Navega a la página Intro
   */
  navigateToIntro() {
    this.router.navigate(['/intro']);
  }

  /**
   * Cambia el tema de la aplicación
   */
  async cambiarTema() {
    await this.themeService.toggleTheme();
  }

  /**
   * Ver la intro desde el menú lateral
   */
  verIntro() {
    this.router.navigate(['/intro']);
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout() {
    await this.authService.logout();
  }
}
