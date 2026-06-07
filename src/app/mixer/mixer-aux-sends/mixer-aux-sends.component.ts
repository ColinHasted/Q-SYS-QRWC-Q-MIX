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

  channel = input.required<number | null>();
  mixer = input.required<QrwcMixerComponent>();

  protected disabled = computed(() => this.channel() == null);

  readonly auxIndices = this.profile.auxOutputs;

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
