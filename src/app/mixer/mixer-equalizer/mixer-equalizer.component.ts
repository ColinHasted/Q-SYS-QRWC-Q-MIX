import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { MixerEqualizerResponseComponent } from './mixer-equalizer-response/mixer-equalizer-response.component';
import { ChannelProcessingService } from '../services/channel-processing.service';
import {
  FilterType,
  QrwcParametricEqualizerComponent,
} from '../../../qrwc/components/qrwc-parametric-equalizer-component';
import { MIXER_PROFILE } from '../mixer-profile';

@Component({
  selector: 'app-mixer-equalizer',
  standalone: true,
  imports: [GaugeKnobComponent, MixerEqualizerResponseComponent],
  templateUrl: './mixer-equalizer.component.html',
  styleUrls: ['./mixer-equalizer.component.scss']
})
export class MixerEqualizerComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);
  private readonly profile = inject(MIXER_PROFILE);

  // Input: which channel this EQ UI is controlling (null = no selection).
  channel = input<number | null>(null);

  protected disabled = computed(() => this.channel() == null);

  // Computed: get the QRWC EQ component for the current channel (or null).
  qrwcEQ = computed<QrwcParametricEqualizerComponent | null>(() => {
    const ch = this.channel();
    return ch == null ? null : this.channelProcessing.getEQ(ch);
  });

  // Expose QRWC signals for template binding (safe defaults when no channel).
  bypass = computed(() => this.qrwcEQ()?.bypass() ?? true);
  eqBands = computed(() => this.qrwcEQ()?.EQBands ?? []);

  // Static band slot indices (1..N) for rendering band selector buttons even
  // when no channel is selected — buttons stay visible, just disabled.
  readonly bandSlots = Array.from(
    { length: this.profile.eqBandCount },
    (_, i) => i,
  );

  // Frequency ranges from the active mixer profile.
  readonly bandRanges = this.profile.eqBandRanges;

  // Filter type options shown in the per-band toggle row.
  protected readonly FilterType = FilterType;
  readonly filterTypes = [
    { type: FilterType.LowShelf,   icon: 'icons/filters/low-shelf.svg',  label: 'Low Shelf'  },
    { type: FilterType.Parametric, icon: 'icons/filters/bell.svg',       label: 'Parametric' },
    { type: FilterType.HighShelf,  icon: 'icons/filters/high-shelf.svg', label: 'High Shelf' },
  ];

  selectedBand = linkedSignal<number | null, number>({
    source: () => this.channel(),
    computation: () => 0,
  });

  protected onToggle(): void {
    this.qrwcEQ()?.ToggleBypass();
  }

  protected selectBand(index: number): void {
    this.selectedBand.set(index);
  }

  protected onFrequencyChange(index: number, position: number): void {
    this.qrwcEQ()?.setFrequencyPosition(index, position);
  }

  protected onGainChange(index: number, value: number): void {
    this.qrwcEQ()?.setGain(index, value);
  }

  protected onQChange(index: number, position: number): void {
    this.qrwcEQ()?.setQPosition(index, position);
  }

  protected onFilterTypeChange(type: FilterType): void {
    this.qrwcEQ()?.setFilterType(this.selectedBand(), type);
  }

  protected onBandBypassToggle(): void {
    this.qrwcEQ()?.toggleBypass(this.selectedBand());
  }

  protected get currentBand(): import('../../../qrwc/components/qrwc-parametric-equalizer-component').EQBand | undefined {
    return this.eqBands()[this.selectedBand()];
  }

  protected get currentBandRange() {
    return this.bandRanges[this.selectedBand()];
  }

  protected currentFilterType = computed<FilterType>(() => {
    return this.currentBand?.Type() ?? FilterType.Parametric;
  });
}
