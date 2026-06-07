import { Injectable, inject } from '@angular/core';
import { QrwcGateComponent } from '../../../qrwc/components/qrwc-gate-component';
import { QrwcCompressorComponent } from '../../../qrwc/components/qrwc-compressor-component';
import { QrwcParametricEqualizerComponent } from '../../../qrwc/components/qrwc-parametric-equalizer-component';
import { QrwcDelayComponent } from '../../../qrwc/components/qrwc-delay-component';
import { QrwcHighPassFilterComponent } from '../../../qrwc/components/qrwc-high-pass-filter-component';
import { QrwcMicLineInputComponent } from '../../../qrwc/components/qrwc-mic-line-input-component';
import { QrwcLineOutputComponent } from '../../../qrwc/components/qrwc-line-output-component';
import { MIXER_PROFILE, MixerProfile, formatComponentName } from '../mixer-profile';

/**
 * Service that manages QRWC component instances for every input channel.
 * Channel counts, processor name templates and mic-input layout come from
 * the injected {@link MixerProfile}, so the same service supports multiple
 * surface variants.
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelProcessingService {
  private readonly profile: MixerProfile = inject(MIXER_PROFILE);

  // Per-channel processor arrays (index 0 → channel 1).
  private _gates: QrwcGateComponent[] = [];
  private _compressors: QrwcCompressorComponent[] = [];
  private _eqs: QrwcParametricEqualizerComponent[] = [];
  private _delays: QrwcDelayComponent[] = [];
  private _highPassFilters: QrwcHighPassFilterComponent[] = [];
  // Mic/Line Input blocks (index 0 → block 1).
  private _micInputs: QrwcMicLineInputComponent[] = [];
  // Line Output block for output VU metering.
  private _lineOut: QrwcLineOutputComponent | null = null;

  private _initialized = false;

  /** Active mixer profile (read-only accessor). */
  get mixerProfile(): MixerProfile {
    return this.profile;
  }

  /**
   * Create all per-channel QRWC component instances.
   * Idempotent — safe to call multiple times.
   */
  initialize(): void {
    if (this._initialized) {
      console.warn('ChannelProcessingService already initialized');
      return;
    }

    const { processorNameTemplates: tpl, micInput, channelCount } = this.profile;

    this._lineOut = new QrwcLineOutputComponent(this.profile.lineOutComponentName, 8);

    for (let block = 1; block <= micInput.blockCount; block++) {
      this._micInputs.push(
        new QrwcMicLineInputComponent(
          formatComponentName(micInput.componentNameTemplate, block),
          micInput.channelsPerBlock
        )
      );
    }

    for (let i = 1; i <= channelCount; i++) {
      this._gates.push(new QrwcGateComponent(formatComponentName(tpl.gate, i)));
      this._compressors.push(new QrwcCompressorComponent(formatComponentName(tpl.compressor, i)));
      this._eqs.push(new QrwcParametricEqualizerComponent(formatComponentName(tpl.parametricEq, i), this.profile.eqBandCount));
      this._delays.push(new QrwcDelayComponent(formatComponentName(tpl.delay, i)));
      this._highPassFilters.push(new QrwcHighPassFilterComponent(formatComponentName(tpl.highPassFilter, i)));
    }

    this._initialized = true;
  }

  /**
   * Resolve a global channel number to its Mic/Line Input block and local
   * channel in one call. Components should use this instead of calling
   * getMicInputBlock + getLocalMicChannel separately.
   */
  getMicInput(channel: number): { block: QrwcMicLineInputComponent; localCh: number } {
    this.validateChannel(channel);
    const blockIndex = Math.floor((channel - 1) / this.profile.micInput.channelsPerBlock);
    const localCh    = ((channel - 1) % this.profile.micInput.channelsPerBlock) + 1;
    return { block: this._micInputs[blockIndex], localCh };
  }

  /** @deprecated Use getMicInput() */
  getMicInputBlock(channel: number): QrwcMicLineInputComponent {
    return this.getMicInput(channel).block;
  }

  /** @deprecated Use getMicInput() */
  getLocalMicChannel(channel: number): number {
    return this.getMicInput(channel).localCh;
  }

  getGate(channel: number): QrwcGateComponent {
    this.validateChannel(channel);
    return this._gates[channel - 1];
  }

  getCompressor(channel: number): QrwcCompressorComponent {
    this.validateChannel(channel);
    return this._compressors[channel - 1];
  }

  getEQ(channel: number): QrwcParametricEqualizerComponent {
    this.validateChannel(channel);
    return this._eqs[channel - 1];
  }

  getDelay(channel: number): QrwcDelayComponent {
    this.validateChannel(channel);
    return this._delays[channel - 1];
  }

  getHighPassFilter(channel: number): QrwcHighPassFilterComponent {
    this.validateChannel(channel);
    return this._highPassFilters[channel - 1];
  }

  getAllGates(): readonly QrwcGateComponent[] { return this._gates; }
  getAllCompressors(): readonly QrwcCompressorComponent[] { return this._compressors; }
  getAllEQs(): readonly QrwcParametricEqualizerComponent[] { return this._eqs; }
  getAllDelays(): readonly QrwcDelayComponent[] { return this._delays; }
  getAllHighPassFilters(): readonly QrwcHighPassFilterComponent[] { return this._highPassFilters; }

  /** The Line Output block used for output VU metering. */
  get lineOut(): QrwcLineOutputComponent {
    if (!this._lineOut) {
      throw new Error('ChannelProcessingService not initialized. Call initialize() first.');
    }
    return this._lineOut;
  }

  isInitialized(): boolean {
    return this._initialized;
  }

  private validateChannel(channel: number): void {
    if (!this._initialized) {
      throw new Error('ChannelProcessingService not initialized. Call initialize() first.');
    }
    if (channel < 1 || channel > this.profile.channelCount) {
      throw new Error(`Invalid channel number: ${channel}. Must be between 1 and ${this.profile.channelCount}`);
    }
  }

  ngOnDestroy(): void {
    this._gates = [];
    this._compressors = [];
    this._eqs = [];
    this._delays = [];
    this._highPassFilters = [];
    this._micInputs = [];
    this._initialized = false;
  }
}
