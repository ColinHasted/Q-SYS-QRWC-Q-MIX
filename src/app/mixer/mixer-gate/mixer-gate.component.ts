import { Component, input, output } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-gate',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-gate.component.html',
  styleUrls: ['./mixer-gate.component.scss']
})
export class MixerGateComponent {
  on = input.required<boolean>();
  threshold = input.required<number>();
  attack = input.required<number>();
  release = input.required<number>();
  range = input.required<number>();

  toggle = output<void>();
  thresholdChange = output<number>();
  attackChange = output<number>();
  releaseChange = output<number>();
  rangeChange = output<number>();

  protected onToggle(): void {
    this.toggle.emit();
  }

  protected onThresholdChange(value: number): void {
    this.thresholdChange.emit(value);
  }

  protected onAttackChange(value: number): void {
    this.attackChange.emit(value);
  }

  protected onReleaseChange(value: number): void {
    this.releaseChange.emit(value);
  }

  protected onRangeChange(value: number): void {
    this.rangeChange.emit(value);
  }
}
