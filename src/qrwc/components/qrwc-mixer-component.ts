import { inject, Signal } from '@angular/core';
import { QrwcAngularService } from '../qrwc-angular-service';

/**
 * Interface representing a single input channel's controls
 */
export interface MixerInputChannel {
  /** The input gain in dB (Float) */
  gain: Signal<number>;
  /** Whether the input polarity is inverted (Boolean) */
  invert: Signal<boolean>;
  /** The input channel label (String) */
  label: Signal<string>;
  /** Whether the input is muted (Boolean) */
  mute: Signal<boolean>;
  /** The pan position (-1.0 to 1.0, Float) */
  pan: Signal<number>;
  /** Whether the input is soloed (Boolean) */
  solo: Signal<boolean>;
  /** The input trim in dB (Float) */
  trim: Signal<number>;
}

/**
 * Interface representing a single output channel's controls
 */
export interface MixerOutputChannel {
  /** The output gain in dB (Float) */
  gain: Signal<number>;
  /** Whether the output polarity is inverted (Boolean) */
  invert: Signal<boolean>;
  /** The output channel label (String) */
  label: Signal<string>;
  /** Whether the output is muted (Boolean) */
  mute: Signal<boolean>;
  /** Whether the output is pre or post fader (Boolean) */
  prePost: Signal<boolean>;
}

/**
 * Interface representing a single cue bus's controls
 */
export interface MixerCueBus {
  /** The cue bus gain in dB (Float) */
  gain: Signal<number>;
  /** Whether the cue bus is muted (Boolean) */
  mute: Signal<boolean>;
}

export class QrwcMixerComponent {
  private readonly qrwc: QrwcAngularService = inject(QrwcAngularService);

  // Private bindings for input controls
  private readonly _inputGainBindings: any[] = [];
  private readonly _inputInvertBindings: any[] = [];
  private readonly _inputLabelBindings: any[] = [];
  private readonly _inputMuteBindings: any[] = [];
  private readonly _inputPanBindings: any[] = [];
  private readonly _inputSoloBindings: any[] = [];
  private readonly _inputTrimBindings: any[] = [];

  // Private bindings for output controls
  private readonly _outputGainBindings: any[] = [];
  private readonly _outputInvertBindings: any[] = [];
  private readonly _outputLabelBindings: any[] = [];
  private readonly _outputMuteBindings: any[] = [];
  private readonly _outputPrePostBindings: any[] = [];

  // Private bindings for cue controls
  private readonly _cueGainBindings: any[] = [];
  private readonly _cueMuteBindings: any[] = [];
  private readonly _inputCueAflBindings: any[][] = [];
  private readonly _inputCueEnableBindings: any[][] = [];

  // Private bindings for crosspoint gains (input -> output matrix)
  private readonly _crosspointGainBindings: any[][] = [];

  /**
   * Get the gain for a specific input
   * @param input - Input number (1-based)
   */
  getInputGain(input: number): Signal<number> {
    this.validateInput(input);
    return this._inputGainBindings[input - 1].value;
  }

  /**
   * Get the gain position for a specific input (0-1)
   * @param input - Input number (1-based)
   */
  getInputGainPosition(input: number): Signal<number> {
    this.validateInput(input);
    return this._inputGainBindings[input - 1].position;
  }

  /**
   * Get the invert state for a specific input
   * @param input - Input number (1-based)
   */
  getInputInvert(input: number): Signal<boolean> {
    this.validateInput(input);
    return this._inputInvertBindings[input - 1].bool;
  }

  /**
   * Get the label for a specific input
   * @param input - Input number (1-based)
   */
  getInputLabel(input: number): Signal<string> {
    this.validateInput(input);
    return this._inputLabelBindings[input - 1].string;
  }

  /**
   * Get the mute state for a specific input
   * @param input - Input number (1-based)
   */
  getInputMute(input: number): Signal<boolean> {
    this.validateInput(input);
    return this._inputMuteBindings[input - 1].bool;
  }

  /**
   * Get the pan position for a specific input
   * @param input - Input number (1-based)
   */
  getInputPan(input: number): Signal<number> {
    this.validateInput(input);
    return this._inputPanBindings[input - 1].value;
  }

  /**
   * Get the solo state for a specific input
   * @param input - Input number (1-based)
   */
  getInputSolo(input: number): Signal<boolean> {
    this.validateInput(input);
    return this._inputSoloBindings[input - 1].bool;
  }

