import { Component, computed, input, signal } from '@angular/core';
import { FaderComponent } from '../shared/fader/fader.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';

// Output 5 = main stereo output. Outputs 1-4 are the 4 aux send buses.
const MAIN_OUTPUT = 5;

@Component({
  selector: 'app-mixer-master',
  standalone: true,
  imports: [FaderComponent],
  templateUrl: './mixer-master.component.html',
  styleUrls: ['./mixer-master.component.scss']
})
export class MixerMasterComponent {
  mixer = input.required<QrwcMixerComponent>();

  // Real QRWC signals
  gain = computed(() => this.mixer().getOutputGain(MAIN_OUTPUT)());
  mute = computed(() => this.mixer().getOutputMute(MAIN_OUTPUT)());

  // Local UI state — select has no Q-SYS mapping yet
  select = signal(false);

  // VU meters: TODO — wire to a QrwcMeterComponent when available
  vuLevelL = 0;
  vuLevelR = 0;
  clipL = false;
  clipR = false;

  onFaderChange(dB: number): void {
    this.mixer().SetOutputGain(MAIN_OUTPUT, dB);
  }

  onMuteToggle(): void {
    this.mixer().SetOutputMute(MAIN_OUTPUT, !this.mute());
  }

  onSelectToggle(): void {
    this.select.update(s => !s);
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }
}
