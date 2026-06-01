import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

// TODO: Replace with typed enums once option values are confirmed
export type HpfNormalization = number;
export type HpfSlope = number;
export type HpfFilterType = number;

/**
 * QRWC wrapper for Q-SYS High-Pass Filter component
 */
export class QrwcHighPassFilterComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings
  private readonly _bypassBinding;
  private readonly _frequencyBinding;
  private readonly _gainBinding;
  private readonly _invertBinding;
  private readonly _muteBinding;
  private readonly _normalizationBinding;
  private readonly _normalizationLabelBinding;
  private readonly _qBinding;
  private readonly _qLabelBinding;
  private readonly _slopeBinding;
  private readonly _slopeLabelBinding;
  private readonly _typeBinding;

  /**
   * High-Pass Filter Component
   * @param componentName - The name of the High-Pass Filter Component.
   */
  constructor(private componentName: string) {
    this._bypassBinding          = this.qrwc.bindControl(componentName, 'bypass', false);
    this._frequencyBinding       = this.qrwc.bindControl(componentName, 'frequency', 80);
    this._gainBinding            = this.qrwc.bindControl(componentName, 'gain', 0);
    this._invertBinding          = this.qrwc.bindControl(componentName, 'invert', false);
    this._muteBinding            = this.qrwc.bindControl(componentName, 'mute', false);
    this._normalizationBinding   = this.qrwc.bindControl(componentName, 'normalization', 0);
    this._normalizationLabelBinding = this.qrwc.bindControl(componentName, 'normalization.label', '');
    this._qBinding               = this.qrwc.bindControl(componentName, 'q', 0);
    this._qLabelBinding          = this.qrwc.bindControl(componentName, 'q.label', '');
    this._slopeBinding           = this.qrwc.bindControl(componentName, 'slope', 0);
    this._slopeLabelBinding      = this.qrwc.bindControl(componentName, 'slope.label', '');
    this._typeBinding            = this.qrwc.bindControl(componentName, 'type', 0);
  }

  /** The bypass state of the high-pass filter. */
  get bypass(): Signal<boolean> {
    return this._bypassBinding.bool;
  }

  /** The cutoff frequency in Hz. */
  get frequency(): Signal<number> {
    return this._frequencyBinding.value;
  }

  /** The frequency position (0-1 normalized). */
  get frequencyPosition(): Signal<number> {
    return this._frequencyBinding.position;
  }

  /** The frequency display string from the processor (e.g. "80 Hz"). */
  get frequencyString(): Signal<string> {
    return this._frequencyBinding.string;
  }

  /** The output gain in dB. */
  get gain(): Signal<number> {
    return this._gainBinding.value;
  }

  /** The gain position (0-1 normalized). */
  get gainPosition(): Signal<number> {
    return this._gainBinding.position;
  }

  /** The polarity invert state. */
  get invert(): Signal<boolean> {
    return this._invertBinding.bool;
  }

  /** The mute state. */
  get mute(): Signal<boolean> {
    return this._muteBinding.bool;
  }

  /** The normalization type (enum value). */
  get normalization(): Signal<HpfNormalization> {
    return this._normalizationBinding.value;
  }

  /** The normalization type display label. */
  get normalizationLabel(): Signal<string> {
    return this._normalizationLabelBinding.string;
  }

  /** The Q-factor value. */
  get q(): Signal<number> {
    return this._qBinding.value;
  }

  /** The Q-factor position (0-1 normalized). */
  get qPosition(): Signal<number> {
    return this._qBinding.position;
  }

  /** The Q-factor display label. */
  get qLabel(): Signal<string> {
    return this._qLabelBinding.string;
  }

  /** The filter slope (enum value). */
  get slope(): Signal<HpfSlope> {
    return this._slopeBinding.value;
  }

  /** The slope display label. */
  get slopeLabel(): Signal<string> {
    return this._slopeLabelBinding.string;
  }

  /** The filter type (enum value). */
  get type(): Signal<HpfFilterType> {
    return this._typeBinding.value;
  }

  /** Set the bypass state. */
  SetBypass(bypass: boolean): void {
    this._bypassBinding.setValue(bypass);
  }

  /** Toggle the bypass state. */
  ToggleBypass(): void {
    this._bypassBinding.setValue(!this._bypassBinding.bool());
  }

  /** Set the cutoff frequency in Hz. */
  SetFrequency(frequency: number): void {
    if (frequency > 0) {
      this._frequencyBinding.setValue(frequency);
    } else {
      console.error(`Invalid frequency: ${frequency}. Must be > 0.`);
    }
  }

  /** Set the frequency using normalized position (0-1). */
  SetFrequencyPosition(position: number): void {
    this._frequencyBinding.setPosition(position);
  }

  /** Set the output gain in dB. */
  SetGain(gain: number): void {
    this._gainBinding.setValue(gain);
  }

  /** Set the gain using normalized position (0-1). */
  SetGainPosition(position: number): void {
    this._gainBinding.setPosition(position);
  }

  /** Set the polarity invert state. */
  SetInvert(invert: boolean): void {
    this._invertBinding.setValue(invert);
  }

  /** Toggle the polarity invert state. */
  ToggleInvert(): void {
    this._invertBinding.setValue(!this._invertBinding.bool());
  }

  /** Set the mute state. */
  SetMute(mute: boolean): void {
    this._muteBinding.setValue(mute);
  }

  /** Toggle the mute state. */
  ToggleMute(): void {
    this._muteBinding.setValue(!this._muteBinding.bool());
  }

  /** Set the normalization type by enum value. */
  SetNormalization(value: HpfNormalization): void {
    this._normalizationBinding.setValue(value);
  }

  /** Set the Q-factor value. */
  SetQ(q: number): void {
    this._qBinding.setValue(q);
  }

  /** Set the Q-factor using normalized position (0-1). */
  SetQPosition(position: number): void {
    this._qBinding.setPosition(position);
  }

  /** Set the filter slope by enum value. */
  SetSlope(value: HpfSlope): void {
    this._slopeBinding.setValue(value);
  }

  /** Set the filter type by enum value. */
  SetType(value: HpfFilterType): void {
    this._typeBinding.setValue(value);
  }
}