  /**
   * Get the trim for a specific input
   * @param input - Input number (1-based)
   */
  getInputTrim(input: number): Signal<number> {
    this.validateInput(input);
    return this._inputTrimBindings[input - 1].value;
  }

  /**
   * Get all controls for a specific input
   * @param input - Input number (1-based)
   */
  getInput(input: number): MixerInputChannel {
    this.validateInput(input);
    const idx = input - 1;
    return {
      gain: this._inputGainBindings[idx].value,
      invert: this._inputInvertBindings[idx].bool,
      label: this._inputLabelBindings[idx].string,
      mute: this._inputMuteBindings[idx].bool,
      pan: this._inputPanBindings[idx].value,
      solo: this._inputSoloBindings[idx].bool,
      trim: this._inputTrimBindings[idx].value,
    };
  }

  /**
   * Get the gain for a specific output
   * @param output - Output number (1-based)
   */
  getOutputGain(output: number): Signal<number> {
    this.validateOutput(output);
    return this._outputGainBindings[output - 1].value;
  }

  /**
   * Get the gain position for a specific output (0-1)
   * @param output - Output number (1-based)
   */
  getOutputGainPosition(output: number): Signal<number> {
    this.validateOutput(output);
    return this._outputGainBindings[output - 1].position;
  }

  /**
   * Get the invert state for a specific output
   * @param output - Output number (1-based)
   */
  getOutputInvert(output: number): Signal<boolean> {
    this.validateOutput(output);
    return this._outputInvertBindings[output - 1].bool;
  }

  /**
   * Get the label for a specific output
   * @param output - Output number (1-based)
   */
  getOutputLabel(output: number): Signal<string> {
    this.validateOutput(output);
    return this._outputLabelBindings[output - 1].string;
  }

  /**
   * Get the mute state for a specific output
   * @param output - Output number (1-based)
   */
  getOutputMute(output: number): Signal<boolean> {
    this.validateOutput(output);
    return this._outputMuteBindings[output - 1].bool;
  }

  /**
   * Get the pre/post state for a specific output
   * @param output - Output number (1-based)
   */
  getOutputPrePost(output: number): Signal<boolean> {
    this.validateOutput(output);
    return this._outputPrePostBindings[output - 1].bool;
  }

  /**
   * Get all controls for a specific output
   * @param output - Output number (1-based)
   */
  getOutput(output: number): MixerOutputChannel {
    this.validateOutput(output);
    const idx = output - 1;
    return {
      gain: this._outputGainBindings[idx].value,
      invert: this._outputInvertBindings[idx].bool,
      label: this._outputLabelBindings[idx].string,
      mute: this._outputMuteBindings[idx].bool,
      prePost: this._outputPrePostBindings[idx].bool,
    };
  }

  /**
   * Get the crosspoint gain between a specific input and output
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   */
  getCrosspointGain(input: number, output: number): Signal<number> {
    this.validateInput(input);
    this.validateOutput(output);
    return this._crosspointGainBindings[input - 1][output - 1].value;
  }

  /**
   * Get the crosspoint gain position between a specific input and output (0-1)
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   */
  getCrosspointGainPosition(input: number, output: number): Signal<number> {
    this.validateInput(input);
    this.validateOutput(output);
    return this._crosspointGainBindings[input - 1][output - 1].position;
  }

  /**
   * Get the crosspoint gain display string between a specific input and output
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   */
  getCrosspointGainString(input: number, output: number): Signal<string> {
    this.validateInput(input);
    this.validateOutput(output);
    return this._crosspointGainBindings[input - 1][output - 1].string;
  }

  /**
   * Get the cue bus gain for a specific cue
   * @param cue - Cue number (1-based)
   */
  getCueGain(cue: number): Signal<number> {
    this.validateCue(cue);
    return this._cueGainBindings[cue - 1].value;
  }

  /**
   * Get the cue bus mute state for a specific cue
   * @param cue - Cue number (1-based)
   */
  getCueMute(cue: number): Signal<boolean> {
    this.validateCue(cue);
    return this._cueMuteBindings[cue - 1].bool;
  }

  /**
   * Get all controls for a specific cue bus
   * @param cue - Cue number (1-based)
   */
  getCue(cue: number): MixerCueBus {
    this.validateCue(cue);
    const idx = cue - 1;
    return {
      gain: this._cueGainBindings[idx].value,
      mute: this._cueMuteBindings[idx].bool,
    };
  }

