import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-aux-sends',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-aux-sends.component.html',
  styleUrls: ['./mixer-aux-sends.component.scss']
})
export class MixerAuxSendsComponent {
    selectedChannel = input<number>(1);

  auxSends = input.required<number[]>();

  auxSendChange = output<{ index: number; value: number }>();

  protected onAuxSendChange(index: number, value: number): void {
    this.auxSendChange.emit({ index, value });
  }
}
