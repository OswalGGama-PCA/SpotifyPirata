import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonFab, IonFabButton, IonIcon, IonProgressBar } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonFab, IonFabButton, IonIcon, IonProgressBar],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  currentTheme = 'light';
  themes = ['light', 'dark', 'ocean', 'sunset', 'forest'];

  progress = 0;

  artists: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    const artistNames = [
      'Coldplay', 'Metallica', 'Beyonce', 'Bad Bunny', 'Daft Punk', 'Marc Anthony',
      'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Drake', 'Rihanna',
      'The Weeknd', 'Billie Eilish', 'Justin Bieber', 'Lady Gaga', 'Bruno Mars',
      'Adele', 'Queen', 'The Beatles', 'Michael Jackson', 'Madonna', 'Eminem',
      'Shakira', 'U2', 'Bob Marley', 'David Bowie'
    ];
    
    artistNames.forEach(name => {
      this.http.get(`https://www.theaudiodb.com/api/v1/json/2/search.php?s=${name}`)
        .subscribe({
          next: (data: any) => {
            if (data.artists && data.artists.length > 0) {
              const artist = data.artists[0];
              this.artists.push({
                title: artist.strArtist,
                img: artist.strArtistThumb || artist.strArtistBanner || 'assets/default-artist.png',
                description: (artist.strBiographyEN || artist.strBiographyES || 'No description available').substring(0, 200) + '...',
                genre: artist.strGenre,
                country: artist.strCountry
              });
            }
          },
          error: (error) => {
            console.error('Error loading artist:', error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    });
  }

  onSlideChange(event: any) {
    const [swiper] = event.detail;
    if (this.artists.length > 0) {
      this.progress = (swiper.realIndex + 1) / this.artists.length;
    }
  }

  cambiarColor() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    
    // Remover tema anterior
    document.body.classList.remove(`${this.currentTheme}-theme`);
    
    // Aplicar nuevo tema
    this.currentTheme = this.themes[nextIndex];
    document.body.classList.add(`${this.currentTheme}-theme`);
  }
}