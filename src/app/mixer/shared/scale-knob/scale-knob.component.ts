import { Component, input, output, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scale-knob',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scale-knob.component.html',
  styleUrls: ['./scale-knob.component.scss']
})
export class ScaleKnobComponent implements OnDestroy {
  @ViewChild('knobElement') knobElement!: ElementRef<HTMLElement>;

  value = input<number>(0);
  min = input<number>(-60);
  max = input<number>(10);
  step = input<number>(0.5);
  size = input<'small' | 'normal' | 'large'>('normal');
  label = input<string>('');

  /** Optional 0-1 position from the processor. When provided, drives the knob
   *  position directly and emits positionChange instead of valueChange on drag. */
  position = input<number | undefined>(undefined);

  valueChange = output<number>();
  positionChange = output<number>();

  private isDragging = false;
  private startY = 0;
  private startValue = 0;
  private startPosition = 0;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  // Number of ridges/indents around the knob
  readonly ridgeCount = 32;
  ridgeIndices = Array.from({ length: this.ridgeCount }, (_, i) => i);

  // Scale marks: -∞, -40, -20, -10, 0, +10
  // Maps to angles around the 270° arc (135° to 405°/45°)
  readonly scaleMarks = [
    { value: -60, label: '∞', angle: 135 },    // Start (bottom-left)
    { value: -40, label: '40', angle: 163 },   // ~20%
    { value: -20, label: '20', angle: 201 },   // ~44%
    { value: -10, label: '10', angle: 239 },   // ~71%
    { value: 0, label: '0', angle: 277 },      // ~86% (around 30° from top going CW)
    { value: 10, label: '+10', angle: 405 },   // End (bottom-right, same as 45°)
  ];

  get rotationTransform(): string {
    const pos = this.position();
    const percentage = pos !== undefined
      ? Math.max(0, Math.min(1, pos))
      : (this.value() - this.min()) / (this.max() - this.min());
    const rotation = -135 + (percentage * 270);
    return `rotate(${rotation}deg)`;
  }

  get gaugePercentage(): number {
    const pos = this.position();
    if (pos !== undefined) return Math.max(0, Math.min(1, pos)) * 100;
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = this.value();
    return ((currentVal - minVal) / (maxVal - minVal)) * 100;
  }

  // SVG arc calculation for the gauge
  get gaugeArcPath(): string {
    const percentage = Math.max(0, Math.min(1, this.gaugePercentage / 100));

    if (percentage <= 0.001) {
      return '';
    }

    const startAngle = 135;
    const arcSpan = percentage * 270;
    const endAngle = startAngle + arcSpan;

    const radius = 37;
    const centerX = 50;
    const centerY = 50;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = arcSpan > 179 ? 1 : 0;

    return `M ${x1.toFixed(4)} ${y1.toFixed(4)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(4)} ${y2.toFixed(4)}`;
  }

  // Background arc (full range)
  get gaugeBackgroundPath(): string {
    const startAngle = 135;
    const endAngle = 45;

    const radius = 42;
    const centerX = 50;
    const centerY = 50;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x2} ${y2}`;
  }

  // Calculate tick mark positions for SVG
  getTickPosition(angleDeg: number): { x1: number; y1: number; x2: number; y2: number } {
    const centerX = 50;
    const centerY = 50;
    const innerRadius = 40;
    const outerRadius = 44;

    const angleRad = (angleDeg * Math.PI) / 180;

    return {
      x1: centerX + innerRadius * Math.cos(angleRad),
      y1: centerY + innerRadius * Math.sin(angleRad),
      x2: centerX + outerRadius * Math.cos(angleRad),
      y2: centerY + outerRadius * Math.sin(angleRad)
    };
  }

  // Calculate label positions for SVG
  getLabelPosition(angleDeg: number): { x: number; y: number } {
    const centerX = 50;
    const centerY = 50;
    const radius = 47;

    // Normalize angle to 0-360 for display purposes
    const normalizedAngle = angleDeg > 360 ? angleDeg - 360 : angleDeg;
    const angleRad = (normalizedAngle * Math.PI) / 180;

    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  }

  ngOnDestroy(): void {
    this.removeListeners();
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startDrag(event.clientY);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.startDrag(touch.clientY);
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);
  }

  private startDrag(clientY: number): void {
    this.isDragging = true;
    this.startY = clientY;
    this.startValue = this.value();
    this.startPosition = this.position() ?? 0;
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.updateValue(event.clientY);
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const touch = event.touches[0];
    this.updateValue(touch.clientY);
  }

  private updateValue(clientY: number): void {
    const deltaY = this.startY - clientY;
    const pos = this.position();

    if (pos !== undefined) {
      // Position mode: work in 0-1 space, let the processor handle scaling
      const sensitivity = 1 / 150;
      let newPosition = this.startPosition + (deltaY * sensitivity);
      newPosition = Math.max(0, Math.min(1, newPosition));
      if (newPosition !== pos) {
        this.positionChange.emit(newPosition);
      }
    } else {
      // Value mode: existing behaviour
      const range = this.max() - this.min();
      const sensitivity = range / 150;
      let newValue = this.startValue + (deltaY * sensitivity);
      const stepVal = this.step();
      newValue = Math.round(newValue / stepVal) * stepVal;
      newValue = Math.max(this.min(), Math.min(this.max(), newValue));
      if (newValue !== this.value()) {
        this.valueChange.emit(newValue);
      }
    }
  }

  private onMouseUp(): void {
    this.isDragging = false;
    this.removeListeners();
  }

  private onTouchEnd(): void {
    this.isDragging = false;
    this.removeListeners();
  }

  private removeListeners(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }
}
