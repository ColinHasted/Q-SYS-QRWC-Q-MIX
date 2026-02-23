import { Component, computed, inject, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-output',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-output.component.html',
  styleUrls: ['./mixer-output.component.scss']
})
export class MixerOutputComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);

  channel = input.required<number>();

  // delayOn = tap 1 is NOT bypassed
  delayOn = computed(() => !this.channelProcessing.getDelay(this.channel()).tap1Bypass());
  delayMs = computed(() => this.channelProcessing.getDelay(this.channel()).delay());

  protected onDelayToggle(): void {
    const delay = this.channelProcessing.getDelay(this.channel());
    delay.SetTap1Bypass(!delay.tap1Bypass());
  }

  protected onDelayChange(value: number): void {
    this.channelProcessing.getDelay(this.channel()).SetDelay(value);
  }
}
