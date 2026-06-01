import { Component, computed, inject, input } from '@angular/core';
import { FaderComponent } from '../shared/fader/fader.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';
import { MIXER_PROFILE } from '../mixer-profile';

@Component({
  selector: 'app-mixer-master',
  standalone: true,
  imports: [FaderComponent],
  templateUrl: './mixer-master.component.html',
  styleUrls: ['./mixer-master.component.scss']
})
export class MixerMasterComponent {
  private readonly profile = inject(MIXER_PROFILE);

  mixer = input.required<QrwcMixerComponent>();

  /** Main stereo output index (from active profile). */
  private readonly mainOutput = this.profile.mainOutput;

  // Real QRWC signals
  gain = computed(() => this.mixer().getOutputGain(this.mainOutput)());
  mute = computed(() => this.mixer().getOutputMute(this.mainOutput)());

  // VU meters: TODO — wire to a QrwcMeterComponent when available
  vuLevelL = 0;
  vuLevelR = 0;
  clipL = false;
  clipR = false;

  onFaderChange(dB: number): void {
    this.mixer().SetOutputGain(this.mainOutput, dB);
  }

  onMuteToggle(): void {
    this.mixer().SetOutputMute(this.mainOutput, !this.mute());
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }
}
