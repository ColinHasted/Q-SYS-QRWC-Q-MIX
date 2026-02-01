import { Component, input, output } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-hpf',
  standalone: true,
  imports: [RotaryKnobComponent],
  templateUrl: './mixer-hpf.component.html',
  styleUrls: ['./mixer-hpf.component.scss']
})
export class MixerHpfComponent {
  on = input.required<boolean>();
  frequency = input.required<number>();

  toggle = output<void>();
  frequencyChange = output<number>();

  protected onToggle(): void {
    this.toggle.emit();
  }

  protected onFrequencyChange(value: number): void {
    this.frequencyChange.emit(value);
  }
}
