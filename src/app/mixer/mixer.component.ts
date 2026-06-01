import { Component, signal, untracked, ViewEncapsulation, inject, effect } from '@angular/core';
import { MixerInputComponent } from './mixer-input/mixer-input.component';
import { MixerHpfComponent } from './mixer-hpf/mixer-hpf.component';
import { MixerGateComponent } from './mixer-gate/mixer-gate.component';
import { MixerCompressorComponent } from './mixer-compressor/mixer-compressor.component';
import { MixerEqualizerComponent } from './mixer-equalizer/mixer-equalizer.component';
import { MixerOutputComponent } from './mixer-output/mixer-output.component';
import { MixerAuxSendsComponent } from './mixer-aux-sends/mixer-aux-sends.component';
import { MixerChannelComponent } from './mixer-channel/mixer-channel.component';
import { MixerCueComponent } from './mixer-cue/mixer-cue.component';
import { MixerAuxMasterComponent } from './mixer-aux-master/mixer-aux-master.component';
import { MixerMasterComponent } from './mixer-master/mixer-master.component';
import { ChannelProcessingService } from './services/channel-processing.service';
import { QrwcMixerComponent } from '../../qrwc/components/qrwc-mixer-component';
import { QrwcRouterComponent } from '../../qrwc/components/qrwc-router-component';
import { MIXER_PROFILE } from './mixer-profile';

@Component({
  selector: 'app-mixer',
  standalone: true,
  imports: [
    MixerInputComponent,
    MixerHpfComponent,
    MixerGateComponent,
    MixerCompressorComponent,
    MixerEqualizerComponent,
    MixerOutputComponent,
    MixerAuxSendsComponent,
    MixerChannelComponent,
    MixerCueComponent,
    MixerAuxMasterComponent,
    MixerMasterComponent
  ],
  templateUrl: './mixer.component.html',
  styleUrls: ['./mixer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MixerComponent {
  private readonly channelProcessing = inject(ChannelProcessingService);
  readonly profile = inject(MIXER_PROFILE);

  // QRWC components — mixer is public so the template can pass it to child components
  mixer!: QrwcMixerComponent;
  private router!: QrwcRouterComponent;

  // Selected channel — single source of truth for the whole mixer view.
  selectedChannel = signal<number>(1);

  // Ordered list of channel IDs for the fader bank @for loop
  readonly channelIds = Array.from({ length: this.profile.channelCount }, (_, i) => i + 1);

  constructor() {
    // Initialise per-channel QRWC components (gates, compressors, EQs, delays, HPFs, mic input)
    this.channelProcessing.initialize();

    this.mixer = new QrwcMixerComponent(this.profile.mixerComponentName);
    this.router = new QrwcRouterComponent(this.profile.routerComponentName);

    // Sync selected channel → router. Guard prevents ping-pong when router already matches.
    // Skip when nothing is selected (the router stays on its previous value).
    effect(() => {
      const selected = this.selectedChannel();
      if (selected == null) return;
      if (untracked(() => this.router.selector()) !== selected) {
        this.router.SetSelector(selected);
      }
    });

    // Sync router → selected channel.
    effect(() => {
      const routerChannel = this.router.selector();
      if (!routerChannel || routerChannel < 1) return;
      if (untracked(() => this.selectedChannel()) !== routerChannel) {
        this.selectedChannel.set(routerChannel);
      }
    });
  }

  selectChannel(channelId: number): void {
    this.selectedChannel.set(channelId);
  }
}