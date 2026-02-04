import { Component, input, output } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-output',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-output.component.html',
  styleUrls: ['./mixer-output.component.scss']
})
export class MixerOutputComponent {
  delayOn = input.required<boolean>();
  delayMs = input.required<number>();

  delayToggle = output<void>();
  delayChange = output<number>();

  protected onDelayToggle(): void {
    this.delayToggle.emit();
  }

  protected onDelayChange(value: number): void {
    this.delayChange.emit(value);
  }
}