  /**
   * Get the AFL (After Fader Listen) state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   */
  getInputCueAfl(input: number, cue: number): Signal<boolean> {
    this.validateInput(input);
    this.validateCue(cue);
    return this._inputCueAflBindings[input - 1][cue - 1].bool;
  }

  /**
   * Get the cue enable state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   */
  getInputCueEnable(input: number, cue: number): Signal<boolean> {
    this.validateInput(input);
    this.validateCue(cue);
    return this._inputCueEnableBindings[input - 1][cue - 1].bool;
  }

  /**
   * Get all input gains as an array of signals
   */
  get inputGains(): Signal<number>[] {
    return this._inputGainBindings.map(b => b.value);
  }

  /**
   * Get all input mutes as an array of signals
   */
  get inputMutes(): Signal<boolean>[] {
    return this._inputMuteBindings.map(b => b.bool);
  }

  /**
   * Get all input solos as an array of signals
   */
  get inputSolos(): Signal<boolean>[] {
    return this._inputSoloBindings.map(b => b.bool);
  }

  /**
   * Get all output gains as an array of signals
   */
  get outputGains(): Signal<number>[] {
    return this._outputGainBindings.map(b => b.value);
  }

  /**
   * Get all output mutes as an array of signals
   */
  get outputMutes(): Signal<boolean>[] {
    return this._outputMuteBindings.map(b => b.bool);
  }

