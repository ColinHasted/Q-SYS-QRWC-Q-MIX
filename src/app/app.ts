import { Component } from '@angular/core';
import { MixerComponent } from './mixer/mixer.component';

@Component({
  selector: 'app-root',
  imports: [MixerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
