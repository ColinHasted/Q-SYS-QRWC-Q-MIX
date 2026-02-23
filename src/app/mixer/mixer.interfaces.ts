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
  // Delay
  delayOn: boolean;
  delayMs: number;
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
