import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonBadge,
  IonSkeletonText,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { MusicService } from '../services/music.service';
import { addIcons } from 'ionicons';
import { peopleOutline, musicalNotesOutline, statsChartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.page.html',
  styleUrls: ['./artists.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar, 
    IonBadge,
    IonSkeletonText,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    CommonModule, 
    FormsModule
  ]
})
export class ArtistsPage implements OnInit {
  artists: any[] = [];
  filteredArtists: any[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(private musicService: MusicService, private router: Router) {
    addIcons({
      peopleOutline,
      musicalNotesOutline,
      statsChartOutline
    });
  }

  /**
   * En cuanto entro, traigo a todos los músicos para mostrarlos.
   */
  ngOnInit() {
    this.loadArtists();
  }
  
  /**
   * Navega a la página de música buscando automáticamente al artista seleccionado
   */
  goToArtistMusic(artistName: string) {
    this.router.navigate(['/menu/music'], {
      queryParams: { q: artistName }
    });
  }

  /**
   * Le pido al MusicService que me de la lista completa.
   */
  loadArtists() {
    this.isLoading = true;
    this.musicService.getArtists().subscribe({
      next: (data) => {
        this.artists = data;
        this.filteredArtists = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando artistas:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Esta función se encarga de filtrar la lista mientras escribes en el buscador.
   */
  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.searchTerm = query;
    
    if (!query) {
      this.filteredArtists = this.artists;
      return;
    }

    this.filteredArtists = this.artists.filter(artist => 
      artist.name.toLowerCase().includes(query) || 
      (artist.genres && artist.genres.some((g: string) => g.toLowerCase().includes(query)))
    );
  }
  /**
   * Optimización de rendimiento para ngFor
   */
  trackByArtist(index: number, artist: any): number {
    return artist.id;
  }
}
