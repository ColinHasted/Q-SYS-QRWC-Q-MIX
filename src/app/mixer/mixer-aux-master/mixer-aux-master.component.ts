import { Component, computed, inject, input } from '@angular/core';
import { ScaleKnobComponent } from '../shared/scale-knob/scale-knob.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';
import { MIXER_PROFILE } from '../mixer-profile';

@Component({
  selector: 'app-mixer-aux-master',
  standalone: true,
  imports: [ScaleKnobComponent],
  templateUrl: './mixer-aux-master.component.html',
  styleUrls: ['./mixer-aux-master.component.scss']
})
export class MixerAuxMasterComponent {
  private readonly profile = inject(MIXER_PROFILE);

  mixer = input.required<QrwcMixerComponent>();

  /** Aux output indices from the active profile (e.g. [1,2,3,4]). */
  private readonly auxOutputs = this.profile.auxOutputs;

  // Derive the aux bus states as a plain-object array so the template
  // can @for over concrete values. Recomputes whenever any output signal changes.
  auxBuses = computed(() =>
    this.auxOutputs.map(output => ({
      output,
      gainPosition: this.mixer().getOutputGainPosition(output)(),
      mute: this.mixer().getOutputMute(output)(),
      prePost: this.mixer().getOutputPrePost(output)(),
      // VU & clip: TODO — wire to QrwcMeterComponent when available
      vuLevel: 0,
      clip: false
    }))
  );

  onGainChange(busIndex: number, position: number): void {
    this.mixer().SetOutputGainPosition(this.auxOutputs[busIndex], position);
  }

  onMuteToggle(busIndex: number): void {
    const out = this.auxOutputs[busIndex];
    this.mixer().SetOutputMute(out, !this.mixer().getOutputMute(out)());
  }

  onPrePostToggle(busIndex: number): void {
    const out = this.auxOutputs[busIndex];
    this.mixer().SetOutputPrePost(out, !this.mixer().getOutputPrePost(out)());
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 8 }, (_, i) => level >= (i + 1) * 12.5);
  }

  formatGain(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
