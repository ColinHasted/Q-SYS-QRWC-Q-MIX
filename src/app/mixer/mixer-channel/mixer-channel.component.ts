import { Component, computed, inject, input, output } from '@angular/core';
import { PanKnobComponent } from '../shared/pan-knob/pan-knob.component';
import { FaderComponent } from '../shared/fader/fader.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';
import { MIXER_PROFILE } from '../mixer-profile';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-channel',
  standalone: true,
  imports: [PanKnobComponent, FaderComponent],
  templateUrl: './mixer-channel.component.html',
  styleUrls: ['./mixer-channel.component.scss']
})
export class MixerChannelComponent {
  private readonly profile = inject(MIXER_PROFILE);
  private readonly channelProcessing = inject(ChannelProcessingService);
  private readonly cueBus = this.profile.cueBus;

  channelId = input.required<number>();
  mixer = input.required<QrwcMixerComponent>();
  /** Currently selected channel (null when nothing is selected). */
  selectedChannel = input.required<number | null>();

  select = output<void>();

  // QRWC signals — reactive to channelId changes
  label = computed(() => this.mixer().getInputLabel(this.channelId())());
  gain = computed(() => this.mixer().getInputGain(this.channelId())());
  // Q-SYS pan: -1.0 (full left) to 1.0 (full right)
  pan = computed(() => this.mixer().getInputPan(this.channelId())());
  // 'on' = not muted
  on = computed(() => !this.mixer().getInputMute(this.channelId())());
  solo = computed(() => this.mixer().getInputSolo(this.channelId())());
  // Cue enable for the configured cue bus
  cueEnable = computed(() => this.mixer().getInputCueEnable(this.channelId(), this.cueBus)());

  // VU / clip — sourced from the same Mic/Line Input block as the IN panel
  private micCh = computed(() => this.channelProcessing.getMicInput(this.channelId()));
  vuLevel = computed(() => this.micCh().block.getDigitalInputLevel(this.micCh().localCh)());
  clip    = computed(() => this.micCh().block.getClip(this.micCh().localCh)());

  protected isSelected(): boolean {
    return this.channelId() === this.selectedChannel();
  }

  protected getVUSegments(): boolean[] {
    // Range: -60 to +10 dBFS across 12 segments (~5.8 dB each).
    // Seg 8-9 = yellow (~-13 to -7 dBFS), seg 10-11 = red (~+4 to +10 dBFS).
    const level = this.vuLevel();
    return Array.from({ length: 12 }, (_, i) => level >= -60 + (i + 1) * (70 / 12));
  }

  protected formatPan(value: number): string {
    if (Math.abs(value) < 0.01) return 'C';
    const pct = Math.round(Math.abs(value) * 100);
    return value < 0 ? `L${pct}` : `R${pct}`;
  }

  protected onFaderChange(value: number): void {
    this.mixer().SetInputGain(this.channelId(), value);
  }

  protected onPanChange(value: number): void {
    this.mixer().SetInputPan(this.channelId(), value);
  }

  // on()=true means currently active — toggle sets mute = on()
  protected onOnToggle(): void {
    this.mixer().SetInputMute(this.channelId(), this.on());
  }

  protected onSoloToggle(): void {
    this.mixer().SetInputSolo(this.channelId(), !this.solo());
  }

  protected onCueToggle(): void {
    this.mixer().SetInputCueEnable(this.channelId(), this.cueBus, !this.cueEnable());
  }

  protected onSelect(): void {
    this.select.emit();
  }
}
