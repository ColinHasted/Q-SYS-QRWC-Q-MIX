import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-output',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`:host { display: contents; }`],
  template: `
    <div class="strip-panel out-panel">
      <div class="panel-header">OUT</div>
      <div class="panel-content">
        <div class="knob-row">
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="delayMs()"
                [min]="0"
                [max]="500"
                [step]="1"
                (valueChange)="onDelayChange($event)"
              />
            </div>
            <label>DELAY</label>
          </div>
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="limiterThreshold()"
                [min]="-20"
                [max]="0"
                [step]="0.5"
                (valueChange)="onLimiterThresholdChange($event)"
              />
            </div>
            <label>LIMIT</label>
          </div>
        </div>
        <div class="button-row">
          <button class="panel-btn" [class.active]="delayOn()"
                  (click)="onDelayToggle()">DLY</button>
          <button class="panel-btn" [class.active]="limiterOn()"
                  (click)="onLimiterToggle()">LIM</button>
        </div>
        <div class="value-display">{{ delayMs() }}ms</div>
      </div>
    </div>
  `
})
export class MixerOutputComponent {
  delayOn = input.required<boolean>();
  delayMs = input.required<number>();
  limiterOn = input.required<boolean>();
  limiterThreshold = input.required<number>();

  delayToggle = output<void>();
  delayChange = output<number>();
  limiterToggle = output<void>();
  limiterThresholdChange = output<number>();

  protected onDelayToggle(): void {
    this.delayToggle.emit();
  }

  protected onDelayChange(value: number): void {
    this.delayChange.emit(value);
  }

  protected onLimiterToggle(): void {
    this.limiterToggle.emit();
  }

  protected onLimiterThresholdChange(value: number): void {
    this.limiterThresholdChange.emit(value);
  }
}
