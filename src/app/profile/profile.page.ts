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
  IonCardContent
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FavoritesService } from '../services/favorites.service';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  musicalNotesOutline, 
  trophyOutline, 
  skullOutline 
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
    CommonModule, 
    FormsModule
  ]
})
export class ProfilePage implements OnInit {
  user: any = null;
  favoritesCount: number = 0;
  pirateLevel: string = 'Grumete';
  avatarUrl: string = '';

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService
  ) { 
    addIcons({ logOutOutline, musicalNotesOutline, trophyOutline, skullOutline });
  }

  ngOnInit() {
    this.user = this.authService.currentUser;
    const seed = this.user?.firstName || this.user?.email || 'Captain';
    // Usamos el estilo 'adventurer' que es más robusto y temático
    this.avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
    
    // Suscribirse al conteo de favoritos real
    this.favoritesService.favorites$.subscribe(favs => {
      this.favoritesCount = favs.length;
      this.calculatePirateLevel();
    });
  }

  calculatePirateLevel() {
    if (this.favoritesCount > 20) this.pirateLevel = 'Capitán Legendario';
    else if (this.favoritesCount > 10) this.pirateLevel = 'Contramaestre';
    else if (this.favoritesCount > 5) this.pirateLevel = 'Bucanero';
    else this.pirateLevel = 'Grumete de Cubierta';
  }

  async logout() {
    await this.authService.logout();
  }
}
