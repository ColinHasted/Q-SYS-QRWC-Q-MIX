import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '../mixer.interfaces';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-channel',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-channel.component.html',
  styleUrls: ['./mixer-channel.component.scss']
})
export class MixerChannelComponent {
  channel = input.required<Channel>();

  faderChange = output<number>();
  panChange = output<number>();
  onToggle = output<void>();
  soloToggle = output<void>();
  cueToggle = output<void>();
  select = output<void>();
  selectedChannel = input<number>(1);

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
