import { Component, input, output, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { EQBand } from '../mixer.interfaces';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-equalizer',
  standalone: true,
  imports: [ RotaryKnobComponent],
  templateUrl: './mixer-equalizer.component.html',
  styleUrls: ['./mixer-equalizer.component.scss']
})
export class MixerEqualizerComponent implements AfterViewInit {
  @ViewChild('eqCanvas') eqCanvas!: ElementRef<HTMLCanvasElement>;

  on = input.required<boolean>();
  bands = input.required<EQBand[]>();

  toggle = output<void>();
  bandChange = output<{ index: number; property: keyof EQBand; value: number | string }>();

  constructor() {
    // Update canvas when bands change
    effect(() => {
      const currentBands = this.bands();
      if (this.eqCanvas) {
        this.drawEQResponse(currentBands);
      }
    });
  }

  ngAfterViewInit(): void {
    this.drawEQResponse(this.bands());
  }

  protected onToggle(): void {
    this.toggle.emit();
  }

  protected onBandChange(index: number, property: keyof EQBand, value: number | string): void {
    this.bandChange.emit({ index, property, value });
  }

  private drawEQResponse(bands: EQBand[]): void {
    if (!this.eqCanvas?.nativeElement) return;
    
    const canvas = this.eqCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines (dB)
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical lines (frequency)
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw EQ response curve
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
      const freq = Math.pow(10, (x / width) * 3 + 1); // 10Hz to 20kHz
      let totalGain = 0;
      
      bands.forEach(band => {
        const relativeFreq = freq / band.frequency;
        let gain = 0;
        
        if (band.type === 'lowshelf') {
          const omega = Math.tan(Math.PI * relativeFreq);
          gain = band.gain / (1 + omega * omega);
        } else if (band.type === 'highshelf') {
          const omega = Math.tan(Math.PI / relativeFreq);
          gain = band.gain / (1 + omega * omega);
        } else {
          const bw = Math.log2(relativeFreq) * band.q;
          gain = band.gain / (1 + bw * bw);
        }
        
        totalGain += gain;
      });
      
      const y = height / 2 - (totalGain / 18) * (height / 2);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  }
}
