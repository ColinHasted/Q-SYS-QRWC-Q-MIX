import { Component, input, output, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';

@Component({
  selector: 'app-mixer-compressor',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-compressor.component.html',
  styleUrls: ['./mixer-compressor.component.scss']
})
export class MixerCompressorComponent implements AfterViewInit {
  @ViewChild('curveCanvas') curveCanvas!: ElementRef<HTMLCanvasElement>;

  on = input.required<boolean>();
  threshold = input.required<number>();
  ratio = input.required<number>();
  knee = input.required<number>();
  attack = input.required<number>();
  release = input.required<number>();
  depth = input.required<number>();
  makeup = input.required<number>();

  toggle = output<void>();
  thresholdChange = output<number>();
  ratioChange = output<number>();
  kneeChange = output<number>();
  attackChange = output<number>();
  releaseChange = output<number>();
  depthChange = output<number>();
  makeupChange = output<number>();

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
    this.toggle.emit();
  }

  protected onThresholdChange(value: number): void {
    this.thresholdChange.emit(value);
  }

  protected onRatioChange(value: number): void {
    this.ratioChange.emit(value);
  }

  protected onKneeChange(value: number): void {
    this.kneeChange.emit(value);
  }

  protected onAttackChange(value: number): void {
    this.attackChange.emit(value);
  }

  protected onReleaseChange(value: number): void {
    this.releaseChange.emit(value);
  }

  protected onDepthChange(value: number): void {
    this.depthChange.emit(value);
  }

  protected onMakeupChange(value: number): void {
    this.makeupChange.emit(value);
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
