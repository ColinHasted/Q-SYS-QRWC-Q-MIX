import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * Interface representing a single crosspoint (input to output send)
 */
export interface MixerCrosspoint {
  /** The output number this crosspoint sends to (1-based) */
  output: number;
  /** The crosspoint gain in dB */
  gain: Signal<number>;
  /** The crosspoint gain position (0-1) */
  gainPosition: Signal<number>;
}

/**
 * Interface representing a single input channel with all its controls grouped together
 */
export interface MixerInputChannel {
  /** The input channel number (1-based) */
  id: number;
  
  // Channel controls
  /** The input gain in dB */
  gain: Signal<number>;
  /** The input gain position (0-1) */
  gainPosition: Signal<number>;
  /** Whether the input polarity is inverted */
  invert: Signal<boolean>;
  /** The input channel label */
  label: Signal<string>;
  /** Whether the input is muted */
  mute: Signal<boolean>;
  /** The pan position (-1.0 to 1.0) */
  pan: Signal<number>;
  /** Whether the input is soloed */
  solo: Signal<boolean>;
  /** The input trim in dB */
  trim: Signal<number>;
  
  // Crosspoint sends (aux/outputs)
  /** Array of crosspoints for this input to all outputs */
  crosspoints: MixerCrosspoint[];
  
  // Cue controls (if cues exist)
  /** Array of cue enable states for this input */
  cueEnable: Signal<boolean>[];
  /** Array of cue AFL states for this input */
  cueAfl: Signal<boolean>[];
}

/**
 * Interface representing a single output channel with all its controls
 */
export interface MixerOutputChannel {
  /** The output channel number (1-based) */
  id: number;
  
  /** The output gain in dB */
  gain: Signal<number>;
  /** The output gain position (0-1) */
  gainPosition: Signal<number>;
  /** Whether the output polarity is inverted */
  invert: Signal<boolean>;
  /** The output channel label */
  label: Signal<string>;
  /** Whether the output is muted */
  mute: Signal<boolean>;
  /** Whether the output is pre or post fader */
  prePost: Signal<boolean>;
}

/**
 * Interface representing a cue bus
 */
export interface MixerCueBus {
  /** The cue bus number (1-based) */
  id: number;
  
  /** The cue bus gain in dB */
  gain: Signal<number>;
  /** Whether the cue bus is muted */
  mute: Signal<boolean>;
}

/**
 * Channel-centric Mixer Component
 * 
 * This version organizes controls by channel, making it easier to access
 * all controls for a specific channel at once. Each channel object contains
 * all its properties including crosspoints.
 * 
 * @example
 * ```typescript
 * const mixer = new QrwcMixerChannelComponent('Mixer', 16, 4, 1);
 * 
 * // Get a channel with all its controls
 * const channel1 = mixer.getInputChannel(1);
 * console.log('Channel 1 gain:', channel1.gain());
 * console.log('Channel 1 mute:', channel1.mute());
 * console.log('Aux 1 send:', channel1.crosspoints[0].gain());
 * 
 * // Set values
 * mixer.setInputGain(1, -10);
 * mixer.toggleInputMute(1);
 * mixer.setCrosspointGain(1, 1, -20);
 * ```
 */
