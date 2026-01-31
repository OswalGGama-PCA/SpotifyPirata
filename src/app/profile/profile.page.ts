import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonBadge,
  IonChip
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FavoritesService } from '../services/favorites.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  musicalNotesOutline,
  trophyOutline,
  skullOutline,
  timeOutline,
  heartOutline,
  peopleOutline,
  settingsOutline,
  createOutline,
  shieldCheckmarkOutline,
  flameOutline,
  starOutline,
  rocketOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonList,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonButton,
    IonBadge,
    IonChip,
    CommonModule,
    FormsModule
  ]
})
export class ProfilePage implements OnInit {
  user: any = null;
  favoritesCount: number = 0;
  pirateLevel: string = 'Grumete';
  avatarUrl: string = '';

  // Nuevas estadísticas
  stats = {
    songsPlayed: 0,
    hoursListened: 0,
    artistsFollowed: 0,
    playlists: 0
  };

  // Logros
  achievements: any[] = [];

  // Actividad reciente
  recentActivity: any[] = [];

  // Top géneros
  topGenres: string[] = [];

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {
    addIcons({
      logOutOutline,
      musicalNotesOutline,
      trophyOutline,
      skullOutline,
      timeOutline,
      heartOutline,
      peopleOutline,
      settingsOutline,
      createOutline,
      shieldCheckmarkOutline,
      flameOutline,
      starOutline,
      rocketOutline
    });
  }

  ngOnInit() {
    this.user = this.authService.currentUser;
    const seed = this.user?.name || this.user?.email || 'Captain';
    this.avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

    // Suscribirse al conteo de favoritos real
    this.favoritesService.favorites$.subscribe(favs => {
      this.favoritesCount = favs.length;
      this.calculateStats();
      this.calculatePirateLevel();
      this.loadAchievements();
      this.loadRecentActivity();
    });
  }

  calculateStats() {
    // Simulamos estadísticas basadas en favoritos
    this.stats.songsPlayed = this.favoritesCount * 12;
    this.stats.hoursListened = Math.floor(this.favoritesCount * 0.5);
    this.stats.artistsFollowed = Math.floor(this.favoritesCount / 2);
    this.stats.playlists = Math.floor(this.favoritesCount / 5);

    // Top géneros (simulados)
    this.topGenres = ['Rock', 'Pop', 'Hip Hop'].slice(0, Math.min(3, Math.ceil(this.favoritesCount / 3)));
  }

  calculatePirateLevel() {
    if (this.favoritesCount > 20) this.pirateLevel = '🏴‍☠️ Capitán Legendario';
    else if (this.favoritesCount > 10) this.pirateLevel = '⚓ Contramaestre';
    else if (this.favoritesCount > 5) this.pirateLevel = '⚔️ Bucanero';
    else this.pirateLevel = '🌊 Grumete de Cubierta';
  }

  loadAchievements() {
    this.achievements = [];

    if (this.favoritesCount >= 1) {
      this.achievements.push({
        icon: 'heart-outline',
        title: 'Primer Tesoro',
        description: 'Agregaste tu primera canción favorita',
        color: 'danger',
        unlocked: true
      });
    }

    if (this.favoritesCount >= 5) {
      this.achievements.push({
        icon: 'flame-outline',
        title: 'Coleccionista',
        description: '5 tesoros en tu cofre',
        color: 'warning',
        unlocked: true
      });
    }

    if (this.favoritesCount >= 10) {
      this.achievements.push({
        icon: 'star-outline',
        title: 'Melómano Pirata',
        description: '10 canciones favoritas',
        color: 'tertiary',
        unlocked: true
      });
    }

    if (this.favoritesCount >= 20) {
      this.achievements.push({
        icon: 'rocket-outline',
        title: 'Leyenda Musical',
        description: '20+ tesoros musicales',
        color: 'success',
        unlocked: true
      });
    }

    // Logros bloqueados
    if (this.favoritesCount < 50) {
      this.achievements.push({
        icon: 'shield-checkmark-outline',
        title: 'Maestro del Mar',
        description: 'Alcanza 50 favoritos',
        color: 'medium',
        unlocked: false
      });
    }
  }

  loadRecentActivity() {
    // Simulamos actividad reciente
    this.recentActivity = [
      { action: 'Agregaste a favoritos', song: 'Canción reciente', time: 'Hace 2 horas' },
      { action: 'Escuchaste', song: 'Top Hit 2024', time: 'Hace 5 horas' },
      { action: 'Descubriste', song: 'Nuevo artista', time: 'Ayer' }
    ].slice(0, Math.min(3, this.favoritesCount));
  }

  navigateToSettings() {
    // Aquí podrías navegar a una página de configuración
    console.log('Navigate to settings');
  }

  navigateToEditProfile() {
    // Aquí podrías navegar a editar perfil
    console.log('Edit profile');
  }

  async logout() {
    await this.authService.logout();
  }
}
