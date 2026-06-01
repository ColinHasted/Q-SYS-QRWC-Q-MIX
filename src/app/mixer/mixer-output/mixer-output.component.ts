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

  channel = input<number | null>(null);

  protected disabled = computed(() => this.channel() == null);

  private delay = computed(() => {
    const ch = this.channel();
    return ch == null ? null : this.channelProcessing.getDelay(ch);
  });

  delayOn  = computed(() => { const d = this.delay(); return d ? !d.tap1Bypass() : false; });
  delayPos = computed(() => this.delay()?.delayPosition() ?? 0);
  delayStr = computed(() => this.delay()?.delayString() ?? '');

  protected onDelayToggle(): void {
    const d = this.delay();
    if (d) d.SetTap1Bypass(!d.tap1Bypass());
  }

  protected onDelayChange(position: number): void {
    this.delay()?.SetDelayPosition(position);
  }
}
