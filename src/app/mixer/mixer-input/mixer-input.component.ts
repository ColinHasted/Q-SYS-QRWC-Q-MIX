import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-input',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`
    :host { display: contents; }
    .input-main {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .input-vu {
      display: flex;
      flex-direction: column-reverse;
      gap: 2px;
      padding: 4px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 4px;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8);
    }
    .input-vu-segment {
      width: 12px;
      height: 5px;
      background: rgba(30, 50, 30, 0.8);
      border-radius: 1px;
      transition: background 0.05s;
    }
    .input-vu-segment.active {
      background: radial-gradient(circle, #66ff99 0%, #00ff66 50%, #009933 100%);
      box-shadow: 0 0 8px #00ff66, 0 0 16px rgba(0, 255, 102, 0.6), inset 0 0 4px rgba(255, 255, 255, 0.3);
    }
    .input-vu-segment.yellow.active {
      background: radial-gradient(circle, #ffee66 0%, #ffcc00 50%, #cc9900 100%);
      box-shadow: 0 0 8px #ffcc00, 0 0 16px rgba(255, 204, 0, 0.6), inset 0 0 4px rgba(255, 255, 255, 0.3);
    }
    .input-vu-segment.red.active {
      background: radial-gradient(circle, #ff6666 0%, #ff3333 50%, #cc0000 100%);
      box-shadow: 0 0 8px #ff3333, 0 0 16px rgba(255, 51, 51, 0.6), inset 0 0 4px rgba(255, 255, 255, 0.3);
    }
    .clip-led {
      font-size: 7px;
      font-weight: bold;
      color: #533;
      text-align: center;
      padding: 2px;
      margin-top: 2px;
      background: rgba(50, 20, 20, 0.8);
      border-radius: 2px;
      transition: all 0.1s;
    }
    .clip-led.active {
      color: #ff3333;
      text-shadow: 0 0 8px #ff3333, 0 0 16px rgba(255, 51, 51, 0.5);
      background: rgba(80, 20, 20, 0.9);
    }
    .input-knob-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .channel-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid rgba(0, 255, 255, 0.3);
      margin-top: auto;
    }
    .channel-display .display-label {
      font-size: 8px;
      color: #88ccff;
    }
    .channel-display .display-value {
      font-size: 18px;
      font-weight: bold;
      color: #00ffff;
      text-shadow: 0 0 8px #00ffff, 0 0 16px rgba(0, 255, 255, 0.5);
      font-family: 'Consolas', monospace;
    }
    .hpf-section {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    .hpf-section label {
      font-size: 8px;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
    }
    .hpf-freq {
      font-size: 9px;
      color: #00ffff;
      font-family: 'Consolas', monospace;
    }
  `],
  template: `
    <div class="strip-panel in-panel">
      <div class="panel-header">IN</div>
      <div class="panel-content">
        <div class="input-main">
          <div class="input-vu">
            @for (seg of getVUSegments(); track $index) {
              <div class="input-vu-segment"
                   [class.active]="seg"
                   [class.yellow]="$index >= 8 && $index < 10"
                   [class.red]="$index >= 10"></div>
            }
            <div class="clip-led" [class.active]="clip()">CLIP</div>
          </div>
          <div class="input-knob-section">
            <div class="knob-group">
              <div class="knob-wrapper">
                <app-rotary-knob
                  [value]="gain()"
                  [min]="-20"
                  [max]="60"
                  [step]="1"
                  (valueChange)="onGainChange($event)"
                />
              </div>
              <label>GAIN</label>
            </div>
            <div class="value-display">{{ gain() }}dB</div>
          </div>
        </div>

        <div class="button-row">
          <button class="panel-btn" [class.active]="invert()"
                  (click)="onInvertToggle()">Ø</button>
          <button class="panel-btn phantom" [class.active]="phantom()"
                  (click)="onPhantomToggle()">48V</button>
        </div>

                <div class="hpf-section">
          <button class="panel-btn" [class.active]="hpfOn()"
                  (click)="onHpfToggle()">HPF</button>
          <div class="knob-wrapper small">
            <app-rotary-knob
              [value]="hpfFrequency()"
              [min]="20"
              [max]="400"
              [step]="5"
              size="small"
              (valueChange)="onHpfFrequencyChange($event)"
            />
          </div>
          <span class="hpf-freq">{{ hpfFrequency() }}Hz</span>
        </div>
        <div class="channel-display">
          <span class="display-label">CH</span>
          <span class="display-value">{{ selectedChannel() }}</span>
        </div>
      </div>
    </div>
  `
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
