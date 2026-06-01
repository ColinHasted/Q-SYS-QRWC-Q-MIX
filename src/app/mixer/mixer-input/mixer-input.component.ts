import { Component, computed, inject, input } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { ChannelProcessingService } from '../services/channel-processing.service';

@Component({
  selector: 'app-mixer-input',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-input.component.html',
  styleUrls: ['./mixer-input.component.scss']
})
export class MixerInputComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);

  /** Selected channel, or null when nothing is selected. */
  channel = input<number | null>(null);

  /** True when no channel is selected — UI renders disabled. */
  protected disabled = computed(() => this.channel() == null);

  // Resolve block + local channel in one shot.
  private micCh = computed(() => {
    const ch = this.channel();
    return ch == null ? null : this.channelProcessing.getMicInput(ch);
  });

  // QRWC signals — return safe defaults when no channel is selected.
  gainPosition = computed(() => { const m = this.micCh(); return m ? m.block.getPreampGainPosition(m.localCh)() : 0; });
  gainDisplay  = computed(() => { const m = this.micCh(); return m ? m.block.getPreampGainString(m.localCh)() : ''; });
  invert  = computed(() => { const m = this.micCh(); return m ? m.block.getInputInvert(m.localCh)() : false; });
  phantom = computed(() => { const m = this.micCh(); return m ? m.block.getPhantomPower(m.localCh)() : false; });
  on      = computed(() => { const m = this.micCh(); return m ? !m.block.getInputMute(m.localCh)() : false; });
  vuLevel = computed(() => { const m = this.micCh(); return m ? m.block.getDigitalInputLevel(m.localCh)() : 0; });
  clip    = computed(() => { const m = this.micCh(); return m ? m.block.getClip(m.localCh)() : false; });

  protected getVUSegments(): boolean[] {
    // Range: -60 to +10 dBFS across 12 segments (~5.8 dB each).
    // Seg 8-9 = yellow (~-13 to -7 dBFS), seg 10-11 = red (~+4 to +10 dBFS).
    const level = this.vuLevel();
    return Array.from({ length: 12 }, (_, i) => level >= -60 + (i + 1) * (70 / 12));
  }

  protected onGainPositionChange(position: number): void {
    const m = this.micCh();
    if (m) m.block.SetPreampGainPosition(m.localCh, position);
  }

  protected onInvertToggle(): void {
    const m = this.micCh();
    if (m) m.block.SetInputInvert(m.localCh, !this.invert());
  }

  protected onPhantomToggle(): void {
    const m = this.micCh();
    if (m) m.block.SetPhantomPower(m.localCh, !this.phantom());
  }

  protected onToggle(): void {
    const m = this.micCh();
    if (m) m.block.SetInputMute(m.localCh, this.on());
  }
}
