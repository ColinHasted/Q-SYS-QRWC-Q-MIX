import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * QRWC wrapper for Q-SYS High-Pass Filter component
 */
export class QrwcHighPassFilterComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings
  private readonly _bypassBinding;
  private readonly _frequencyBinding;

  /**
   * High-Pass Filter Component
   * @param componentName - The name of the High-Pass Filter Component.
   */
  constructor(private componentName: string) {
    this._bypassBinding = this.qrwc.bindControl(componentName, 'bypass', false);
    this._frequencyBinding = this.qrwc.bindControl(componentName, 'frequency', 80);
  }

  /**
   * Get the bypass state of the high-pass filter
   */
  get bypass(): Signal<boolean> {
    return this._bypassBinding.bool;
  }

  /**
   * Get the cutoff frequency in Hz
   */
  get frequency(): Signal<number> {
    return this._frequencyBinding.value;
  }

  /**
   * Get the frequency position (0-1 normalized)
   */
  get frequencyPosition(): Signal<number> {
    return this._frequencyBinding.position;
  }

  /**
   * Set the bypass state
   * @param bypass - true to bypass, false to enable
   */
  SetBypass(bypass: boolean): void {
    this._bypassBinding.setValue(bypass);
  }

  /**
   * Set the cutoff frequency
   * @param frequency - Frequency in Hz
   */
  SetFrequency(frequency: number): void {
    if (frequency > 0) {
      this._frequencyBinding.setValue(frequency);
    } else {
      console.error(`Invalid frequency: ${frequency}. Must be > 0.`);
    }
  }

  /**
   * Set the frequency using normalized position (0-1)
   * @param position - Position value between 0 and 1
   */
  SetFrequencyPosition(position: number): void {
    this._frequencyBinding.setPosition(position);
  }
}
