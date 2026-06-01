import { Component, input, output, ViewChild, ElementRef, AfterViewInit, effect, computed, inject } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { ChannelProcessingService } from '../services/channel-processing.service';
import { QrwcCompressorComponent } from '../../../qrwc/components/qrwc-compressor-component';

@Component({
  selector: 'app-mixer-compressor',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-compressor.component.html',
  styleUrls: ['./mixer-compressor.component.scss']
})
export class MixerCompressorComponent implements AfterViewInit {
  @ViewChild('curveCanvas') curveCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly channelProcessing = inject(ChannelProcessingService);

  // Input: which channel this compressor UI is controlling (null = no selection).
  channel = input<number | null>(null);

  protected disabled = computed(() => this.channel() == null);

  // Computed: get the QRWC compressor component for the current channel (or null).
  private qrwcCompressor = computed<QrwcCompressorComponent | null>(() => {
    const ch = this.channel();
    return ch == null ? null : this.channelProcessing.getCompressor(ch);
  });

  // Expose QRWC signals for template binding with safe defaults.
  bypass       = computed(() => this.qrwcCompressor()?.bypass() ?? true);
  thresholdPos = computed(() => this.qrwcCompressor()?.thresholdLevelPosition() ?? 0);
  thresholdStr = computed(() => this.qrwcCompressor()?.thresholdLevelString() ?? '');
  ratioPos     = computed(() => this.qrwcCompressor()?.ratioPosition() ?? 0);
  ratioStr     = computed(() => this.qrwcCompressor()?.ratioString() ?? '');
  kneePos      = computed(() => this.qrwcCompressor()?.softKneePosition() ?? 0);
  kneeStr      = computed(() => this.qrwcCompressor()?.softKneeString() ?? '');
  attackPos    = computed(() => this.qrwcCompressor()?.attackPosition() ?? 0);
  attackStr    = computed(() => this.qrwcCompressor()?.attackString() ?? '');
  releasePos   = computed(() => this.qrwcCompressor()?.releasePosition() ?? 0);
  releaseStr   = computed(() => this.qrwcCompressor()?.releaseString() ?? '');
  depthPos     = computed(() => this.qrwcCompressor()?.depthPosition() ?? 0);
  depthStr     = computed(() => this.qrwcCompressor()?.depthString() ?? '');
  makeupPos    = computed(() => this.qrwcCompressor()?.outputGainPosition() ?? 0);
  makeupStr    = computed(() => this.qrwcCompressor()?.outputGainString() ?? '');
  appliedGain  = computed(() => this.qrwcCompressor()?.appliedGain() ?? 0);

  // Keep value signals for the curve canvas
  threshold    = computed(() => this.qrwcCompressor()?.thresholdLevel() ?? -20);
  ratio        = computed(() => this.qrwcCompressor()?.ratio() ?? 1);

  constructor() {
    effect(() => {
      const _ = [this.threshold(), this.ratio(), this.disabled()];
      if (this.curveCanvas) {
        this.drawCurve();
      }
    });
  }

  ngAfterViewInit(): void {
    this.drawCurve();
  }

  protected onToggle(): void {
    const comp = this.qrwcCompressor();
    if (comp) comp.SetBypass(!comp.bypass());
  }

  protected onThresholdChange(position: number): void { this.qrwcCompressor()?.SetThresholdLevelPosition(position); }
  protected onRatioChange(position: number): void     { this.qrwcCompressor()?.setRatioPosition(position); }
  protected onKneeChange(position: number): void      { this.qrwcCompressor()?.SetSoftKneePosition(position); }
  protected onAttackChange(position: number): void    { this.qrwcCompressor()?.SetAttackPosition(position); }
  protected onReleaseChange(position: number): void   { this.qrwcCompressor()?.SetReleasePosition(position); }
  protected onDepthChange(position: number): void     { this.qrwcCompressor()?.SetDepthPosition(position); }
  protected onMakeupChange(position: number): void    { this.qrwcCompressor()?.SetOutputGainPosition(position); }

  private drawCurve(): void {
    if (!this.curveCanvas?.nativeElement) return;

    const canvas = this.curveCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const pos = (i / 4) * width;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, height);
      ctx.moveTo(0, pos);
      ctx.lineTo(width, pos);
      ctx.stroke();
    }

    // Draw unity line (diagonal)
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();

    if (this.disabled()) return;

    // Draw compressor curve
    const thresholdNorm = (this.threshold() + 60) / 60; // -60 to 0 -> 0 to 1
    const ratio = this.ratio();

    ctx.strokeStyle = '#ff8844';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const threshX = thresholdNorm * width;
    const threshY = height - (thresholdNorm * height);

    // Below threshold - unity (1:1)
    ctx.moveTo(0, height);
    ctx.lineTo(threshX, threshY);

    // Above threshold - compressed
    const endX = width;
    const remainingInput = 1 - thresholdNorm;
    const compressedOutput = remainingInput / ratio;
    const endY = threshY - (compressedOutput * height);

    ctx.lineTo(endX, Math.max(0, endY));
    ctx.stroke();
  }
}
