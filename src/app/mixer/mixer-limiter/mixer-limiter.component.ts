import { Component, input, output, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-limiter',
  standalone: true,
  imports: [RotaryKnobComponent],
  templateUrl: './mixer-limiter.component.html',
  styleUrls: ['./mixer-limiter.component.scss']
})
export class MixerLimiterComponent implements AfterViewInit {
  @ViewChild('curveCanvas') curveCanvas!: ElementRef<HTMLCanvasElement>;

  on = input.required<boolean>();
  threshold = input.required<number>();
  attack = input.required<number>();
  release = input.required<number>();
  ceiling = input.required<number>();

  toggle = output<void>();
  thresholdChange = output<number>();
  attackChange = output<number>();
  releaseChange = output<number>();
  ceilingChange = output<number>();

  constructor() {
    effect(() => {
      const _ = [this.threshold(), this.ceiling()];
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

  protected onReleaseChange(value: number): void {
    this.releaseChange.emit(value);
  }

  protected onCeilingChange(value: number): void {
    this.ceilingChange.emit(value);
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
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.1)';
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
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    
    // Draw limiter curve (brick wall)
    const thresholdNorm = (this.threshold() + 20) / 20; // -20 to 0 -> 0 to 1
    const ceilingNorm = (this.ceiling() + 20) / 20;
    
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const threshX = thresholdNorm * width;
    const threshY = height - (thresholdNorm * height);
    const ceilingY = height - (ceilingNorm * height);
    
    // Below threshold - unity (1:1)
    ctx.moveTo(0, height);
    ctx.lineTo(threshX, threshY);
    
    // Above threshold - brick wall (horizontal line at ceiling)
    ctx.lineTo(width, ceilingY);
    
    ctx.stroke();
  }
}
