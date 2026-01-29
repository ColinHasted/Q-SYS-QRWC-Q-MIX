import { Component, input, output } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-compressor',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-compressor.component.html',
  styleUrls: ['./mixer-compressor.component.scss']
})
export class MixerCompressorComponent {
  on = input.required<boolean>();
  threshold = input.required<number>();
  ratio = input.required<number>();
  attack = input.required<number>();
  release = input.required<number>();
  makeup = input.required<number>();

  toggle = output<void>();
  thresholdChange = output<number>();
  ratioChange = output<number>();
  attackChange = output<number>();
  releaseChange = output<number>();
  makeupChange = output<number>();

  protected onToggle(): void {
    this.toggle.emit();
  }

  protected onThresholdChange(value: number): void {
    this.thresholdChange.emit(value);
  }

  protected onRatioChange(value: number): void {
    this.ratioChange.emit(value);
  }

  protected onAttackChange(value: number): void {
    this.attackChange.emit(value);
  }

  protected onReleaseChange(value: number): void {
    this.releaseChange.emit(value);
  }

  protected onMakeupChange(value: number): void {
    this.makeupChange.emit(value);
  }
}
