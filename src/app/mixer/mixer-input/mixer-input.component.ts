import { Component, input, output } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-input',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-input.component.html',
  styleUrls: ['./mixer-input.component.scss']
})
export class MixerInputComponent {
  gain = input.required<number>();
  invert = input.required<boolean>();
  phantom = input.required<boolean>();
  hpfOn = input.required<boolean>();
  hpfFrequency = input.required<number>();
  vuLevel = input<number>(0);
  clip = input<boolean>(false);
  selectedChannel = input<number>(1);

  gainChange = output<number>();
  invertToggle = output<void>();
  phantomToggle = output<void>();
  hpfToggle = output<void>();
  hpfFrequencyChange = output<number>();

  protected getVUSegments(): boolean[] {
    const level = this.vuLevel();
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  protected onGainChange(value: number): void {
    this.gainChange.emit(value);
  }

  protected onInvertToggle(): void {
    this.invertToggle.emit();
  }

  protected onPhantomToggle(): void {
    this.phantomToggle.emit();
  }

  protected onHpfToggle(): void {
    this.hpfToggle.emit();
  }

  protected onHpfFrequencyChange(value: number): void {
    this.hpfFrequencyChange.emit(value);
  }
}
