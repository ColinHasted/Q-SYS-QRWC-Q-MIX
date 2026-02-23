import { Component, computed, inject, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-input',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-input.component.html',
  styleUrls: ['./mixer-input.component.scss']
})
export class MixerInputComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);

  channel = input.required<number>();

  // Resolve the correct block and local channel number reactively
  private micInput = computed(() => this.channelProcessing.getMicInputBlock(this.channel()));
  private localCh  = computed(() => this.channelProcessing.getLocalMicChannel(this.channel()));

  // QRWC signals — reactive to channel changes
  gain    = computed(() => this.micInput().getInputGain(this.localCh())());
  invert  = computed(() => this.micInput().getInputInvert(this.localCh())());
  phantom = computed(() => this.micInput().getPhantomPower(this.localCh())());
  // 'on' = not muted
  on      = computed(() => !this.micInput().getInputMute(this.localCh())());
  // VU from the digital input level (dBFS). TODO: normalise range if needed.
  vuLevel = computed(() => this.micInput().getDigitalInputLevel(this.localCh())());
  clip    = computed(() => this.micInput().getClip(this.localCh())());

  protected getVUSegments(): boolean[] {
    return Array.from({ length: 12 }, (_, i) => this.vuLevel() >= (i + 1) * 8.33);
  }

  protected onGainChange(value: number): void {
    this.micInput().SetInputGain(this.localCh(), value);
  }

  protected onInvertToggle(): void {
    this.micInput().SetInputInvert(this.localCh(), !this.invert());
  }

  protected onPhantomToggle(): void {
    this.micInput().SetPhantomPower(this.localCh(), !this.phantom());
  }

  // on()=true means currently active — toggle sets mute = on()
  protected onToggle(): void {
    this.micInput().SetInputMute(this.localCh(), this.on());
  }
}
