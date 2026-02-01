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
  min = input<number>(0);
  max = input<number>(100);
  
  valueChange = output<number>();

  onValueChange(newValue: number): void {
    this.valueChange.emit(newValue);
  }
}
