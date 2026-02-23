import { Component, input, output, computed, inject } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-aux-sends',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-aux-sends.component.html',
  styleUrls: ['./mixer-aux-sends.component.scss']
})
export class MixerAuxSendsComponent {
  // Inputs: current channel and mixer QRWC component
  channel = input.required<number>();
  mixer = input.required<any>(); // QrwcMixerComponent

  // Computed: get aux send levels (crosspoint 1-4) for the current channel
  auxSend1 = computed(() => this.mixer().getCrosspointGain(this.channel(), 1)());
  auxSend2 = computed(() => this.mixer().getCrosspointGain(this.channel(), 2)());
  auxSend3 = computed(() => this.mixer().getCrosspointGain(this.channel(), 3)());
  auxSend4 = computed(() => this.mixer().getCrosspointGain(this.channel(), 4)());

  protected onAuxSendChange(auxIndex: number, value: number): void {
    // auxIndex is 0-3, but crosspoint outputs are 1-4
    this.mixer().SetCrosspointGain(this.channel(), auxIndex + 1, value);
  }

  protected getAuxSend(index: number): number {
    switch(index) {
      case 0: return this.auxSend1();
      case 1: return this.auxSend2();
      case 2: return this.auxSend3();
      case 3: return this.auxSend4();
      default: return -60;
    }
  }
}
