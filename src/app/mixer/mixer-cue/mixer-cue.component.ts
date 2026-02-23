import { Component, computed, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';

const CUE_BUS = 1;

@Component({
  selector: 'app-mixer-cue',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-cue.component.html',
  styleUrls: ['./mixer-cue.component.scss']
})
export class MixerCueComponent {
  mixer = input.required<QrwcMixerComponent>();

  // 'on' = cue bus is NOT muted
  on = computed(() => !this.mixer().getCueMute(CUE_BUS)());
  gain = computed(() => this.mixer().getCueGain(CUE_BUS)());

  // VU meters: TODO — wire to QrwcMeterComponent when available
  vuLevelL = computed(() => 0);
  vuLevelR = computed(() => 0);
  clipL = computed(() => false);
  clipR = computed(() => false);

  onToggle(): void {
    this.mixer().SetCueMute(CUE_BUS, this.on()); // on()=true → set muted
  }

  onGainChange(value: number): void {
    this.mixer().SetCueGain(CUE_BUS, value);
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  formatGain(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
