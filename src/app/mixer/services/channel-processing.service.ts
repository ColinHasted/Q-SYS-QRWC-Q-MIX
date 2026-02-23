import { Injectable, Signal, computed, inject } from '@angular/core';
import { QrwcAngularService } from '../../../qrwc/qrwc-angular-service';
import { QrwcGateComponent } from '../../../qrwc/components/qrwc-gate-component';
import { QrwcCompressorComponent } from '../../../qrwc/components/qrwc-compressor-component';
import { QrwcParametricEqualizerComponent } from '../../../qrwc/components/qrwc-parametric-equalizer-component';
import { QrwcDelayComponent } from '../../../qrwc/components/qrwc-delay-component';
import { QrwcHighPassFilterComponent } from '../../../qrwc/components/qrwc-high-pass-filter-component';

/**
 * Service that manages QRWC component instances for all 16 channels
 * Each channel has Gate, Compressor, Parametric EQ, and Delay components
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelProcessingService {
  private readonly qrwc = inject(QrwcAngularService);
  
  private readonly CHANNEL_COUNT = 16;
  
  // Arrays to hold QRWC component instances for each channel
  private _gates: QrwcGateComponent[] = [];
  private _compressors: QrwcCompressorComponent[] = [];
  private _eqs: QrwcParametricEqualizerComponent[] = [];
  private _delays: QrwcDelayComponent[] = [];
  private _highPassFilters: QrwcHighPassFilterComponent[] = [];
  
  private _initialized = false;

  /**
   * Initialize all QRWC component instances for 16 channels
   * Should be called once when mixer is initialized
   */
  initialize(): void {
    if (this._initialized) {
      console.warn('ChannelProcessingService already initialized');
      return;
    }

    console.log('Initializing ChannelProcessingService for 16 channels...');

    // Create QRWC component instances for each channel (1-16)
    for (let i = 1; i <= this.CHANNEL_COUNT; i++) {
      // Gate_1, Gate_2, ... Gate_16
      this._gates.push(new QrwcGateComponent(`Gate_${i}`));
      
      // Compressor_1, Compressor_2, ... Compressor_16
      this._compressors.push(new QrwcCompressorComponent(`Compressor_${i}`));
      
      // ParametricEQ_1, ParametricEQ_2, ... ParametricEQ_16
      this._eqs.push(new QrwcParametricEqualizerComponent(`Parametric_Equalizer_${i}`));
      
      // Delay_1, Delay_2, ... Delay_16
      this._delays.push(new QrwcDelayComponent(`Standard_Delay_${i}`));
      
      // high-pass_filter_1, high-pass_filter_2, ... high-pass_filter_16
      this._highPassFilters.push(new QrwcHighPassFilterComponent(`high-pass_filter_${i}`));
    }

    this._initialized = true;
    console.log('ChannelProcessingService initialized successfully');
  }

  /**
   * Get the Gate component for a specific channel
   * @param channel - Channel number (1-16)
   */
  getGate(channel: number): QrwcGateComponent {
    this.validateChannel(channel);
    return this._gates[channel - 1];
  }

  /**
   * Get the Compressor component for a specific channel
   * @param channel - Channel number (1-16)
   */
  getCompressor(channel: number): QrwcCompressorComponent {
    this.validateChannel(channel);
    return this._compressors[channel - 1];
  }

  /**
   * Get the Parametric EQ component for a specific channel
   * @param channel - Channel number (1-16)
   */
  getEQ(channel: number): QrwcParametricEqualizerComponent {
    this.validateChannel(channel);
    return this._eqs[channel - 1];
  }

  /**
   * Get all gates (useful for batch operations or debugging)
   */
  getAllGates(): readonly QrwcGateComponent[] {
    return this._gates;
  }

  /**
   * Get all compressors (useful for batch operations or debugging)
   */
  getAllCompressors(): readonly QrwcCompressorComponent[] {
    return this._compressors;
  }

  /**
   * Get all EQs (useful for batch operations or debugging)
   */
  getAllEQs(): readonly QrwcParametricEqualizerComponent[] {
    return this._eqs;
  }

  /**
   * Get the Delay component for a specific channel
   * @param channel - Channel number (1-16)
   */
  getDelay(channel: number): QrwcDelayComponent {
    this.validateChannel(channel);
    return this._delays[channel - 1];
  }

  /**
   * Get all delays (useful for batch operations or debugging)
   */
  getAllDelays(): readonly QrwcDelayComponent[] {
    return this._delays;
  }

  /**
   * Get the High-Pass Filter component for a specific channel
   * @param channel - Channel number (1-16)
   */
  getHighPassFilter(channel: number): QrwcHighPassFilterComponent {
    this.validateChannel(channel);
    return this._highPassFilters[channel - 1];
  }

  /**
   * Get all high-pass filters (useful for batch operations or debugging)
   */
  getAllHighPassFilters(): readonly QrwcHighPassFilterComponent[] {
    return this._highPassFilters;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Validate channel number is within range
   */
  private validateChannel(channel: number): void {
    if (!this._initialized) {
      throw new Error('ChannelProcessingService not initialized. Call initialize() first.');
    }
    if (channel < 1 || channel > this.CHANNEL_COUNT) {
      throw new Error(`Invalid channel number: ${channel}. Must be between 1 and ${this.CHANNEL_COUNT}`);
    }
  }

  /**
   * Cleanup method (called when service is destroyed)
   */
  ngOnDestroy(): void {
    // QRWC components don't need explicit cleanup as bindings are managed by QrwcAngularService
    this._gates = [];
    this._compressors = [];
    this._eqs = [];
    this._delays = [];
    this._highPassFilters = [];
    this._initialized = false;
  }
}
