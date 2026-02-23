import { Component, computed, input, output } from '@angular/core';
import { PanKnobComponent } from '../shared/pan-knob/pan-knob.component';
import { FaderComponent } from '../shared/fader/fader.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';

@Component({
  selector: 'app-mixer-channel',
  standalone: true,
  imports: [PanKnobComponent, FaderComponent],
  templateUrl: './mixer-channel.component.html',
  styleUrls: ['./mixer-channel.component.scss']
})
export class MixerChannelComponent {
  channelId = input.required<number>();
  mixer = input.required<QrwcMixerComponent>();
  selectedChannel = input.required<number>();

  select = output<void>();

  // QRWC signals — reactive to channelId changes
  label = computed(() => this.mixer().getInputLabel(this.channelId())());
  gain = computed(() => this.mixer().getInputGain(this.channelId())());
  // Q-SYS pan: -1.0 (full left) to 1.0 (full right)
  pan = computed(() => this.mixer().getInputPan(this.channelId())());
  // 'on' = not muted
  on = computed(() => !this.mixer().getInputMute(this.channelId())());
  solo = computed(() => this.mixer().getInputSolo(this.channelId())());
  // Cue enable for cue bus 1
  cueEnable = computed(() => this.mixer().getInputCueEnable(this.channelId(), 1)());

  // VU / clip: TODO — wire to QrwcMeterComponent when available
  vuLevel = computed(() => 0);
  clip = computed(() => false);

  protected isSelected(): boolean {
    return this.channelId() === this.selectedChannel();
  }

  protected getVUSegments(): boolean[] {
    return Array.from({ length: 12 }, (_, i) => this.vuLevel() >= (i + 1) * 8.33);
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
    this.mixer().SetInputCueEnable(this.channelId(), 1, !this.cueEnable());
  }

  protected onSelect(): void {
    this.select.emit();
  }
}
