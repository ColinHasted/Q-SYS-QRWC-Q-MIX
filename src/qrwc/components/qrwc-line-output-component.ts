import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * Interface representing a single channel's controls
 */
export interface LineOutputChannel {
  /** The analog output level in dBu (Float) */
  analogOutputLevel: Signal<number>;
  /** Whether the channel is clipping (Boolean) */
  clip: Signal<boolean>;
  /** Whether the clip indicator is being held (Boolean) */
  clipHold: Signal<boolean>;
  /** The digital output level in dBFS (Float) */
  digitalOutputLevel: Signal<number>;
  /** The maximum output gain in dB (Float) */
  maxGain: Signal<number>;
  /** The maximum output level (Integer) */
  maxLevel: Signal<number>;
  /** The output gain in dB (Float) */
  outputGain: Signal<number>;
  /** Whether the output polarity is inverted (Boolean) */
  outputInvert: Signal<boolean>;
  /** Whether the output is muted (Boolean) */
  outputMute: Signal<boolean>;
  /** Whether the relay mute is active (Boolean) */
  relayMute: Signal<boolean>;
}

export class QrwcLineOutputComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings for status controls
  private readonly _statusBinding;
  private readonly _statusLedBinding;

  // Private bindings for per-channel controls
  private readonly _analogOutputLevelBindings: any[] = [];
  private readonly _clipBindings: any[] = [];
  private readonly _clipHoldBindings: any[] = [];
  private readonly _digitalOutputLevelBindings: any[] = [];
  private readonly _maxGainBindings: any[] = [];
  private readonly _maxLevelBindings: any[] = [];
  private readonly _outputGainBindings: any[] = [];
  private readonly _outputInvertBindings: any[] = [];
  private readonly _outputMuteBindings: any[] = [];
  private readonly _relayMuteBindings: any[] = [];

  /** The status message (Status) */
  get status(): Signal<string> {
    return this._statusBinding.string;
  }

  /** The status LED state (String) */
  get statusLed(): Signal<string> {
    return this._statusLedBinding.string;
  }

  /**
   * Get the analog output level for a specific channel (dBu)
   * @param channel - Channel number (1-based)
   */
  getAnalogOutputLevel(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._analogOutputLevelBindings[channel - 1].value;
  }

  /**
   * Get the clip state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getClip(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._clipBindings[channel - 1].bool;
  }

  /**
   * Get the clip hold state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getClipHold(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._clipHoldBindings[channel - 1].bool;
  }

  /**
   * Get the digital output level for a specific channel (dBFS)
   * @param channel - Channel number (1-based)
   */
  getDigitalOutputLevel(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._digitalOutputLevelBindings[channel - 1].value;
  }

  /**
   * Get the max gain for a specific channel (dB)
   * @param channel - Channel number (1-based)
   */
  getMaxGain(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._maxGainBindings[channel - 1].value;
  }

  /**
   * Get the max level for a specific channel
   * @param channel - Channel number (1-based)
   */
  getMaxLevel(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._maxLevelBindings[channel - 1].value;
  }

  /**
   * Get the output gain for a specific channel (dB)
   * @param channel - Channel number (1-based)
   */
  getOutputGain(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._outputGainBindings[channel - 1].value;
  }

  /**
   * Get the output gain position for a specific channel (0-1)
   * @param channel - Channel number (1-based)
   */
  getOutputGainPosition(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._outputGainBindings[channel - 1].position;
  }

  /**
   * Get the output invert state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getOutputInvert(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._outputInvertBindings[channel - 1].bool;
  }

  /**
   * Get the output mute state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getOutputMute(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._outputMuteBindings[channel - 1].bool;
  }

  /**
   * Get the relay mute state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getRelayMute(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._relayMuteBindings[channel - 1].bool;
  }

  /**
   * Get a channel object with all controls for a specific channel
   * @param channel - Channel number (1-based)
   */
  getChannel(channel: number): LineOutputChannel {
    this.validateChannel(channel);
    const idx = channel - 1;
    return {
      analogOutputLevel: this._analogOutputLevelBindings[idx].value,
      clip: this._clipBindings[idx].bool,
      clipHold: this._clipHoldBindings[idx].bool,
      digitalOutputLevel: this._digitalOutputLevelBindings[idx].value,
      maxGain: this._maxGainBindings[idx].value,
      maxLevel: this._maxLevelBindings[idx].value,
      outputGain: this._outputGainBindings[idx].value,
      outputInvert: this._outputInvertBindings[idx].bool,
      outputMute: this._outputMuteBindings[idx].bool,
      relayMute: this._relayMuteBindings[idx].bool,
    };
  }

  /**
   * Get all analog output levels as an array of signals
   */
  get analogOutputLevels(): Signal<number>[] {
    return this._analogOutputLevelBindings.map(b => b.value);
  }

  /**
   * Get all clip states as an array of signals
   */
  get clips(): Signal<boolean>[] {
    return this._clipBindings.map(b => b.bool);
  }

  /**
   * Get all clip hold states as an array of signals
   */
  get clipHolds(): Signal<boolean>[] {
    return this._clipHoldBindings.map(b => b.bool);
  }

  /**
   * Get all digital output levels as an array of signals
   */
  get digitalOutputLevels(): Signal<number>[] {
    return this._digitalOutputLevelBindings.map(b => b.value);
  }

  /**
   * Get all max gains as an array of signals
   */
  get maxGains(): Signal<number>[] {
    return this._maxGainBindings.map(b => b.value);
  }

  /**
   * Get all max levels as an array of signals
   */
  get maxLevels(): Signal<number>[] {
    return this._maxLevelBindings.map(b => b.value);
  }

  /**
   * Get all output gains as an array of signals
   */
  get outputGains(): Signal<number>[] {
    return this._outputGainBindings.map(b => b.value);
  }

  /**
   * Get all output invert states as an array of signals
   */
  get outputInverts(): Signal<boolean>[] {
    return this._outputInvertBindings.map(b => b.bool);
  }

  /**
   * Get all output mute states as an array of signals
   */
  get outputMutes(): Signal<boolean>[] {
    return this._outputMuteBindings.map(b => b.bool);
  }

  /**
   * Get all relay mute states as an array of signals
   */
  get relayMutes(): Signal<boolean>[] {
    return this._relayMuteBindings.map(b => b.bool);
  }

  /**
   * Line Output Component
   * @param componentName - The name of the Line Output Component.
   * @param channelCount - The number of channels (1-8, default 8).
   */
  constructor(private componentName: string, private channelCount: number = 8) {
    if (channelCount < 1 || channelCount > 8) {
      throw new Error(`Channel count must be between 1 and 8, got ${channelCount}`);
    }

    // Bind status controls
    this._statusBinding = this.qrwc.bindControl(componentName, 'status', '');
    this._statusLedBinding = this.qrwc.bindControl(componentName, 'status.led', '');

    // Bind per-channel controls
    for (let i = 1; i <= channelCount; i++) {
      this._analogOutputLevelBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.analog.output.level`, -100)
      );
      this._clipBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.clip`, false)
      );
      this._clipHoldBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.clip.hold`, false)
      );
      this._digitalOutputLevelBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.digital.output.level`, -100)
      );
      this._maxGainBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.max.gain`, 0)
      );
      this._maxLevelBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.max.level`, 0)
      );
      this._outputGainBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.output.gain`, 0)
      );
      this._outputInvertBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.output.invert`, false)
      );
      this._outputMuteBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.output.mute`, false)
      );
      this._relayMuteBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.relay.mute`, false)
      );
    }
  }

  /**
   * Validates that the channel number is within range
   */
  private validateChannel(channel: number): void {
    if (channel < 1 || channel > this.channelCount) {
      throw new Error(`Channel ${channel} out of range (1-${this.channelCount})`);
    }
  }

  // ==================== Setter Methods ====================

  /**
   * Set the max gain for a specific channel
   * @param channel - Channel number (1-based)
   * @param dB - The max gain value in dB
   */
  SetMaxGain(channel: number, dB: number): void {
    this.validateChannel(channel);
    this._maxGainBindings[channel - 1].setValue(dB);
  }

  /**
   * Set the max level for a specific channel
   * @param channel - Channel number (1-based)
   * @param value - The max level value
   */
  SetMaxLevel(channel: number, value: number): void {
    this.validateChannel(channel);
    this._maxLevelBindings[channel - 1].setValue(value);
  }

  /**
   * Set the output gain for a specific channel
   * @param channel - Channel number (1-based)
   * @param dB - The gain value in dB
   */
  SetOutputGain(channel: number, dB: number): void {
    this.validateChannel(channel);
    this._outputGainBindings[channel - 1].setValue(dB);
  }

  /**
   * Set the output gain position for a specific channel
   * @param channel - Channel number (1-based)
   * @param position - The position value (0-1)
   */
  SetOutputGainPosition(channel: number, position: number): void {
    this.validateChannel(channel);
    this._outputGainBindings[channel - 1].setPosition(position);
  }

  /**
   * Set the output invert state for a specific channel
   * @param channel - Channel number (1-based)
   * @param state - The invert state (true = inverted, false = normal)
   */
  SetOutputInvert(channel: number, state: boolean): void {
    this.validateChannel(channel);
    this._outputInvertBindings[channel - 1].setValue(state);
  }

  /**
   * Toggle the output invert state for a specific channel
   * @param channel - Channel number (1-based)
   */
  ToggleOutputInvert(channel: number): void {
    this.validateChannel(channel);
    const binding = this._outputInvertBindings[channel - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the output mute state for a specific channel
   * @param channel - Channel number (1-based)
   * @param state - The mute state (true = muted, false = unmuted)
   */
  SetOutputMute(channel: number, state: boolean): void {
    this.validateChannel(channel);
    this._outputMuteBindings[channel - 1].setValue(state);
  }

  /**
   * Toggle the output mute state for a specific channel
   * @param channel - Channel number (1-based)
   */
  ToggleOutputMute(channel: number): void {
    this.validateChannel(channel);
    const binding = this._outputMuteBindings[channel - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the relay mute state for a specific channel
   * @param channel - Channel number (1-based)
   * @param state - The relay mute state (true = muted, false = unmuted)
   */
  SetRelayMute(channel: number, state: boolean): void {
    this.validateChannel(channel);
    this._relayMuteBindings[channel - 1].setValue(state);
  }

  /**
   * Toggle the relay mute state for a specific channel
   * @param channel - Channel number (1-based)
   */
  ToggleRelayMute(channel: number): void {
    this.validateChannel(channel);
    const binding = this._relayMuteBindings[channel - 1];
    binding.setValue(!binding());
  }

  /**
   * Reset the clip hold indicator for a specific channel
   * @param channel - Channel number (1-based)
   */
  ResetClipHold(channel: number): void {
    this.validateChannel(channel);
    this._clipHoldBindings[channel - 1].setValue(false);
  }

  /**
   * Reset all clip hold indicators
   */
  ResetAllClipHolds(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._clipHoldBindings[i].setValue(false);
    }
  }

  /**
   * Mute all channels (output mute)
   */
  MuteAll(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._outputMuteBindings[i].setValue(true);
    }
  }

  /**
   * Unmute all channels (output mute)
   */
  UnmuteAll(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._outputMuteBindings[i].setValue(false);
    }
  }

  /**
   * Engage relay mute on all channels
   */
  RelayMuteAll(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._relayMuteBindings[i].setValue(true);
    }
  }

  /**
   * Disengage relay mute on all channels
   */
  RelayUnmuteAll(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._relayMuteBindings[i].setValue(false);
    }
  }
}
