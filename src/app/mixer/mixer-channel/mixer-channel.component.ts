import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '../mixer.interfaces';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-channel',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`:host { display: contents; }`],
  template: `
    <div class="channel" [class.selected]="channel().select">
      <div class="channel-label">{{ channel().name }}</div>

      <!-- Pan Knob -->
      <div class="pan-section">
        <app-rotary-knob
          [value]="channel().pan"
          [min]="-100"
          [max]="100"
          [step]="1"
          size="small"
          (valueChange)="onPanChange($event)"
        />
        <span class="pan-label">{{ formatPan(channel().pan) }}</span>
      </div>

      <!-- ON Button -->
      <button class="ch-btn on" [class.active]="channel().on"
              (click)="onOnToggle()">ON</button>

      <!-- VU Meter (horizontal) -->
      <div class="vu-meter horizontal">
        @for (seg of getVUSegments(); track $index) {
          <div class="vu-segment"
               [class.active]="seg"
               [class.yellow]="$index >= 8 && $index < 10"
               [class.red]="$index >= 10"></div>
        }
        <div class="clip-led" [class.active]="channel().clip">C</div>
      </div>

      <!-- Solo & Cue on one line -->
      <div class="channel-buttons-row">
        <button class="ch-btn solo small-text" [class.active]="channel().solo"
                (click)="onSoloToggle()">SOLO</button>
        <button class="ch-btn cue small-text" [class.active]="channel().cue"
                (click)="onCueToggle()">CUE</button>
      </div>

      <!-- Select Button -->
      <button class="ch-btn select" [class.active]="channel().select"
              (click)="onSelect()">SEL</button>

      <!-- Fader -->
      <div class="fader-track">
        <input type="range" class="fader" min="0" max="100"
               [value]="channel().faderValue"
               (input)="onFaderChange(+$any($event.target).value)"
               orient="vertical">
        <div class="fader-scale">
          <span>+10</span>
          <span>0</span>
          <span>-10</span>
          <span>-20</span>
          <span>-∞</span>
        </div>
      </div>
    </div>
  `
})
export class MixerChannelComponent {
  channel = input.required<Channel>();

  faderChange = output<number>();
  panChange = output<number>();
  onToggle = output<void>();
  soloToggle = output<void>();
  cueToggle = output<void>();
  select = output<void>();

  protected getVUSegments(): boolean[] {
    const level = this.channel().vuLevel;
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  protected formatPan(value: number): string {
    if (value === 0) return 'C';
    if (value < 0) return `L${Math.abs(value)}`;
    return `R${value}`;
  }

  protected onFaderChange(value: number): void {
    this.faderChange.emit(value);
  }

  protected onPanChange(value: number): void {
    this.panChange.emit(value);
  }

  protected onOnToggle(): void {
    this.onToggle.emit();
  }

  protected onSoloToggle(): void {
    this.soloToggle.emit();
  }

  protected onCueToggle(): void {
    this.cueToggle.emit();
  }

  protected onSelect(): void {
    this.select.emit();
  }
}
