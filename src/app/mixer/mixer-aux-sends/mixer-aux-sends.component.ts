import { Component, computed, inject, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { QrwcMixerComponent } from '../../../qrwc/components/qrwc-mixer-component';
import { MIXER_PROFILE } from '../mixer-profile';

@Component({
  selector: 'app-mixer-aux-sends',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-aux-sends.component.html',
  styleUrls: ['./mixer-aux-sends.component.scss']
})
export class MixerAuxSendsComponent {
  private readonly profile = inject(MIXER_PROFILE);

  // Inputs: current channel (null when nothing selected) and mixer QRWC component.
  channel = input<number | null>(null);
  mixer = input.required<QrwcMixerComponent>();

  protected disabled = computed(() => this.channel() == null);

  /** Aux send bus indices from the active mixer profile. */
  readonly auxIndices = this.profile.auxOutputs;

  /**
   * Reactive array of aux send levels (one per profile.auxOutputs entry).
   * Returns -∞-ish defaults when no channel is selected.
   */
  protected auxSends = computed(() => {
    const ch = this.channel();
    const mx = this.mixer();
    return this.auxIndices.map((output, i) => ({
      uiIndex: i,
      output,
      position: ch == null ? 0 : mx.getCrosspointGainPosition(ch, output)(),
      displayString: ch == null ? '' : mx.getCrosspointGainString(ch, output)(),
    }));
  });

  protected onAuxSendChange(uiIndex: number, position: number): void {
    const ch = this.channel();
    if (ch == null) return;
    this.mixer().SetCrosspointGainPosition(ch, this.auxIndices[uiIndex], position);
  }
}
