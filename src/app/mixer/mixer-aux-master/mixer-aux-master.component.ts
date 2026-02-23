import { Component, computed, input } from '@angular/core';
import { ScaleKnobComponent } from '../shared/scale-knob/scale-knob.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';

// Aux send buses map to mixer outputs 1-4
const AUX_OUTPUTS = [1, 2, 3, 4] as const;

@Component({
  selector: 'app-mixer-aux-master',
  standalone: true,
  imports: [ScaleKnobComponent],
  templateUrl: './mixer-aux-master.component.html',
  styleUrls: ['./mixer-aux-master.component.scss']
})
export class MixerAuxMasterComponent {
  mixer = input.required<QrwcMixerComponent>();

  // Derive the 4 aux bus states as a plain-object array so the template
  // can @for over concrete values. Recomputes whenever any output signal changes.
  auxBuses = computed(() =>
    AUX_OUTPUTS.map(output => ({
      gain: this.mixer().getOutputGain(output)(),
      mute: this.mixer().getOutputMute(output)(),
      // VU & clip: TODO — wire to QrwcMeterComponent when available
      vuLevel: 0,
      clip: false
    }))
  );

  onGainChange(busIndex: number, value: number): void {
    this.mixer().SetOutputGain(AUX_OUTPUTS[busIndex], value);
  }

  onMuteToggle(busIndex: number): void {
    const out = AUX_OUTPUTS[busIndex];
    this.mixer().SetOutputMute(out, !this.mixer().getOutputMute(out)());
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  formatGain(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
