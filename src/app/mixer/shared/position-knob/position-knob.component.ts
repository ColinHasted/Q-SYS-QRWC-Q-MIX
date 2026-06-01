import { Component, input, output, ElementRef, ViewChild, OnDestroy } from '@angular/core';

/**
 * A rotary knob that operates purely in 0-1 position space.
 * The caller owns all scaling — position comes from and goes back to the processor unchanged.
 * Use displayValue to show the processor's own formatted string in the value box.
 */
@Component({
  selector: 'app-position-knob',
  standalone: true,
  imports: [],
  templateUrl: './position-knob.component.html',
  styleUrls: ['./position-knob.component.scss']
})
export class PositionKnobComponent implements OnDestroy {
  @ViewChild('knobElement') knobElement!: ElementRef<HTMLElement>;

  /** 0-1 position from the processor. Drives knob rotation and gauge arc. */
  position = input.required<number>();

  /** Display string from the processor shown in the value box. */
  displayValue = input<string>('');

  label = input<string>('');
  size = input<'small' | 'normal' | 'large'>('normal');

  /** Emits the new 0-1 position on drag. */
  positionChange = output<number>();

  private isDragging = false;
  private startY = 0;
  private startPosition = 0;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  readonly ridgeCount = 32;
  ridgeIndices = Array.from({ length: this.ridgeCount }, (_, i) => i);

  // Sensitivity: full knob travel (~270°) over 200px of drag
  private readonly SENSITIVITY = 1 / 200;

  get rotationTransform(): string {
    const rotation = -135 + (Math.max(0, Math.min(1, this.position())) * 270);
    return `rotate(${rotation}deg)`;
  }

  get gaugeArcPath(): string {
    const percentage = Math.max(0, Math.min(1, this.position()));

    if (percentage <= 0.001) return '';

    const startAngle = 135;
    const arcSpan = percentage * 270;
    const endAngle = startAngle + arcSpan;
    const radius = 42;
    const cx = 50, cy = 50;

    const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = arcSpan > 179 ? 1 : 0;
    return `M ${x1.toFixed(4)} ${y1.toFixed(4)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(4)} ${y2.toFixed(4)}`;
  }

  get gaugeBackgroundPath(): string {
    const startAngle = 135;
    const endAngle = 45;
    const radius = 42;
    const cx = 50, cy = 50;

    const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x2} ${y2}`;
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startDrag(event.clientY);
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.startDrag(event.touches[0].clientY);
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);
  }

  private startDrag(clientY: number): void {
    this.isDragging = true;
    this.startY = clientY;
    const rawPosition = this.position();
    this.startPosition = Math.max(0, Math.min(1, rawPosition));
    console.log(`[PositionKnob] startDrag: clientY=${clientY}, rawPosition=${rawPosition}, startPosition=${this.startPosition.toFixed(4)}`);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.updatePosition(event.clientY);
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    this.updatePosition(event.touches[0].clientY);
  }

  private updatePosition(clientY: number): void {
    const deltaY = this.startY - clientY;
    const newPosition = Math.max(0, Math.min(1, this.startPosition + deltaY * this.SENSITIVITY));
    console.log(`[PositionKnob] positionChange: ${newPosition.toFixed(4)} (deltaY: ${deltaY}, start: ${this.startPosition.toFixed(4)})`);
    this.positionChange.emit(newPosition);
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

  ngOnDestroy(): void {
    this.removeListeners();
  }
}
