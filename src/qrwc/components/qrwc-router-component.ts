import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * QRWC wrapper for Q-SYS Router component
 * The router provides channel selection (1-16) for Output 1
 * This routes the selected input to the output and to the responsalyzer
 */
export class QrwcRouterComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings
  private readonly _selectBinding;
  private readonly _muteBinding;

  /**
   * Router Component
   * @param componentName - The name of the Router Component.
   */
  constructor(private componentName: string) {
    // Output 1 selector - Integer control that selects which input (1-16)
    this._selectBinding = this.qrwc.bindControl(componentName, 'select.1', 1);
    
    // Output 1 mute
    this._muteBinding = this.qrwc.bindControl(componentName, 'mute.1', false);
  }

  /**
   * Get the current selected input for Output 1 (1-16)
   */
  get selector(): Signal<number> {
    return this._selectBinding.value;
  }

  /**
   * Get the selector position (0-1 normalized)
   */
  get selectorPosition(): Signal<number> {
    return this._selectBinding.position;
  }

  /**
   * Get the mute state for Output 1
   */
  get mute(): Signal<boolean> {
    return this._muteBinding.bool;
  }

  /**
   * Set the selector to a specific input channel
   * @param channel - Input channel number (1-16)
   */
  SetSelector(channel: number): void {
    if (channel >= 1 && channel <= 16) {
      this._selectBinding.setValue(channel);
    } else {
      console.error(`Invalid channel: ${channel}. Must be between 1 and 16.`);
    }
  }

  /**
   * Set the mute state for Output 1
   * @param mute - true to mute, false to unmute
   */
  SetMute(mute: boolean): void {
    this._muteBinding.setValue(mute);
  }
}
