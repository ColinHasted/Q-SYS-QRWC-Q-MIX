import { Component, input, output, signal, computed, inject } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { MixerEqualizerResponseComponent } from './mixer-equalizer-response/mixer-equalizer-response.component';
import { ChannelProcessingService } from '../services/channel-processing.service';
import { QrwcParametricEqualizerComponent } from '../../../qrwc/components/qrwc-parametric-equalizer-component';

@Component({
  selector: 'app-mixer-equalizer',
  standalone: true,
  imports: [GaugeKnobComponent, MixerEqualizerResponseComponent],
  templateUrl: './mixer-equalizer.component.html',
  styleUrls: ['./mixer-equalizer.component.scss']
})
export class MixerEqualizerComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);

  // Input: which channel (1-16) this EQ UI is controlling
  channel = input.required<number>();

  // Computed: get the QRWC EQ component for the current channel
  qrwcEQ = computed<QrwcParametricEqualizerComponent>(() => {
    return this.channelProcessing.getEQ(this.channel());
  });

  // Expose QRWC signals for template binding
  bypass = computed(() => this.qrwcEQ().bypass());
  eqBands = computed(() => this.qrwcEQ().EQBands);

  // Selected band index (0-6 for 7-band parametric EQ)
  selectedBand = signal(0);

  // Frequency ranges for each band (7 bands typical for parametric EQ)
  readonly bandRanges = [
    { min: 20, max: 500, step: 5 },      // Band 1 - Low
    { min: 100, max: 2000, step: 10 },   // Band 2 - Low Mid
    { min: 500, max: 8000, step: 50 },   // Band 3 - Mid
    { min: 100, max: 2000, step: 10 },   // Band 4 - Low Mid 2
    { min: 1000, max: 10000, step: 50 }, // Band 5 - High Mid
    { min: 2000, max: 20000, step: 100 },// Band 6 - High
    { min: 2000, max: 20000, step: 100 } // Band 7 - High
  ];

  protected onToggle(): void {
    this.qrwcEQ().ToggleBypass();
  }

  protected selectBand(index: number): void {
    this.selectedBand.set(index);
  }

  protected onFrequencyChange(index: number, value: number): void {
    this.qrwcEQ().setFrequency(index, value);
  }

  protected onGainChange(index: number, value: number): void {
    this.qrwcEQ().setGain(index, value);
  }

  protected onQChange(index: number, value: number): void {
    this.qrwcEQ().setQ(index, value);
  }

  protected get currentBand() {
    return this.eqBands()[this.selectedBand()];
  }

  protected get currentBandRange() {
    return this.bandRanges[this.selectedBand()];
  }
}
