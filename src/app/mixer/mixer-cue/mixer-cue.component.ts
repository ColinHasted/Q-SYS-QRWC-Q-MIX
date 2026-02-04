import { Component, input, output, computed } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-cue',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-cue.component.html',
  styleUrls: ['./mixer-cue.component.scss']
})
export class MixerCueComponent {
  // Inputs
  on = input<boolean>(false);
  gain = input<number>(0);
  vuLevelL = input<number>(0);
  vuLevelR = input<number>(0);
  clipL = input<boolean>(false);
  clipR = input<boolean>(false);

  // Outputs
  toggle = output<void>();
  gainChange = output<number>();

  // Methods
  onToggle(): void {
    this.toggle.emit();
  }

  onGainChange(value: number): void {
    this.gainChange.emit(value);
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  formatGain(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
