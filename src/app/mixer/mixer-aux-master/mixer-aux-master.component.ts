import { Component, input, output } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

export interface AuxMaster {
  gain: number;
  mute: boolean;
  vuLevel: number;
  clip: boolean;
}

@Component({
  selector: 'app-mixer-aux-master',
  standalone: true,
  imports: [RotaryKnobComponent],
  templateUrl: './mixer-aux-master.component.html',
  styleUrls: ['./mixer-aux-master.component.scss']
})
export class MixerAuxMasterComponent {
  // Inputs - array of 4 aux masters
  auxMasters = input<AuxMaster[]>([
    { gain: 0, mute: false, vuLevel: 0, clip: false },
    { gain: 0, mute: false, vuLevel: 0, clip: false },
    { gain: 0, mute: false, vuLevel: 0, clip: false },
    { gain: 0, mute: false, vuLevel: 0, clip: false }
  ]);

  // Outputs
  gainChange = output<{ index: number; value: number }>();
  muteToggle = output<number>();

  // Methods
  onGainChange(index: number, value: number): void {
    this.gainChange.emit({ index, value });
  }

  onMuteToggle(index: number): void {
    this.muteToggle.emit(index);
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  formatGain(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
