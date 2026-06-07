import { Component, computed, inject, input } from '@angular/core';
import { FaderComponent } from '../shared/fader/fader.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';
import { MIXER_PROFILE } from '../mixer-profile';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-master',
  standalone: true,
  imports: [FaderComponent],
  templateUrl: './mixer-master.component.html',
  styleUrls: ['./mixer-master.component.scss']
})
export class MixerMasterComponent {
  private readonly profile = inject(MIXER_PROFILE);
  private readonly channelProcessing = inject(ChannelProcessingService);

  mixer = input.required<QrwcMixerComponent>();

  /** Main stereo output index (from active profile). */
  private readonly mainOutput = this.profile.mainOutput;
  private readonly mainLineOutChannels = this.profile.mainLineOutChannels;

  // Real QRWC signals
  gain = computed(() => this.mixer().getOutputGain(this.mainOutput)());
  mute = computed(() => this.mixer().getOutputMute(this.mainOutput)());

  // VU meters wired to Line_Out_Core channels 5 (L) and 6 (R)
  vuLevelL = computed(() => this.channelProcessing.lineOut.getDigitalOutputLevel(this.mainLineOutChannels[0])());
  vuLevelR = computed(() => this.channelProcessing.lineOut.getDigitalOutputLevel(this.mainLineOutChannels[1])());
  clipL    = computed(() => this.channelProcessing.lineOut.getClip(this.mainLineOutChannels[0])());
  clipR    = computed(() => this.channelProcessing.lineOut.getClip(this.mainLineOutChannels[1])());

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
