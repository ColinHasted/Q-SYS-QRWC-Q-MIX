import { Component, input, output } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-input',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-input.component.html',
  styleUrls: ['./mixer-input.component.scss']
})
export class MixerInputComponent {
  gain = input.required<number>();
  invert = input.required<boolean>();
  phantom = input.required<boolean>();
  on = input.required<boolean>();
  vuLevel = input<number>(0);
  clip = input<boolean>(false);
  selectedChannel = input<number>(1);

  gainChange = output<number>();
  invertToggle = output<void>();
  phantomToggle = output<void>();
  toggle = output<void>();

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

  protected onToggle(): void {
    this.toggle.emit();
  }
}
