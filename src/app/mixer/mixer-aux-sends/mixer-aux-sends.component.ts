import { Component, input, output } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-aux-sends',
  standalone: true,
  imports: [GaugeKnobComponent],
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
