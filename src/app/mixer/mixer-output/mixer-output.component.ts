import { Component, input, output } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-output',
  standalone: true,
  imports: [ RotaryKnobComponent],
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
