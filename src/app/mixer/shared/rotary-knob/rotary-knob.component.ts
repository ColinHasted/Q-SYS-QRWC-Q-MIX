import { Component, input, output, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rotary-knob',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rotary-knob.component.html',
  styleUrls: ['./rotary-knob.component.scss']
})
export class RotaryKnobComponent implements AfterViewInit, OnDestroy {
  @ViewChild('knobElement') knobElement!: ElementRef<HTMLElement>;

  value = input.required<number>();
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  size = input<'small' | 'normal' | 'large'>('normal');

  valueChange = output<number>();

  private isDragging = false;
  private startY = 0;
  private startValue = 0;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  get sizeEm(): string {
    switch (this.size()) {
      case 'small': return '2.25rem';
      case 'large': return '3.375rem';
      default: return '2.75rem';
    }
  }

  get rotationTransform(): string {
    const minVal = this.min();
    const maxVal = this.max();
    const currentVal = this.value();
    
    // Map value to rotation: -135deg to +135deg (270 degree range)
    const percentage = (currentVal - minVal) / (maxVal - minVal);
    const rotation = -135 + (percentage * 270);
    
    return `rotate(${rotation}deg)`;
  }

  ngAfterViewInit(): void {
    // Add passive: false to allow preventDefault on touch events
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
    const sensitivity = range / 150; // pixels to travel full range
    
    let newValue = this.startValue + (deltaY * sensitivity);
    
    // Apply step
    const stepVal = this.step();
    newValue = Math.round(newValue / stepVal) * stepVal;
    
    // Clamp to range
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
