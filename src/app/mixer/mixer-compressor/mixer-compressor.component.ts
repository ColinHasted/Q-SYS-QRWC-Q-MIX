import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-compressor',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`:host { display: contents; }`],
  template: `
    <div class="strip-panel comp-panel">
      <div class="panel-header">COMP</div>
      <div class="panel-content">
        <div class="knob-row">
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="attack()"
                [min]="0.1"
                [max]="100"
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
        </div>
        <div class="knob-row">
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="ratio()"
                [min]="1"
                [max]="20"
                [step]="0.5"
                (valueChange)="onRatioChange($event)"
              />
            </div>
            <label>RATIO</label>
          </div>
          <div class="knob-group">
            <div class="knob-wrapper">
              <app-rotary-knob
                [value]="makeup()"
                [min]="0"
                [max]="24"
                [step]="0.5"
                (valueChange)="onMakeupChange($event)"
              />
            </div>
            <label>GAIN</label>
          </div>
        </div>
        <div class="knob-row">
          <div class="knob-group threshold-knob">
            <div class="knob-wrapper large">
              <app-rotary-knob
                [value]="threshold()"
                [min]="-60"
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
                (click)="onToggle()">COMP</button>
      </div>
    </div>
  `
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
