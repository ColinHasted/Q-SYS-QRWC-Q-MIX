import { Component, input, output, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rotary-knob',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
    }
    .knob-container {
      position: relative;
      cursor: pointer;
      touch-action: none;
    }
    .knob-body {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(145deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
      position: relative;
    }
    .knob-indicator {
      position: absolute;
      width: 4px;
      height: 10px;
      background: linear-gradient(180deg, #fff 0%, #aaa 100%);
      border-radius: 2px;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    .knob-rotate {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    .knob-container.large .knob-indicator {
      width: 5px;
      height: 12px;
    }
    .knob-container.small .knob-indicator {
      width: 3px;
      height: 8px;
      top: 2px;
    }
    .knob-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.3);
      pointer-events: none;
    }
  `],
  template: `
    <div class="knob-container" 
         [class.large]="size() === 'large'"
         [class.small]="size() === 'small'"
         [style.width.px]="sizePixels"
         [style.height.px]="sizePixels"
         #knobElement
         (mousedown)="onMouseDown($event)"
         (touchstart)="onTouchStart($event)">
      <div class="knob-ring"></div>
      <div class="knob-body">
        <div class="knob-rotate" [style.transform]="rotationTransform">
          <div class="knob-indicator"></div>
        </div>
      </div>
    </div>
  `
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

  get sizePixels(): number {
    switch (this.size()) {
      case 'small': return 36;
      case 'large': return 54;
      default: return 44;
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
