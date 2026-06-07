import { Component, computed, inject, input } from '@angular/core';
import { ChannelProcessingService } from '../services/channel-processing.service';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-hpf',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-hpf.component.html',
  styleUrls: ['./mixer-hpf.component.scss'],
})
export class MixerHpfComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);

  channel = input.required<number | null>();

  protected disabled = computed(() => this.channel() == null);

  private hpf = computed(() => {
    const ch = this.channel();
    return ch == null ? null : this.channelProcessing.getHighPassFilter(ch);
  });

  // HPF 'bypass' = !on: bypass=true means the filter is disabled
  on = computed(() => {
    const h = this.hpf();
    return h ? !h.bypass() : false;
  });

  // Position-based signals — drive knob from processor directly
  frequencyPosition = computed(() => this.hpf()?.frequencyPosition() ?? 0);
  frequencyString = computed(() => this.hpf()?.frequencyString() ?? '');

  protected onToggle(): void {
    this.hpf()?.ToggleBypass();
  }

  protected onFrequencyPositionChange(position: number): void {
    this.hpf()?.SetFrequencyPosition(position);
  }
}
