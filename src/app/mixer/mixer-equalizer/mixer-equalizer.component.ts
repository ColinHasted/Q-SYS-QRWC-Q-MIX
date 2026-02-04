import { Component, input, output, signal } from '@angular/core';
import { EQBand } from '../mixer.interfaces';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { MixerEqualizerResponseComponent } from './mixer-equalizer-response/mixer-equalizer-response.component';

@Component({
  selector: 'app-mixer-equalizer',
  standalone: true,
  imports: [GaugeKnobComponent, MixerEqualizerResponseComponent],
  templateUrl: './mixer-equalizer.component.html',
  styleUrls: ['./mixer-equalizer.component.scss']
})
export class MixerEqualizerComponent {

  on = input.required<boolean>();
  bands = input.required<EQBand[]>();

  toggle = output<void>();
  bandChange = output<{ index: number; property: keyof EQBand; value: number | string }>();

  // Selected band index (0-5)
  selectedBand = signal(0);

  // Frequency ranges for each band
  readonly bandRanges = [
    { min: 20, max: 500, step: 5 },      // Band 1 - Low
    { min: 100, max: 2000, step: 10 },   // Band 2 - Low Mid
    { min: 500, max: 8000, step: 50 },   // Band 3 - Mid
    { min: 100, max: 1000, step: 10 },   // Band 4 - Low Mid 2
    { min: 1000, max: 10000, step: 50 }, // Band 5 - High Mid
    { min: 2000, max: 20000, step: 100 } // Band 6 - High
  ];

  protected onToggle(): void {
    this.toggle.emit();
  }

  protected selectBand(index: number): void {
    this.selectedBand.set(index);
  }

  protected onBandChange(index: number, property: keyof EQBand, value: number | string): void {
    this.bandChange.emit({ index, property, value });
  }

  protected get currentBand(): EQBand {
    return this.bands()[this.selectedBand()];
  }

  protected get currentBandRange() {
    return this.bandRanges[this.selectedBand()];
  }
}
