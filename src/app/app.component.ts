import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {register} from 'swiper/element/bundle';
import { FloatingPlayerComponent } from './components/floating-player/floating-player.component';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, FloatingPlayerComponent],
})
export class AppComponent {
  constructor() {}
}
