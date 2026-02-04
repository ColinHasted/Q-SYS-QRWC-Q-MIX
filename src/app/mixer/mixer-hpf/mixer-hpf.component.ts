import { Component, input, output } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-hpf',
  standalone: true,
  imports: [GaugeKnobComponent],
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
