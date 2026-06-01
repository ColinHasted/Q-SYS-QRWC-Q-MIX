import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * Interface representing a single channel's controls
 */
export interface MicLineInputChannel {
  /** Whether the channel is clipping (Boolean) */
  clip: Signal<boolean>;
  /** Whether the clip indicator is being held (Boolean) */
  clipHold: Signal<boolean>;
  /** The digital input level in dBFS (Float) */
  digitalInputLevel: Signal<number>;
  /** The input gain in dB (Float) */
  inputGain: Signal<number>;
  /** Whether the input polarity is inverted (Boolean) */
  inputInvert: Signal<boolean>;
  /** Whether the input is muted (Boolean) */
  inputMute: Signal<boolean>;
  /** Whether phantom power is enabled (Boolean) */
  phantomPower: Signal<boolean>;
  /** The preamp gain in dB (Float) */
  preampGain: Signal<number>;
  /** The preamp sensitivity setting (Integer) */
  sensitivity: Signal<number>;
}

export class QrwcMicLineInputComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings for status controls
  private readonly _statusBinding;
  private readonly _statusLedBinding;

  // Private bindings for per-channel controls
  private readonly _clipBindings: any[] = [];
  private readonly _clipHoldBindings: any[] = [];
  private readonly _digitalInputLevelBindings: any[] = [];
  private readonly _inputGainBindings: any[] = [];
  private readonly _inputInvertBindings: any[] = [];
  private readonly _inputMuteBindings: any[] = [];
  private readonly _phantomPowerBindings: any[] = [];
  private readonly _preampGainBindings: any[] = [];
  private readonly _sensitivityBindings: any[] = [];

  /** The status message (Status) */
  get status(): Signal<string> {
    return this._statusBinding.string;
  }

  /** The status LED state (String) */
  get statusLed(): Signal<string> {
    return this._statusLedBinding.string;
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
   * Get the digital input level for a specific channel (dBFS)
   * @param channel - Channel number (1-based)
   */
  getDigitalInputLevel(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._digitalInputLevelBindings[channel - 1].value;
  }

  /**
   * Get the input gain for a specific channel (dB)
   * @param channel - Channel number (1-based)
   */
  getInputGain(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._inputGainBindings[channel - 1].value;
  }

  /**
   * Get the input gain position for a specific channel (0-1)
   * @param channel - Channel number (1-based)
   */
  getInputGainPosition(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._inputGainBindings[channel - 1].position;
  }

  /**
   * Get the input gain string label for a specific channel
   * @param channel - Channel number (1-based)
   */
  getInputGainString(channel: number): Signal<string> {
    this.validateChannel(channel);
    return this._inputGainBindings[channel - 1].string;
  }

  /**
   * Get the input invert state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getInputInvert(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._inputInvertBindings[channel - 1].bool;
  }

  /**
   * Get the input mute state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getInputMute(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._inputMuteBindings[channel - 1].bool;
  }

  /**
   * Get the phantom power state for a specific channel
   * @param channel - Channel number (1-based)
   */
  getPhantomPower(channel: number): Signal<boolean> {
    this.validateChannel(channel);
    return this._phantomPowerBindings[channel - 1].bool;
  }

  /**
   * Get the preamp gain for a specific channel (dB)
   * @param channel - Channel number (1-based)
   */
  getPreampGain(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._preampGainBindings[channel - 1].value;
  }

  /**
   * Get the preamp gain position for a specific channel (0-1)
   * @param channel - Channel number (1-based)
   */
  getPreampGainPosition(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._preampGainBindings[channel - 1].position;
  }

  /**
   * Get the preamp gain string label for a specific channel
   * @param channel - Channel number (1-based)
   */
  getPreampGainString(channel: number): Signal<string> {
    this.validateChannel(channel);
    return this._preampGainBindings[channel - 1].string;
  }

  /**
   * Get the sensitivity setting for a specific channel
   * @param channel - Channel number (1-based)
   */
  getSensitivity(channel: number): Signal<number> {
    this.validateChannel(channel);
    return this._sensitivityBindings[channel - 1].value;
  }

  /**
   * Get a channel object with all controls for a specific channel
   * @param channel - Channel number (1-based)
   */
  getChannel(channel: number): MicLineInputChannel {
    this.validateChannel(channel);
    const idx = channel - 1;
    return {
      clip: this._clipBindings[idx].bool,
      clipHold: this._clipHoldBindings[idx].bool,
      digitalInputLevel: this._digitalInputLevelBindings[idx].value,
      inputGain: this._inputGainBindings[idx].value,
      inputInvert: this._inputInvertBindings[idx].bool,
      inputMute: this._inputMuteBindings[idx].bool,
      phantomPower: this._phantomPowerBindings[idx].bool,
      preampGain: this._preampGainBindings[idx].value,
      sensitivity: this._sensitivityBindings[idx].value,
    };
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
   * Get all digital input levels as an array of signals
   */
  get digitalInputLevels(): Signal<number>[] {
    return this._digitalInputLevelBindings.map(b => b.value);
  }

  /**
   * Get all input gains as an array of signals
   */
  get inputGains(): Signal<number>[] {
    return this._inputGainBindings.map(b => b.value);
  }

  /**
   * Get all input invert states as an array of signals
   */
  get inputInverts(): Signal<boolean>[] {
    return this._inputInvertBindings.map(b => b.bool);
  }

  /**
   * Get all input mute states as an array of signals
   */
  get inputMutes(): Signal<boolean>[] {
    return this._inputMuteBindings.map(b => b.bool);
  }

  /**
   * Get all phantom power states as an array of signals
   */
  get phantomPowers(): Signal<boolean>[] {
    return this._phantomPowerBindings.map(b => b.bool);
  }

  /**
   * Get all preamp gains as an array of signals
   */
  get preampGains(): Signal<number>[] {
    return this._preampGainBindings.map(b => b.value);
  }

  /**
   * Get all sensitivity values as an array of signals
   */
  get sensitivities(): Signal<number>[] {
    return this._sensitivityBindings.map(b => b.value);
  }

  /**
   * Mic/Line Input Component
   * @param componentName - The name of the Mic/Line Input Component.
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
      this._clipBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.clip`, false)
      );
      this._clipHoldBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.clip.hold`, false)
      );
      this._digitalInputLevelBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.digital.input.level`, -100)
      );
      this._inputGainBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.input.gain`, 0)
      );
      this._inputInvertBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.input.invert`, false)
      );
      this._inputMuteBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.input.mute`, false)
      );
      this._phantomPowerBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.phantom.power`, false)
      );
      this._preampGainBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.preamp.gain`, 0)
      );
      this._sensitivityBindings.push(
        this.qrwc.bindControl(componentName, `channel.${i}.sensitivity`, 0)
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
   * Set the input gain for a specific channel
   * @param channel - Channel number (1-based)
   * @param dB - The gain value in dB
   */
  SetInputGain(channel: number, dB: number): void {
    this.validateChannel(channel);
    this._inputGainBindings[channel - 1].setValue(dB);
  }

  /**
   * Set the input gain position for a specific channel
   * @param channel - Channel number (1-based)
   * @param position - The position value (0-1)
   */
  SetInputGainPosition(channel: number, position: number): void {
    this.validateChannel(channel);
    this._inputGainBindings[channel - 1].setPosition(position);
  }

  /**
   * Set the input invert state for a specific channel
   * @param channel - Channel number (1-based)
   * @param state - The invert state (true = inverted, false = normal)
   */
  SetInputInvert(channel: number, state: boolean): void {
    this.validateChannel(channel);
    this._inputInvertBindings[channel - 1].setValue(state);
  }

  /**
   * Toggle the input invert state for a specific channel
   * @param channel - Channel number (1-based)
   */
  ToggleInputInvert(channel: number): void {
    this.validateChannel(channel);
    const binding = this._inputInvertBindings[channel - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the input mute state for a specific channel
   * @param channel - Channel number (1-based)
   * @param state - The mute state (true = muted, false = unmuted)
   */
  SetInputMute(channel: number, state: boolean): void {
    this.validateChannel(channel);
    this._inputMuteBindings[channel - 1].setValue(state);
  }

  /**
   * Toggle the input mute state for a specific channel
   * @param channel - Channel number (1-based)
   */
  ToggleInputMute(channel: number): void {
    this.validateChannel(channel);
    const binding = this._inputMuteBindings[channel - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the phantom power state for a specific channel
   * @param channel - Channel number (1-based)
   * @param state - The phantom power state (true = enabled, false = disabled)
   */
  SetPhantomPower(channel: number, state: boolean): void {
    this.validateChannel(channel);
    this._phantomPowerBindings[channel - 1].setValue(state);
  }

  /**
   * Toggle the phantom power state for a specific channel
   * @param channel - Channel number (1-based)
   */
  TogglePhantomPower(channel: number): void {
    this.validateChannel(channel);
    const binding = this._phantomPowerBindings[channel - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the preamp gain for a specific channel
   * @param channel - Channel number (1-based)
   * @param dB - The preamp gain value in dB
   */
  SetPreampGain(channel: number, dB: number): void {
    this.validateChannel(channel);
    this._preampGainBindings[channel - 1].setValue(dB);
  }

  /**
   * Set the preamp gain position for a specific channel
   * @param channel - Channel number (1-based)
   * @param position - The position value (0-1)
   */
  SetPreampGainPosition(channel: number, position: number): void {
    this.validateChannel(channel);
    this._preampGainBindings[channel - 1].setPosition(position);
  }

  /**
   * Set the sensitivity for a specific channel
   * @param channel - Channel number (1-based)
   * @param value - The sensitivity value (integer)
   */
  SetSensitivity(channel: number, value: number): void {
    this.validateChannel(channel);
    this._sensitivityBindings[channel - 1].setValue(value);
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
   * Mute all channels
   */
  MuteAll(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._inputMuteBindings[i].setValue(true);
    }
  }

  /**
   * Unmute all channels
   */
  UnmuteAll(): void {
    for (let i = 0; i < this.channelCount; i++) {
      this._inputMuteBindings[i].setValue(false);
    }
  }
}
