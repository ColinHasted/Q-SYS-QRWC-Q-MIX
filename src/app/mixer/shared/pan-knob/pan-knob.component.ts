import { Component, input, output, computed, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pan-knob',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pan-knob.component.html',
  styleUrls: ['./pan-knob.component.scss']
})
export class PanKnobComponent implements OnDestroy {
  @ViewChild('knobElement') knobElement!: ElementRef<HTMLElement>;

  value = input.required<number>();
  min = input<number>(-100);
  max = input<number>(100);
  step = input<number>(1);
  size = input<'small' | 'normal' | 'large'>('normal');
  label = input<string>('');

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
    
    // Map value to rotation: -135deg to 135deg (270 degree range, centered at top)
    const percentage = (currentVal - minVal) / (maxVal - minVal);
    const rotation = -135 + (percentage * 270);
    
    return `rotate(${rotation}deg)`;
  }

  // SVG arc calculation for the pan gauge (bidirectional from top)
  get gaugeArcPath(): string {
    const currentVal = this.value();
    const minVal = this.min();
    const maxVal = this.max();
    const center = (minVal + maxVal) / 2;
    
    const radius = 42;
    const centerX = 50;
    const centerY = 50;
    
    // Start at top (270 degrees / -90 degrees)
    const startAngle = 270;
    
    // Calculate end angle based on value
    let endAngle: number;
    if (Math.abs(currentVal - center) < 0.001) {
      // Show tiny dot when centered (2 degree arc)
      endAngle = 270;
    } else if (currentVal > center) {
      // Clockwise (right): 270 to 45
      const percentage = (currentVal - center) / (maxVal - center);
      endAngle = 270 + (percentage * 135);
    } else {
      // Counter-clockwise (left): 270 to 135
      const percentage = (center - currentVal) / (center - minVal);
      endAngle = 270 - (percentage * 135);
    }
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const arcSpan = Math.abs(endAngle - startAngle);
    const largeArcFlag = arcSpan > 179 ? 1 : 0;
    const sweepFlag = currentVal > center ? 1 : 0;
    
    return `M ${x1.toFixed(4)} ${y1.toFixed(4)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2.toFixed(4)} ${y2.toFixed(4)}`;
  }

  // Background arc (full range from left to right)
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
    const center = (this.min() + this.max()) / 2;
    
    if (val === center) {
      return 'C';
    }
    
    const percentage = Math.abs(val - center) / (this.max() - center) * 100;
    const direction = val > center ? 'R' : 'L';
    return `${direction}${Math.round(percentage)}`;
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
