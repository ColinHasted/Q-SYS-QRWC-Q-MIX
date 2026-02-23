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

  // Input: which channel (1-16) this compressor UI is controlling
  channel = input.required<number>();

  // Computed: get the QRWC compressor component for the current channel
  private qrwcCompressor = computed<QrwcCompressorComponent>(() => {
    return this.channelProcessing.getCompressor(this.channel());
  });

  // Expose QRWC signals for template binding
  bypass = computed(() => this.qrwcCompressor().bypass());
  threshold = computed(() => this.qrwcCompressor().thresholdLevel());
  ratio = computed(() => this.qrwcCompressor().ratio());
  knee = computed(() => this.qrwcCompressor().softKnee());
  attack = computed(() => this.qrwcCompressor().attack());
  release = computed(() => this.qrwcCompressor().release());
  depth = computed(() => this.qrwcCompressor().depth());
  makeup = computed(() => this.qrwcCompressor().outputGain());
  appliedGain = computed(() => this.qrwcCompressor().appliedGain());

  constructor() {
    effect(() => {
      const _ = [this.threshold(), this.ratio()];
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
    comp.SetBypass(!comp.bypass());
  }

  protected onThresholdChange(value: number): void {
    this.qrwcCompressor().SetThresholdLevel(value);
  }

  protected onRatioChange(value: number): void {
    this.qrwcCompressor().setRatio(value);
  }

  protected onKneeChange(value: number): void {
    this.qrwcCompressor().SetSoftKnee(value);
  }

  protected onAttackChange(value: number): void {
    this.qrwcCompressor().SetAttack(value);
  }

  protected onReleaseChange(value: number): void {
    this.qrwcCompressor().SetRelease(value);
  }

  protected onDepthChange(value: number): void {
    this.qrwcCompressor().SetDepth(value);
  }

  protected onMakeupChange(value: number): void {
    this.qrwcCompressor().SetOutputGain(value);
  }

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
