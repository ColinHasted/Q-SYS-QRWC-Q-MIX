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

  label = computed(() => this.mixer().getInputLabel(this.channelId())());
  gain = computed(() => this.mixer().getInputGain(this.channelId())());
  pan = computed(() => this.mixer().getInputPan(this.channelId())());
  on = computed(() => !this.mixer().getInputMute(this.channelId())());
  solo = computed(() => this.mixer().getInputSolo(this.channelId())());
  cueEnable = computed(() => this.mixer().getInputCueEnable(this.channelId(), this.cueBus)());

  private micCh = computed(() => this.channelProcessing.getMicInput(this.channelId()));
  vuLevel = computed(() => this.micCh().block.getDigitalInputLevel(this.micCh().localCh)());
  clip    = computed(() => this.micCh().block.getClip(this.micCh().localCh)());

  protected isSelected(): boolean {
    return this.channelId() === this.selectedChannel();
  }

  protected getVUSegments(): boolean[] {
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
