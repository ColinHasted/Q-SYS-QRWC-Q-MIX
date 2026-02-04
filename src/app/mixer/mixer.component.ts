import { Component, signal, computed, ViewEncapsulation } from '@angular/core';
import { Channel, ChannelStrip, MasterChannel, EQBand } from './mixer.interfaces';
import { MixerInputComponent } from './mixer-input/mixer-input.component';
import { MixerHpfComponent } from './mixer-hpf/mixer-hpf.component';
import { MixerGateComponent } from './mixer-gate/mixer-gate.component';
import { MixerCompressorComponent } from './mixer-compressor/mixer-compressor.component';
import { MixerEqualizerComponent } from './mixer-equalizer/mixer-equalizer.component';
import { MixerLimiterComponent } from './mixer-limiter/mixer-limiter.component';
import { MixerOutputComponent } from './mixer-output/mixer-output.component';
import { MixerAuxSendsComponent } from './mixer-aux-sends/mixer-aux-sends.component';
import { MixerChannelComponent } from './mixer-channel/mixer-channel.component';
import { MixerCueComponent } from './mixer-cue/mixer-cue.component';
import { MixerAuxMasterComponent, AuxMaster } from './mixer-aux-master/mixer-aux-master.component';

@Component({
  selector: 'app-mixer',
  standalone: true,
  imports: [
    MixerInputComponent,
    MixerHpfComponent,
    MixerGateComponent,
    MixerCompressorComponent,
    MixerEqualizerComponent,
   // MixerLimiterComponent,
    MixerOutputComponent,
    MixerAuxSendsComponent,
    MixerChannelComponent,
    MixerCueComponent,
    MixerAuxMasterComponent
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

  // Cue section
  cue = signal({
    on: false,
    gain: 0,
    vuLevelL: 45,
    vuLevelR: 40,
    clipL: false,
    clipR: false
  });

  // Aux Masters (4 aux buses)
  auxMasters = signal<AuxMaster[]>([
    { gain: 0, mute: false, vuLevel: 35, clip: false },
    { gain: 0, mute: false, vuLevel: 50, clip: false },
    { gain: 0, mute: false, vuLevel: 25, clip: false },
    { gain: 0, mute: false, vuLevel: 60, clip: false }
  ]);

  // Selected channel
  selectedChannel = computed(() => {
    const ch = this.channels().find(c => c.select);
    return ch?.id ?? 1;
  });

  // Channel strip for selected channel
  channelStrip = signal<ChannelStrip>({
    inputOn: true,
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
    compKnee: 6,
    compAttack: 10,
    compRelease: 100,
    compDepth: 50,
    compMakeup: 0,
    limiterOn: false,
    limiterThreshold: -6,
    limiterAttack: 0.5,
    limiterRelease: 50,
    limiterCeiling: -0.3,
    eqOn: false,
    eqBands: [
      { frequency: 80, gain: 0, q: 1.0, type: 'lowshelf', filterType: 'lowpass' },
      { frequency: 500, gain: 0, q: 1.0, type: 'peaking', filterType: 'bandpass' },
      { frequency: 2000, gain: 0, q: 1.0, type: 'peaking', filterType: 'bandpass' },
      { frequency: 8000, gain: 0, q: 1.0, type: 'highshelf', filterType: 'highpass' },
      { frequency: 250, gain: 0, q: 1.0, type: 'peaking', filterType: 'bandpass' },
      { frequency: 4000, gain: 0, q: 1.0, type: 'peaking', filterType: 'bandpass' }
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

  updateEQBand(index: number, property: keyof EQBand, value: number | string): void {
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

  // Cue methods
  toggleCue(): void {
    this.cue.update(c => ({ ...c, on: !c.on }));
  }

  updateCueGain(value: number): void {
    this.cue.update(c => ({ ...c, gain: value }));
  }

  // Aux Master methods
  updateAuxMasterGain(index: number, value: number): void {
    this.auxMasters.update(masters =>
      masters.map((m, i) => i === index ? { ...m, gain: value } : m)
    );
  }

  toggleAuxMasterMute(index: number): void {
    this.auxMasters.update(masters =>
      masters.map((m, i) => i === index ? { ...m, mute: !m.mute } : m)
    );
  }
}
