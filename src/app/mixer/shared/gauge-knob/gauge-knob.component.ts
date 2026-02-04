import { Component, input, output, computed, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gauge-knob',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gauge-knob.component.html',
  styleUrls: ['./gauge-knob.component.scss']
})
export class GaugeKnobComponent implements OnDestroy {
  @ViewChild('knobElement') knobElement!: ElementRef<HTMLElement>;

  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  size = input<'small' | 'normal' | 'large'>('normal');
  label = input<string>('');
  unit = input<string>('dB');
  showSign = input<boolean>(true);

  valueChange = output<number>();

  private isDragging = false;
  private startY = 0;
  private startValue = 0;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  // Number of ridges/indents around the knob
  readonly ridgeCount = 32;
  ridgeIndices = Array.from({ length: this.ridgeCount }, (_, i) => i);

  get rotationTransform(): string {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = this.value();
    
    // Map value to rotation: 135deg to 405deg (270 degree range, rotated 90 CCW)
    const percentage = (currentVal - minVal) / (maxVal - minVal);
    const rotation = -135 + (percentage * 270);
    
    return `rotate(${rotation}deg)`;
  }

  get gaugePercentage(): number {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = this.value();
    return ((currentVal - minVal) / (maxVal - minVal)) * 100;
  }

  // SVG arc calculation for the gauge
  get gaugeArcPath(): string {
    const percentage = Math.max(0, Math.min(1, this.gaugePercentage / 100));
    
    if (percentage <= 0.001) {
      return ''; // No arc when at minimum
    }
    
    // Rotate 90 degrees CCW: from 135 to 45 (opening at bottom)
    const startAngle = 135;
    const arcSpan = percentage * 270;
    const endAngle = startAngle + arcSpan;
    
    const radius = 42;
    const centerX = 50;
    const centerY = 50;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Large arc flag is 1 when arc spans more than 180 degrees
    // Use 179 threshold to avoid edge case at exactly 180
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

  get formattedValue(): string {
    const val = this.value();
    const sign = this.showSign() && val > 0 ? '+' : '';
    return `${sign}${val}${this.unit()}`;
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