export class QrwcMixerChannelComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Channel-centric storage
  private readonly _inputChannels: MixerInputChannel[] = [];
  private readonly _outputChannels: MixerOutputChannel[] = [];
  private readonly _cueBuses: MixerCueBus[] = [];

  // Store bindings for setter methods (parallel to the channel arrays)
  private readonly _inputBindings: any[] = [];
  private readonly _outputBindings: any[] = [];
  private readonly _cueBindings: any[] = [];
  private readonly _crosspointBindings: any[][] = [];

  /**
   * Get a specific input channel with all its controls
   * @param input - Input number (1-based)
   */
  getInputChannel(input: number): MixerInputChannel {
    this.validateInput(input);
    return this._inputChannels[input - 1];
  }

  /**
   * Get all input channels
   */
  get inputChannels(): MixerInputChannel[] {
    return this._inputChannels;
  }

  /**
   * Get a specific output channel with all its controls
   * @param output - Output number (1-based)
   */
  getOutputChannel(output: number): MixerOutputChannel {
    this.validateOutput(output);
    return this._outputChannels[output - 1];
  }

  /**
   * Get all output channels
   */
  get outputChannels(): MixerOutputChannel[] {
    return this._outputChannels;
  }

  /**
   * Get a specific cue bus
   * @param cue - Cue number (1-based)
   */
  getCueBus(cue: number): MixerCueBus {
    this.validateCue(cue);
    return this._cueBuses[cue - 1];
  }

  /**
   * Get all cue buses
   */
  get cueBuses(): MixerCueBus[] {
    return this._cueBuses;
  }

  /**
   * Get the crosspoint for a specific input/output pair
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   */
  getCrosspoint(input: number, output: number): MixerCrosspoint {
    this.validateInput(input);
    this.validateOutput(output);
    const channel = this._inputChannels[input - 1];
    return channel.crosspoints[output - 1];
  }

  /**
   * Mixer Component with channel-centric organization
   * @param componentName - The name of the Mixer Component
   * @param inputCount - The number of inputs (default 17)
   * @param outputCount - The number of outputs (default 5)
   * @param cueCount - The number of cue buses (default 1)
   */
  constructor(
    private componentName: string,
    private inputCount: number = 16,
    private outputCount: number = 5,
    private cueCount: number = 1
  ) {
    if (inputCount < 1) {
      throw new Error(`Input count must be at least 1, got ${inputCount}`);
    }
    if (outputCount < 1) {
      throw new Error(`Output count must be at least 1, got ${outputCount}`);
    }
    if (cueCount < 0) {
      throw new Error(`Cue count must be at least 0, got ${cueCount}`);
    }

    // Build input channels with all controls grouped together
    for (let i = 1; i <= inputCount; i++) {
      const gainBinding = this.qrwc.bindControl(componentName, `input.${i}.gain`, 0);
      const invertBinding = this.qrwc.bindControl(componentName, `input.${i}.invert`, false);
      const labelBinding = this.qrwc.bindControl(componentName, `input.${i}.label`, '');
      const muteBinding = this.qrwc.bindControl(componentName, `input.${i}.mute`, false);
      const panBinding = this.qrwc.bindControl(componentName, `input.${i}.pan`, 0);
      const soloBinding = this.qrwc.bindControl(componentName, `input.${i}.solo`, false);
      const trimBinding = this.qrwc.bindControl(componentName, `input.${i}.trim`, 0);

      // Store bindings for setter methods
      const inputBindingSet = {
        gain: gainBinding,
        invert: invertBinding,
        label: labelBinding,
        mute: muteBinding,
        pan: panBinding,
        solo: soloBinding,
        trim: trimBinding,
        crosspoints: [] as any[],
        cueEnable: [] as any[],
        cueAfl: [] as any[]
      };
      this._inputBindings.push(inputBindingSet);

      // Build crosspoints for this input
      const crosspoints: MixerCrosspoint[] = [];
      this._crosspointBindings[i - 1] = [];
      for (let o = 1; o <= outputCount; o++) {
        const crosspointBinding = this.qrwc.bindControl(
          componentName, 
          `input.${i}.output.${o}.gain`, 
          -100
        );
        crosspoints.push({
          output: o,
          gain: crosspointBinding.value,
          gainPosition: crosspointBinding.position
        });
        inputBindingSet.crosspoints.push(crosspointBinding);
        this._crosspointBindings[i - 1].push(crosspointBinding);
      }

      // Build cue controls for this input
      const cueEnable: Signal<boolean>[] = [];
      const cueAfl: Signal<boolean>[] = [];
      for (let c = 1; c <= cueCount; c++) {
        const cueEnableBinding = this.qrwc.bindControl(
          componentName, 
          `input.${i}.cue.${c}.enable`, 
          false
        );
        const cueAflBinding = this.qrwc.bindControl(
          componentName, 
          `input.${i}.cue.${c}.afl`, 
          false
        );
        cueEnable.push(cueEnableBinding.bool);
        cueAfl.push(cueAflBinding.bool);
        inputBindingSet.cueEnable.push(cueEnableBinding);
        inputBindingSet.cueAfl.push(cueAflBinding);
      }

      // Create the complete input channel object
      this._inputChannels.push({
        id: i,
        gain: gainBinding.value,
        gainPosition: gainBinding.position,
        invert: invertBinding.bool,
        label: labelBinding.string,
        mute: muteBinding.bool,
        pan: panBinding.value,
        solo: soloBinding.bool,
        trim: trimBinding.value,
        crosspoints,
        cueEnable,
        cueAfl
      });
    }

    // Build output channels
    for (let o = 1; o <= outputCount; o++) {
      const gainBinding = this.qrwc.bindControl(componentName, `output.${o}.gain`, 0);
      const invertBinding = this.qrwc.bindControl(componentName, `output.${o}.invert`, false);
      const labelBinding = this.qrwc.bindControl(componentName, `output.${o}.label`, '');
      const muteBinding = this.qrwc.bindControl(componentName, `output.${o}.mute`, false);
      const prePostBinding = this.qrwc.bindControl(componentName, `output.${o}.pre.post`, false);

      // Store bindings for setter methods
      this._outputBindings.push({
        gain: gainBinding,
        invert: invertBinding,
        label: labelBinding,
        mute: muteBinding,
        prePost: prePostBinding
      });

      this._outputChannels.push({
        id: o,
        gain: gainBinding.value,
        gainPosition: gainBinding.position,
        invert: invertBinding.bool,
        label: labelBinding.string,
        mute: muteBinding.bool,
        prePost: prePostBinding.bool
      });
    }

    // Build cue buses
    for (let c = 1; c <= cueCount; c++) {
      const gainBinding = this.qrwc.bindControl(componentName, `cue.${c}.gain`, 0);
      const muteBinding = this.qrwc.bindControl(componentName, `cue.${c}.mute`, false);

      // Store bindings for setter methods
      this._cueBindings.push({
        gain: gainBinding,
        mute: muteBinding
      });

      this._cueBuses.push({
        id: c,
        gain: gainBinding.value,
        mute: muteBinding.bool
      });
    }
  }

  /**
   * Validates that the input number is within range
   */
  private validateInput(input: number): void {
    if (input < 1 || input > this.inputCount) {
      throw new Error(`Input ${input} out of range (1-${this.inputCount})`);
    }
  }

  /**
   * Validates that the output number is within range
   */
  private validateOutput(output: number): void {
    if (output < 1 || output > this.outputCount) {
      throw new Error(`Output ${output} out of range (1-${this.outputCount})`);
    }
  }

  /**
   * Validates that the cue number is within range
   */
  private validateCue(cue: number): void {
    if (cue < 1 || cue > this.cueCount) {
      throw new Error(`Cue ${cue} out of range (1-${this.cueCount})`);
    }
  }

  // ==================== Input Channel Setter Methods ====================

  /**
   * Set the gain for a specific input
   * @param input - Input number (1-based)
   * @param dB - The gain value in dB
   */
  setInputGain(input: number, dB: number): void {
    this.validateInput(input);
    this._inputBindings[input - 1].gain.setValue(dB);
  }

  /**
   * Set the gain position for a specific input
   * @param input - Input number (1-based)
   * @param position - The position value (0-1)
   */
  setInputGainPosition(input: number, position: number): void {
    this.validateInput(input);
    this._inputBindings[input - 1].gain.setPosition(position);
  }

  /**
   * Set the invert state for a specific input
   * @param input - Input number (1-based)
   * @param state - The invert state
   */
  setInputInvert(input: number, state: boolean): void {
    this.validateInput(input);
    this._inputBindings[input - 1].invert.setValue(state);
  }

  /**
   * Toggle the invert state for a specific input
   * @param input - Input number (1-based)
   */
  toggleInputInvert(input: number): void {
    this.validateInput(input);
    const channel = this._inputChannels[input - 1];
    this.setInputInvert(input, !channel.invert());
  }

  /**
   * Set the label for a specific input
   * @param input - Input number (1-based)
   * @param label - The label text
   */
  setInputLabel(input: number, label: string): void {
    this.validateInput(input);
    this._inputBindings[input - 1].label.setValue(label);
  }

  /**
   * Set the mute state for a specific input
   * @param input - Input number (1-based)
   * @param state - The mute state
   */
  setInputMute(input: number, state: boolean): void {
    this.validateInput(input);
    this._inputBindings[input - 1].mute.setValue(state);
  }

  /**
   * Toggle the mute state for a specific input
   * @param input - Input number (1-based)
   */
  toggleInputMute(input: number): void {
    this.validateInput(input);
    const channel = this._inputChannels[input - 1];
    this.setInputMute(input, !channel.mute());
  }

  /**
   * Set the pan position for a specific input
   * @param input - Input number (1-based)
   * @param position - The pan position (-1.0 to 1.0)
   */
  setInputPan(input: number, position: number): void {
    this.validateInput(input);
    this._inputBindings[input - 1].pan.setValue(position);
  }

  /**
   * Set the solo state for a specific input
   * @param input - Input number (1-based)
   * @param state - The solo state
   */
  setInputSolo(input: number, state: boolean): void {
    this.validateInput(input);
    this._inputBindings[input - 1].solo.setValue(state);
  }

  /**
   * Toggle the solo state for a specific input
   * @param input - Input number (1-based)
   */
  toggleInputSolo(input: number): void {
    this.validateInput(input);
    const channel = this._inputChannels[input - 1];
    this.setInputSolo(input, !channel.solo());
  }

  /**
   * Set the trim for a specific input
   * @param input - Input number (1-based)
   * @param dB - The trim value in dB
   */
  setInputTrim(input: number, dB: number): void {
    this.validateInput(input);
    this._inputBindings[input - 1].trim.setValue(dB);
  }

  // ==================== Output Channel Setter Methods ====================

  /**
   * Set the gain for a specific output
   * @param output - Output number (1-based)
   * @param dB - The gain value in dB
   */
  setOutputGain(output: number, dB: number): void {
    this.validateOutput(output);
    this._outputBindings[output - 1].gain.setValue(dB);
  }

  /**
   * Set the gain position for a specific output
   * @param output - Output number (1-based)
   * @param position - The position value (0-1)
   */
  setOutputGainPosition(output: number, position: number): void {
    this.validateOutput(output);
    this._outputBindings[output - 1].gain.setPosition(position);
  }

  /**
   * Set the invert state for a specific output
   * @param output - Output number (1-based)
   * @param state - The invert state
   */
  setOutputInvert(output: number, state: boolean): void {
    this.validateOutput(output);
    this._outputBindings[output - 1].invert.setValue(state);
  }

  /**
   * Toggle the invert state for a specific output
   * @param output - Output number (1-based)
   */
  toggleOutputInvert(output: number): void {
    this.validateOutput(output);
    const channel = this._outputChannels[output - 1];
    this.setOutputInvert(output, !channel.invert());
  }

  /**
   * Set the label for a specific output
   * @param output - Output number (1-based)
   * @param label - The label text
   */
  setOutputLabel(output: number, label: string): void {
    this.validateOutput(output);
    this._outputBindings[output - 1].label.setValue(label);
  }

  /**
   * Set the mute state for a specific output
   * @param output - Output number (1-based)
   * @param state - The mute state
   */
  setOutputMute(output: number, state: boolean): void {
    this.validateOutput(output);
    this._outputBindings[output - 1].mute.setValue(state);
  }

  /**
   * Toggle the mute state for a specific output
   * @param output - Output number (1-based)
   */
  toggleOutputMute(output: number): void {
    this.validateOutput(output);
    const channel = this._outputChannels[output - 1];
    this.setOutputMute(output, !channel.mute());
  }

  /**
   * Set the pre/post state for a specific output
   * @param output - Output number (1-based)
   * @param state - The pre/post state
   */
  setOutputPrePost(output: number, state: boolean): void {
    this.validateOutput(output);
    this._outputBindings[output - 1].prePost.setValue(state);
  }

  /**
   * Toggle the pre/post state for a specific output
   * @param output - Output number (1-based)
   */
  toggleOutputPrePost(output: number): void {
    this.validateOutput(output);
    const channel = this._outputChannels[output - 1];
    this.setOutputPrePost(output, !channel.prePost());
  }

  // ==================== Crosspoint Setter Methods ====================

  /**
   * Set the crosspoint gain between a specific input and output
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   * @param dB - The gain value in dB
   */
  setCrosspointGain(input: number, output: number, dB: number): void {
    this.validateInput(input);
    this.validateOutput(output);
    this._crosspointBindings[input - 1][output - 1].setValue(dB);
  }

  /**
   * Set the crosspoint gain position between a specific input and output
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   * @param position - The position value (0-1)
   */
  setCrosspointGainPosition(input: number, output: number, position: number): void {
    this.validateInput(input);
    this.validateOutput(output);
    this._crosspointBindings[input - 1][output - 1].setPosition(position);
  }

  // ==================== Cue Setter Methods ====================

  /**
   * Set the cue bus gain for a specific cue
   * @param cue - Cue number (1-based)
   * @param dB - The gain value in dB
   */
  setCueGain(cue: number, dB: number): void {
    this.validateCue(cue);
    this._cueBindings[cue - 1].gain.setValue(dB);
  }

  /**
   * Set the cue bus mute state for a specific cue
   * @param cue - Cue number (1-based)
   * @param state - The mute state
   */
  setCueMute(cue: number, state: boolean): void {
    this.validateCue(cue);
    this._cueBindings[cue - 1].mute.setValue(state);
  }

  /**
   * Toggle the cue bus mute state for a specific cue
   * @param cue - Cue number (1-based)
   */
  toggleCueMute(cue: number): void {
    this.validateCue(cue);
    const cue_bus = this._cueBuses[cue - 1];
    this.setCueMute(cue, !cue_bus.mute());
  }

  /**
   * Set the AFL (After Fader Listen) state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   * @param state - The AFL state
   */
  setInputCueAfl(input: number, cue: number, state: boolean): void {
    this.validateInput(input);
    this.validateCue(cue);
    this._inputBindings[input - 1].cueAfl[cue - 1].setValue(state);
  }

  /**
   * Toggle the AFL state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   */
  toggleInputCueAfl(input: number, cue: number): void {
    this.validateInput(input);
    this.validateCue(cue);
    const channel = this._inputChannels[input - 1];
    this.setInputCueAfl(input, cue, !channel.cueAfl[cue - 1]());
  }

  /**
   * Set the cue enable state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   * @param state - The cue enable state
   */
  setInputCueEnable(input: number, cue: number, state: boolean): void {
    this.validateInput(input);
    this.validateCue(cue);
    this._inputBindings[input - 1].cueEnable[cue - 1].setValue(state);
  }

  /**
   * Toggle the cue enable state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   */
  toggleInputCueEnable(input: number, cue: number): void {
    this.validateInput(input);
    this.validateCue(cue);
    const channel = this._inputChannels[input - 1];
    this.setInputCueEnable(input, cue, !channel.cueEnable[cue - 1]());
  }

  // ==================== Bulk Operations ====================

  /**
   * Mute all inputs
   */
  muteAllInputs(): void {
    for (let i = 1; i <= this.inputCount; i++) {
      this.setInputMute(i, true);
    }
  }

  /**
   * Unmute all inputs
   */
  unmuteAllInputs(): void {
    for (let i = 1; i <= this.inputCount; i++) {
      this.setInputMute(i, false);
    }
  }

  /**
   * Clear all input solos
   */
  clearAllSolos(): void {
    for (let i = 1; i <= this.inputCount; i++) {
      this.setInputSolo(i, false);
    }
  }

  /**
   * Mute all outputs
   */
  muteAllOutputs(): void {
    for (let o = 1; o <= this.outputCount; o++) {
      this.setOutputMute(o, true);
    }
  }

  /**
   * Unmute all outputs
   */
  unmuteAllOutputs(): void {
    for (let o = 1; o <= this.outputCount; o++) {
      this.setOutputMute(o, false);
    }
  }
}
