import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-gate',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`:host { display: contents; }`],
  template: `
    <div class="strip-panel gate-panel">
      <div class="panel-header">GATE</div>
      <div class="panel-content">
        <div class="knob-row">
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="attack()"
                [min]="0.1"
                [max]="10"
                [step]="0.1"
                (valueChange)="onAttackChange($event)"
              />
            </div>
            <label>ATTACK</label>
          </div>
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="release()"
                [min]="10"
                [max]="1000"
                [step]="1"
                (valueChange)="onReleaseChange($event)"
              />
            </div>
            <label>RELEASE</label>
          </div>
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="range()"
                [min]="-80"
                [max]="0"
                [step]="1"
                (valueChange)="onRangeChange($event)"
              />
            </div>
            <label>DEPTH</label>
          </div>
        </div>
        <div class="knob-row">
          <div class="knob-group threshold-knob">
            <div class="knob-wrapper large">
              <app-rotary-knob
                [value]="threshold()"
                [min]="-80"
                [max]="0"
                [step]="1"
                size="large"
                (valueChange)="onThresholdChange($event)"
              />
            </div>
            <label>THRESHOLD</label>
          </div>
        </div>
        <button class="panel-toggle" [class.active]="on()"
                (click)="onToggle()">GATE</button>
      </div>
    </div>
  `
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
