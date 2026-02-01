import { Component, input, output, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-gate',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-gate.component.html',
  styleUrls: ['./mixer-gate.component.scss']
})
export class MixerGateComponent implements AfterViewInit {
  @ViewChild('curveCanvas') curveCanvas!: ElementRef<HTMLCanvasElement>;

  on = input.required<boolean>();
  threshold = input.required<number>();
  attack = input.required<number>();
  hold = input.required<number>();
  release = input.required<number>();
  range = input.required<number>();

  toggle = output<void>();
  thresholdChange = output<number>();
  attackChange = output<number>();
  holdChange = output<number>();
  releaseChange = output<number>();
  rangeChange = output<number>();

  constructor() {
    effect(() => {
      const _ = [this.threshold(), this.range()];
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

  protected onAttackChange(value: number): void {
    this.attackChange.emit(value);
  }

  protected onHoldChange(value: number): void {
    this.holdChange.emit(value);
  }

  protected onReleaseChange(value: number): void {
    this.releaseChange.emit(value);
  }

  protected onRangeChange(value: number): void {
    this.rangeChange.emit(value);
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
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw gate curve
    const thresholdNorm = (this.threshold() + 80) / 80; // -80 to 0 -> 0 to 1
    const rangeNorm = Math.abs(this.range()) / 80; // 0 to -80 -> 0 to 1

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Below threshold - reduced by range
    const threshX = thresholdNorm * width;
    const rangeY = height - (rangeNorm * height * 0.8);

    ctx.moveTo(0, rangeY);
    ctx.lineTo(threshX * 0.8, rangeY);

    // Transition zone
    ctx.lineTo(threshX, height * 0.1);

    // Above threshold - unity
    ctx.lineTo(width, height * 0.1);

    ctx.stroke();
  }
}
