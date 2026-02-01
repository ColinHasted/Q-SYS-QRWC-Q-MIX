export interface Channel {
  id: number;
  name: string;
  faderValue: number;
  pan: number;
  on: boolean;
  solo: boolean;
  cue: boolean;
  select: boolean;
  vuLevel: number;
  clip: boolean;
}

export interface ChannelStrip {
  // Headamp
  inputOn: boolean;
  gain: number;
  invert: boolean;
  phantom: boolean;
  // HPF
  hpfOn: boolean;
  hpfFrequency: number;
  // Gate
  gateOn: boolean;
  gateThreshold: number;
  gateAttack: number;
  gateHold: number;
  gateRelease: number;
  gateRange: number;
  // Compressor
  compOn: boolean;
  compThreshold: number;
  compRatio: number;
  compKnee: number;
  compAttack: number;
  compRelease: number;
  compDepth: number;
  compMakeup: number;
  // Limiter
  limiterOn: boolean;
  limiterThreshold: number;
  limiterAttack: number;
  limiterRelease: number;
  limiterCeiling: number;
  // EQ Bands
  eqOn: boolean;
  eqBands: EQBand[];
  // Delay
  delayOn: boolean;
  delayMs: number;
  // Pan
  pan: number;
  // Aux Sends
  auxSends: number[];
}

export interface EQBand {
  frequency: number;
  gain: number;
  q: number;
  type: 'lowshelf' | 'highshelf' | 'peaking';
  filterType: 'lowpass' | 'bandpass' | 'highpass';
}

export interface MasterChannel {
  faderValue: number;
  pan: number;
  mute: boolean;
  select: boolean;
  vuLevelL: number;
  vuLevelR: number;
  clipL: boolean;
  clipR: boolean;
}
