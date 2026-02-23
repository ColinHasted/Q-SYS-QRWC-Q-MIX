import { Component, computed, inject, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-hpf',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-hpf.component.html',
  styleUrls: ['./mixer-hpf.component.scss']
})
export class MixerHpfComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);

  channel = input.required<number>();

  // HPF 'bypass' = !on: bypass=true means the filter is disabled
  on = computed(() => !this.channelProcessing.getHighPassFilter(this.channel()).bypass());
  frequency = computed(() => this.channelProcessing.getHighPassFilter(this.channel()).frequency());

  protected onToggle(): void {
    const hpf = this.channelProcessing.getHighPassFilter(this.channel());
    hpf.SetBypass(!hpf.bypass());
  }

  protected onFrequencyChange(value: number): void {
    this.channelProcessing.getHighPassFilter(this.channel()).SetFrequency(value);
  }
}
