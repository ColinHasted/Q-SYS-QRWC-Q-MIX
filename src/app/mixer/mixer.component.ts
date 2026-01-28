import { Component, signal, computed, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel, ChannelStrip, MasterChannel, EQBand } from './mixer.interfaces';
import { MixerInputComponent } from './mixer-input/mixer-input.component';
import { MixerGateComponent } from './mixer-gate/mixer-gate.component';
import { MixerCompressorComponent } from './mixer-compressor/mixer-compressor.component';
import { MixerEqualizerComponent } from './mixer-equalizer/mixer-equalizer.component';
import { MixerOutputComponent } from './mixer-output/mixer-output.component';
import { MixerAuxSendsComponent } from './mixer-aux-sends/mixer-aux-sends.component';
import { MixerChannelComponent } from './mixer-channel/mixer-channel.component';

@Component({
  selector: 'app-mixer',
  standalone: true,
  imports: [
    FormsModule,
    MixerInputComponent,
    MixerGateComponent,
    MixerCompressorComponent,
    MixerEqualizerComponent,
    MixerOutputComponent,
    MixerAuxSendsComponent,
    MixerChannelComponent
  ],
  templateUrl: './mixer.component.html',
  styleUrls: ['./mixer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MixerComponent {
  // Channel faders
  channels = signal<Channel[]>(
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      name: `CH ${i + 1}`,
      faderValue: 75,
      pan: 0,
      on: true,
      solo: false,
      cue: false,
      select: i === 0,
      vuLevel: Math.random() * 70 + 10,
      clip: false
    }))
  );

  // Master fader
  master = signal<MasterChannel>({
    faderValue: 80,
    pan: 0,
    mute: false,
    select: false,
    vuLevelL: 65,
    vuLevelR: 60,
    clipL: false,
    clipR: false
  });

  // Selected channel
  selectedChannel = computed(() => {
    const ch = this.channels().find(c => c.select);
    return ch?.id ?? 1;
  });

  // Channel strip for selected channel
  channelStrip = signal<ChannelStrip>({
    gain: 0,
    invert: false,
    phantom: false,
    hpfOn: false,
    hpfFrequency: 80,
    pan: 0,
    gateOn: false,
    gateThreshold: -40,
    gateAttack: 1.5,
    gateHold: 10,
    gateRelease: 100,
    gateRange: -60,
    compOn: false,
    compThreshold: -20,
    compRatio: 4,
    compAttack: 10,
    compRelease: 100,
    compMakeup: 0,
    limiterOn: false,
    limiterThreshold: -6,
    eqOn: false,
    eqBands: [
      { frequency: 80, gain: 0, q: 1.0, type: 'lowshelf' },
      { frequency: 500, gain: 0, q: 1.0, type: 'peaking' },
      { frequency: 2000, gain: 0, q: 1.0, type: 'peaking' },
      { frequency: 8000, gain: 0, q: 1.0, type: 'highshelf' }
    ],
    delayOn: false,
    delayMs: 0,
    auxSends: Array(4).fill(-60)
  });

  // Channel methods
  updateFader(channelId: number, value: number): void {
    this.channels.update(chs =>
      chs.map(ch => ch.id === channelId ? { ...ch, faderValue: value } : ch)
    );
  }

  toggleChannelProp(channelId: number, prop: 'on' | 'solo' | 'cue'): void {
    this.channels.update(chs =>
      chs.map(ch => ch.id === channelId ? { ...ch, [prop]: !ch[prop] } : ch)
    );
  }

  selectChannel(channelId: number): void {
    this.channels.update(chs =>
      chs.map(ch => ({ ...ch, select: ch.id === channelId }))
    );
  }

  // Master methods
  updateMasterFader(value: number): void {
    this.master.update(m => ({ ...m, faderValue: value }));
  }

  updateMasterPan(value: number): void {
    this.master.update(m => ({ ...m, pan: value }));
  }

  toggleMasterMute(): void {
    this.master.update(m => ({ ...m, mute: !m.mute }));
  }

  toggleMasterSelect(): void {
    this.master.update(m => ({ ...m, select: !m.select }));
  }

  updateChannelPan(channelId: number, value: number): void {
    this.channels.update(chs =>
      chs.map(ch => ch.id === channelId ? { ...ch, pan: value } : ch)
    );
  }

  getVUSegments(level: number): boolean[] {
    return Array.from({ length: 12 }, (_, i) => level >= (i + 1) * 8.33);
  }

  getSelectedChannelVU(): number {
    const ch = this.channels().find(c => c.select);
    return ch?.vuLevel ?? 0;
  }

  getSelectedChannelClip(): boolean {
    const ch = this.channels().find(c => c.select);
    return ch?.clip ?? false;
  }

  // Channel strip methods
  updateStripValue<K extends keyof ChannelStrip>(
    key: K,
    value: ChannelStrip[K]
  ): void {
    this.channelStrip.update(strip => ({ ...strip, [key]: value }));
  }

  toggleStripProp(prop: keyof ChannelStrip): void {
    this.channelStrip.update(strip => ({ ...strip, [prop]: !strip[prop] }));
  }

  updateEQBand(index: number, property: keyof EQBand, value: number): void {
    this.channelStrip.update(strip => ({
      ...strip,
      eqBands: strip.eqBands.map((band, i) =>
        i === index ? { ...band, [property]: value } : band
      )
    }));
  }

  updateAuxSend(index: number, value: number): void {
    this.channelStrip.update(strip => ({
      ...strip,
      auxSends: strip.auxSends.map((send, i) => i === index ? value : send)
    }));
  }
}
