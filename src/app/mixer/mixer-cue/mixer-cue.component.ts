import { Component, computed, inject, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';
import { MIXER_PROFILE } from '../mixer-profile';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-cue',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-cue.component.html',
  styleUrls: ['./mixer-cue.component.scss']
})
export class MixerCueComponent {
  private readonly profile = inject(MIXER_PROFILE);
  private readonly channelProcessing = inject(ChannelProcessingService);
  private readonly cueBus = this.profile.cueBus;
  private readonly cueLineOutChannels = this.profile.cueLineOutChannels;

  mixer = input.required<QrwcMixerComponent>();

  // 'on' = cue bus is NOT muted
  on = computed(() => !this.mixer().getCueMute(this.cueBus)());
  gain = computed(() => this.mixer().getCueGain(this.cueBus)());

  // VU meters wired to Line_Out_Core channels 7 (L) and 8 (R)
  vuLevelL = computed(() => this.channelProcessing.lineOut.getDigitalOutputLevel(this.cueLineOutChannels[0])());
  vuLevelR = computed(() => this.channelProcessing.lineOut.getDigitalOutputLevel(this.cueLineOutChannels[1])());
  clipL    = computed(() => this.channelProcessing.lineOut.getClip(this.cueLineOutChannels[0])());
  clipR    = computed(() => this.channelProcessing.lineOut.getClip(this.cueLineOutChannels[1])());

  onToggle(): void {
    this.mixer().SetCueMute(this.cueBus, this.on()); // on()=true → set muted
  }

  onGainChange(value: number): void {
    this.mixer().SetCueGain(this.cueBus, value);
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  formatGain(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