  /**
   * Mixer Component
   * @param componentName - The name of the Mixer Component.
   * @param inputCount - The number of inputs (default 17).
   * @param outputCount - The number of outputs (default 5).
   * @param cueCount - The number of cue buses (default 1).
   */
  constructor(
    private componentName: string,
    private inputCount: number = 17,
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

    // Bind input controls
    for (let i = 1; i <= inputCount; i++) {
      this._inputGainBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.gain`, 0)
      );
      this._inputInvertBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.invert`, false)
      );
      this._inputLabelBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.label`, '')
      );
      this._inputMuteBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.mute`, false)
      );
      this._inputPanBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.pan`, 0)
      );
      this._inputSoloBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.solo`, false)
      );
      this._inputTrimBindings.push(
        this.qrwc.bindControl(componentName, `input.${i}.trim`, 0)
      );

      // Initialize crosspoint gain array for this input
      this._crosspointGainBindings[i - 1] = [];
      for (let o = 1; o <= outputCount; o++) {
        this._crosspointGainBindings[i - 1].push(
          this.qrwc.bindControl(componentName, `input.${i}.output.${o}.gain`, -100)
        );
      }

      // Initialize cue bindings for this input
      this._inputCueAflBindings[i - 1] = [];
      this._inputCueEnableBindings[i - 1] = [];
      for (let c = 1; c <= cueCount; c++) {
        this._inputCueAflBindings[i - 1].push(
          this.qrwc.bindControl(componentName, `input.${i}.cue.${c}.afl`, false)
        );
        this._inputCueEnableBindings[i - 1].push(
          this.qrwc.bindControl(componentName, `input.${i}.cue.${c}.enable`, false)
        );
      }
    }

    // Bind output controls
    for (let o = 1; o <= outputCount; o++) {
      this._outputGainBindings.push(
        this.qrwc.bindControl(componentName, `output.${o}.gain`, 0)
      );
      this._outputInvertBindings.push(
        this.qrwc.bindControl(componentName, `output.${o}.invert`, false)
      );
      this._outputLabelBindings.push(
        this.qrwc.bindControl(componentName, `output.${o}.label`, '')
      );
      this._outputMuteBindings.push(
        this.qrwc.bindControl(componentName, `output.${o}.mute`, false)
      );
      this._outputPrePostBindings.push(
        this.qrwc.bindControl(componentName, `output.${o}.pre.post`, false)
      );
    }

    // Bind cue controls
    for (let c = 1; c <= cueCount; c++) {
      this._cueGainBindings.push(
        this.qrwc.bindControl(componentName, `cue.${c}.gain`, 0)
      );
      this._cueMuteBindings.push(
        this.qrwc.bindControl(componentName, `cue.${c}.mute`, false)
      );
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

  // ==================== Input Setter Methods ====================

  /**
   * Set the gain for a specific input
   * @param input - Input number (1-based)
   * @param dB - The gain value in dB
   */
  SetInputGain(input: number, dB: number): void {
    this.validateInput(input);
    this._inputGainBindings[input - 1].setValue(dB);
  }

  /**
   * Set the gain position for a specific input
   * @param input - Input number (1-based)
   * @param position - The position value (0-1)
   */
  SetInputGainPosition(input: number, position: number): void {
    this.validateInput(input);
    this._inputGainBindings[input - 1].setPosition(position);
  }

  /**
   * Set the invert state for a specific input
   * @param input - Input number (1-based)
   * @param state - The invert state
   */
  SetInputInvert(input: number, state: boolean): void {
    this.validateInput(input);
    this._inputInvertBindings[input - 1].setValue(state);
  }

  /**
   * Toggle the invert state for a specific input
   * @param input - Input number (1-based)
   */
  ToggleInputInvert(input: number): void {
    this.validateInput(input);
    const binding = this._inputInvertBindings[input - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the label for a specific input
   * @param input - Input number (1-based)
   * @param label - The label text
   */
  SetInputLabel(input: number, label: string): void {
    this.validateInput(input);
    this._inputLabelBindings[input - 1].setValue(label);
  }

  /**
   * Set the mute state for a specific input
   * @param input - Input number (1-based)
   * @param state - The mute state
   */
  SetInputMute(input: number, state: boolean): void {
    this.validateInput(input);
    this._inputMuteBindings[input - 1].setValue(state);
  }

  /**
   * Toggle the mute state for a specific input
   * @param input - Input number (1-based)
   */
  ToggleInputMute(input: number): void {
    this.validateInput(input);
    const binding = this._inputMuteBindings[input - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the pan position for a specific input
   * @param input - Input number (1-based)
   * @param position - The pan position (-1.0 to 1.0)
   */
  SetInputPan(input: number, position: number): void {
    this.validateInput(input);
    this._inputPanBindings[input - 1].setValue(position);
  }

  /**
   * Set the solo state for a specific input
   * @param input - Input number (1-based)
   * @param state - The solo state
   */
  SetInputSolo(input: number, state: boolean): void {
    this.validateInput(input);
    this._inputSoloBindings[input - 1].setValue(state);
  }

  /**
   * Toggle the solo state for a specific input
   * @param input - Input number (1-based)
   */
  ToggleInputSolo(input: number): void {
    this.validateInput(input);
    const binding = this._inputSoloBindings[input - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the trim for a specific input
   * @param input - Input number (1-based)
   * @param dB - The trim value in dB
   */
  SetInputTrim(input: number, dB: number): void {
    this.validateInput(input);
    this._inputTrimBindings[input - 1].setValue(dB);
  }

  // ==================== Output Setter Methods ====================

  /**
   * Set the gain for a specific output
   * @param output - Output number (1-based)
   * @param dB - The gain value in dB
   */
  SetOutputGain(output: number, dB: number): void {
    this.validateOutput(output);
    this._outputGainBindings[output - 1].setValue(dB);
  }

  /**
   * Set the gain position for a specific output
   * @param output - Output number (1-based)
   * @param position - The position value (0-1)
   */
  SetOutputGainPosition(output: number, position: number): void {
    this.validateOutput(output);
    this._outputGainBindings[output - 1].setPosition(position);
  }

  /**
   * Set the invert state for a specific output
   * @param output - Output number (1-based)
   * @param state - The invert state
   */
  SetOutputInvert(output: number, state: boolean): void {
    this.validateOutput(output);
    this._outputInvertBindings[output - 1].setValue(state);
  }

  /**
   * Toggle the invert state for a specific output
   * @param output - Output number (1-based)
   */
  ToggleOutputInvert(output: number): void {
    this.validateOutput(output);
    const binding = this._outputInvertBindings[output - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the label for a specific output
   * @param output - Output number (1-based)
   * @param label - The label text
   */
  SetOutputLabel(output: number, label: string): void {
    this.validateOutput(output);
    this._outputLabelBindings[output - 1].setValue(label);
  }

  /**
   * Set the mute state for a specific output
   * @param output - Output number (1-based)
   * @param state - The mute state
   */
  SetOutputMute(output: number, state: boolean): void {
    this.validateOutput(output);
    this._outputMuteBindings[output - 1].setValue(state);
  }

  /**
   * Toggle the mute state for a specific output
   * @param output - Output number (1-based)
   */
  ToggleOutputMute(output: number): void {
    this.validateOutput(output);
    const binding = this._outputMuteBindings[output - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the pre/post state for a specific output
   * @param output - Output number (1-based)
   * @param state - The pre/post state
   */
  SetOutputPrePost(output: number, state: boolean): void {
    this.validateOutput(output);
    this._outputPrePostBindings[output - 1].setValue(state);
  }

  /**
   * Toggle the pre/post state for a specific output
   * @param output - Output number (1-based)
   */
  ToggleOutputPrePost(output: number): void {
    this.validateOutput(output);
    const binding = this._outputPrePostBindings[output - 1];
    binding.setValue(!binding());
  }

  // ==================== Crosspoint Setter Methods ====================

  /**
   * Set the crosspoint gain between a specific input and output
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   * @param dB - The gain value in dB
   */
  SetCrosspointGain(input: number, output: number, dB: number): void {
    this.validateInput(input);
    this.validateOutput(output);
    this._crosspointGainBindings[input - 1][output - 1].setValue(dB);
  }

  /**
   * Set the crosspoint gain position between a specific input and output
   * @param input - Input number (1-based)
   * @param output - Output number (1-based)
   * @param position - The position value (0-1)
   */
  SetCrosspointGainPosition(input: number, output: number, position: number): void {
    this.validateInput(input);
    this.validateOutput(output);
    this._crosspointGainBindings[input - 1][output - 1].setPosition(position);
  }

  // ==================== Cue Setter Methods ====================

  /**
   * Set the cue bus gain for a specific cue
   * @param cue - Cue number (1-based)
   * @param dB - The gain value in dB
   */
  SetCueGain(cue: number, dB: number): void {
    this.validateCue(cue);
    this._cueGainBindings[cue - 1].setValue(dB);
  }

  /**
   * Set the cue bus mute state for a specific cue
   * @param cue - Cue number (1-based)
   * @param state - The mute state
   */
  SetCueMute(cue: number, state: boolean): void {
    this.validateCue(cue);
    this._cueMuteBindings[cue - 1].setValue(state);
  }

  /**
   * Toggle the cue bus mute state for a specific cue
   * @param cue - Cue number (1-based)
   */
  ToggleCueMute(cue: number): void {
    this.validateCue(cue);
    const binding = this._cueMuteBindings[cue - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the AFL (After Fader Listen) state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   * @param state - The AFL state
   */
  SetInputCueAfl(input: number, cue: number, state: boolean): void {
    this.validateInput(input);
    this.validateCue(cue);
    this._inputCueAflBindings[input - 1][cue - 1].setValue(state);
  }

  /**
   * Toggle the AFL state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   */
  ToggleInputCueAfl(input: number, cue: number): void {
    this.validateInput(input);
    this.validateCue(cue);
    const binding = this._inputCueAflBindings[input - 1][cue - 1];
    binding.setValue(!binding());
  }

  /**
   * Set the cue enable state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   * @param state - The cue enable state
   */
  SetInputCueEnable(input: number, cue: number, state: boolean): void {
    this.validateInput(input);
    this.validateCue(cue);
    this._inputCueEnableBindings[input - 1][cue - 1].setValue(state);
  }

  /**
   * Toggle the cue enable state for a specific input on a specific cue
   * @param input - Input number (1-based)
   * @param cue - Cue number (1-based)
   */
  ToggleInputCueEnable(input: number, cue: number): void {
    this.validateInput(input);
    this.validateCue(cue);
    const binding = this._inputCueEnableBindings[input - 1][cue - 1];
    binding.setValue(!binding());
  }

  // ==================== Bulk Operations ====================

  /**
   * Mute all inputs
   */
  MuteAllInputs(): void {
    for (let i = 0; i < this.inputCount; i++) {
      this._inputMuteBindings[i].setValue(true);
    }
  }

  /**
   * Unmute all inputs
   */
  UnmuteAllInputs(): void {
    for (let i = 0; i < this.inputCount; i++) {
      this._inputMuteBindings[i].setValue(false);
    }
  }

  /**
   * Clear all input solos
   */
  ClearAllSolos(): void {
    for (let i = 0; i < this.inputCount; i++) {
      this._inputSoloBindings[i].setValue(false);
    }
  }

  /**
   * Mute all outputs
   */
  MuteAllOutputs(): void {
    for (let o = 0; o < this.outputCount; o++) {
      this._outputMuteBindings[o].setValue(true);
    }
  }

  /**
   * Unmute all outputs
   */
  UnmuteAllOutputs(): void {
    for (let o = 0; o < this.outputCount; o++) {
      this._outputMuteBindings[o].setValue(false);
    }
  }
}
