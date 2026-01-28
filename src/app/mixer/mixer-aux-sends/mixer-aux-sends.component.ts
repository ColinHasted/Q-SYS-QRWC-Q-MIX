import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-aux-sends',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`
    :host { display: contents; }
    .aux-column {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    .aux-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .aux-item label {
      font-size: 8px;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
      min-width: 32px;
    }
  `],
  template: `
    <div class="strip-panel monitor-panel">
      <div class="panel-header">AUX SENDS</div>
      <div class="panel-content">
        <div class="aux-column">
          @for (send of auxSends(); track $index) {
            <div class="aux-item">
              <label>AUX {{ $index + 1 }}</label>
              <div class="knob-wrapper small">
                <app-rotary-knob
                  [value]="send"
                  [min]="-60"
                  [max]="10"
                  [step]="1"
                  size="small"
                  (valueChange)="onAuxSendChange($index, $event)"
                />
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MixerAuxSendsComponent {
  auxSends = input.required<number[]>();

  auxSendChange = output<{ index: number; value: number }>();

  protected onAuxSendChange(index: number, value: number): void {
    this.auxSendChange.emit({ index, value });
  }
}
