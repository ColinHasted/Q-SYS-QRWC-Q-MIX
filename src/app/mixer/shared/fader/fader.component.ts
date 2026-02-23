import { Component, input, output } from '@angular/core';

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

  onValueChange(newValue: number): void {
    this.valueChange.emit(newValue);
  }
}
