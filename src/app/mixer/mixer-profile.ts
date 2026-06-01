import { InjectionToken } from '@angular/core';

/**
 * Range descriptor for a single EQ band.
 */
export interface EqBandRange {
  label: string;
  min: number;
  max: number;
  step: number;
}

/**
 * Mapping from a global channel number (1-based) to the Q-SYS Mic/Line Input
 * block component name and local channel number within that block.
 */
export interface MicInputMapping {
  /** Number of mic/line input blocks (e.g. 4 for a 16ch surface with 4ch blocks). */
  blockCount: number;
  /** Channels per block (typically 4). */
  channelsPerBlock: number;
  /** Q-SYS component name template — `{n}` is replaced by 1-based block index. */
  componentNameTemplate: string;
}

/**
 * Static description of a mixer surface variant. Drives channel counts,
 * Q-SYS component naming, output/cue/aux routing assumptions and EQ metadata.
 *
 * Add new variants (e.g. a 32ch surface, or a Q-SYS 510i layout) by
 * declaring another MixerProfile and providing it via MIXER_PROFILE.
 */
export interface MixerProfile {
  /** Unique id used for theming / persistence. */
  readonly id: string;
  /** Human-readable name. */
  readonly displayName: string;

  /** Number of input channels in the fader bank. */
  readonly channelCount: number;

  /** Mixer named component in the Q-SYS design. */
  readonly mixerComponentName: string;
  /** Router named component (selected-channel routing). */
  readonly routerComponentName: string;

  /** Per-channel processor name templates — `{n}` is the 1-based channel index. */
  readonly processorNameTemplates: {
    readonly gate: string;
    readonly compressor: string;
    readonly parametricEq: string;
    readonly delay: string;
    readonly highPassFilter: string;
  };

  /** Mic/Line input block configuration. */
  readonly micInput: MicInputMapping;

  /** Mixer output index used as the main stereo output. */
  readonly mainOutput: number;
  /** Mixer output indices used as aux send buses. */
  readonly auxOutputs: readonly number[];
  /** Cue bus index. */
  readonly cueBus: number;

  /** Number of EQ bands per channel (must match Q-SYS design). */
  readonly eqBandCount: number;
  /** Frequency range/step metadata per EQ band — length must equal eqBandCount. */
  readonly eqBandRanges: readonly EqBandRange[];
}

/**
 * Default profile — the 16-channel Q-Mix Surface.
 */
export const DEFAULT_MIXER_PROFILE: MixerProfile = {
  id: 'q-mix-16',
  displayName: 'Q-Mix Surface (16ch)',

  channelCount: 16,

  mixerComponentName: 'Mixer',
  routerComponentName: 'Router',

  processorNameTemplates: {
    gate:            'Gate_{n}',
    compressor:      'Compressor_{n}',
    parametricEq:    'Parametric_Equalizer_{n}',
    delay:           'Standard_Delay_{n}',
    highPassFilter:  'High-Pass_Filter_{n}',
  },

  micInput: {
    blockCount: 4,
    channelsPerBlock: 4,
    componentNameTemplate: 'Mic_Line_Input_{n}',
  },

  mainOutput: 5,
  auxOutputs: [1, 2, 3, 4],
  cueBus: 1,

  eqBandCount: 7,
  eqBandRanges: [
    { label: 'LOW',   min: 20,   max: 500,   step: 5   },
    { label: 'LMID',  min: 100,  max: 2000,  step: 10  },
    { label: 'MID',   min: 500,  max: 8000,  step: 50  },
    { label: 'MID2',  min: 100,  max: 2000,  step: 10  },
    { label: 'HMID',  min: 1000, max: 10000, step: 50  },
    { label: 'HIGH',  min: 2000, max: 20000, step: 100 },
    { label: 'AIR',   min: 2000, max: 20000, step: 100 },
  ],
};

/**
 * DI token for the active MixerProfile.
 */
export const MIXER_PROFILE = new InjectionToken<MixerProfile>('MIXER_PROFILE', {
  providedIn: 'root',
  factory: () => DEFAULT_MIXER_PROFILE,
});

/**
 * Substitute `{n}` placeholders in a Q-SYS component name template.
 */
export function formatComponentName(template: string, index: number): string {
  return template.replace('{n}', String(index));
}
