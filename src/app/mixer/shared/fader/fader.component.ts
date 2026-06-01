import { Component, computed, ElementRef, input, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-fader',
  standalone: true,
  imports: [],
  templateUrl: './fader.component.html',
  styleUrls: ['./fader.component.scss']
})
export class FaderComponent {
  value = input.required<number>();
  min = input<number>(-100);
  max = input<number>(20);
  step = input<number | 'any'>('any');
  valueChange = output<number>();

  @ViewChild('faderWrapper') private wrapperRef!: ElementRef<HTMLDivElement>;

  protected dragging = false;

  positionPct = computed(() => {
    const min = this.min();
    const max = this.max();
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (this.value() - min) / (max - min)));
  });

  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.updateFromPointer(event);
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    this.updateFromPointer(event);
    event.preventDefault();
  }

  onPointerUp(): void {
    this.dragging = false;
  }

  private updateFromPointer(event: PointerEvent): void {
    const rect = this.wrapperRef.nativeElement.getBoundingClientRect();
    // top = max, bottom = min
    const pct = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const min = this.min();
    const max = this.max();
    let value = min + pct * (max - min);
    const step = this.step();
    if (typeof step === 'number' && step > 0) {
      value = Math.round(value / step) * step;
    }
    this.valueChange.emit(Math.max(min, Math.min(max, value)));
  }
}

