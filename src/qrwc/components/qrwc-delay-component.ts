import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * QRWC wrapper for Q-SYS Delay element
 * Provides delay control for audio signals (Tap 1 only)
 */
export class QrwcDelayComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings for Tap 1
  private readonly _masterBypassBinding;
  private readonly _tap1BypassBinding;
  private readonly _tap1DelayBinding;
  private readonly _tap1GainBinding;
  private readonly _tap1MuteBinding;

  /**
   * Delay Component
   * @param componentName - The name of the Delay Component.
   */
  constructor(private componentName: string) {
    // Master controls
    this._masterBypassBinding = this.qrwc.bindControl(componentName, 'bypass', false);

    // Tap 1 controls (the main delay tap we use)
    this._tap1BypassBinding = this.qrwc.bindControl(componentName, 'bypass.1', false);
    this._tap1DelayBinding = this.qrwc.bindControl(componentName, 'delay.1', 0);
    this._tap1GainBinding = this.qrwc.bindControl(componentName, 'gain.1', 0);
    this._tap1MuteBinding = this.qrwc.bindControl(componentName, 'mute.1', false);
  }

  /**
   * Get the master bypass state
   */
  get bypass(): Signal<boolean> {
    return this._masterBypassBinding.bool;
  }

  /**
   * Get the tap 1 bypass state
   */
  get tap1Bypass(): Signal<boolean> {
    return this._tap1BypassBinding.bool;
  }

  /**
   * Get the tap 1 delay time in milliseconds
   */
  get delay(): Signal<number> {
    return this._tap1DelayBinding.value;
  }

  /**
   * Get the delay position (0-1 normalized)
   */
  get delayPosition(): Signal<number> {
    return this._tap1DelayBinding.position;
  }

  /**
   * Get the delay display string from the processor
   */
  get delayString(): Signal<string> {
    return this._tap1DelayBinding.string;
  }

  /**
   * Get the tap 1 gain in dB
   */
  get gain(): Signal<number> {
    return this._tap1GainBinding.value;
  }

  /**
   * Get the tap 1 mute state
   */
  get mute(): Signal<boolean> {
    return this._tap1MuteBinding.bool;
  }

  /**
   * Set the master bypass state
   * @param bypass - true to bypass, false to enable
   */
  SetBypass(bypass: boolean): void {
    this._masterBypassBinding.setValue(bypass);
  }

  /**
   * Set the tap 1 bypass state
   * @param bypass - true to bypass, false to enable
   */
  SetTap1Bypass(bypass: boolean): void {
    this._tap1BypassBinding.setValue(bypass);
  }

  /**
   * Set the delay time for tap 1
   * @param delayMs - Delay time in milliseconds
   */
  SetDelay(delayMs: number): void {
    if (delayMs >= 0) {
      this._tap1DelayBinding.setValue(delayMs);
    } else {
      console.error(`Invalid delay: ${delayMs}. Must be >= 0.`);
    }
  }

  /**
   * Set the delay via normalized position (0-1)
   */
  SetDelayPosition(position: number): void {
    this._tap1DelayBinding.setPosition(position);
  }

  /**
   * Set the gain for tap 1
   * @param gainDb - Gain in dB
   */
  SetGain(gainDb: number): void {
    this._tap1GainBinding.setValue(gainDb);
  }

  /**
   * Set the mute state for tap 1
   * @param mute - true to mute, false to unmute
   */
  SetMute(mute: boolean): void {
    this._tap1MuteBinding.setValue(mute);
  }
}
