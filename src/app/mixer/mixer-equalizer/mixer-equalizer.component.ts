import { Component, input, output, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EQBand } from '../mixer.interfaces';
import { RotaryKnobComponent } from '../shared/rotary-knob/rotary-knob.component';

@Component({
  selector: 'app-mixer-equalizer',
  standalone: true,
  imports: [FormsModule, RotaryKnobComponent],
  styles: [`:host { display: contents; }`],
  template: `
    <div class="strip-panel eq-panel">
      <div class="panel-header">
        EQUALISER
        <button class="panel-toggle eq-toggle header-toggle" [class.active]="on()"
                (click)="onToggle()">ON</button>
      </div>
      <div class="panel-content eq-content-vertical">
        <!-- Bands Column -->
        <div class="eq-bands-vertical">
          <!-- BAND 4 (HI) -->
          <div class="eq-band-row">
            <span class="band-label">BAND 4</span>
            <div class="band-controls">
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[3].gain"
                  [min]="-18"
                  [max]="18"
                  [step]="0.5"
                  size="small"
                  (valueChange)="onBandChange(3, 'gain', $event)"
                />
                <label>GAIN</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[3].frequency"
                  [min]="2000"
                  [max]="20000"
                  [step]="100"
                  size="small"
                  (valueChange)="onBandChange(3, 'frequency', $event)"
                />
                <label>FREQUENCY</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[3].q"
                  [min]="0.1"
                  [max]="10"
                  [step]="0.1"
                  size="small"
                  (valueChange)="onBandChange(3, 'q', $event)"
                />
                <label>WIDTH</label>
              </div>
            </div>
          </div>

          <!-- BAND 3 (HI MID) -->
          <div class="eq-band-row">
            <span class="band-label">BAND 3</span>
            <div class="band-controls">
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[2].gain"
                  [min]="-18"
                  [max]="18"
                  [step]="0.5"
                  size="small"
                  (valueChange)="onBandChange(2, 'gain', $event)"
                />
                <label>GAIN</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[2].frequency"
                  [min]="500"
                  [max]="8000"
                  [step]="50"
                  size="small"
                  (valueChange)="onBandChange(2, 'frequency', $event)"
                />
                <label>FREQUENCY</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[2].q"
                  [min]="0.1"
                  [max]="10"
                  [step]="0.1"
                  size="small"
                  (valueChange)="onBandChange(2, 'q', $event)"
                />
                <label>WIDTH</label>
              </div>
            </div>
          </div>

          <!-- BAND 2 (LO MID) -->
          <div class="eq-band-row">
            <span class="band-label">BAND 2</span>
            <div class="band-controls">
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[1].gain"
                  [min]="-18"
                  [max]="18"
                  [step]="0.5"
                  size="small"
                  (valueChange)="onBandChange(1, 'gain', $event)"
                />
                <label>GAIN</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[1].frequency"
                  [min]="100"
                  [max]="2000"
                  [step]="10"
                  size="small"
                  (valueChange)="onBandChange(1, 'frequency', $event)"
                />
                <label>FREQUENCY</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[1].q"
                  [min]="0.1"
                  [max]="10"
                  [step]="0.1"
                  size="small"
                  (valueChange)="onBandChange(1, 'q', $event)"
                />
                <label>WIDTH</label>
              </div>
            </div>
          </div>

          <!-- BAND 1 (LO) -->
          <div class="eq-band-row">
            <span class="band-label">BAND 1</span>
            <div class="band-controls">
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[0].gain"
                  [min]="-18"
                  [max]="18"
                  [step]="0.5"
                  size="small"
                  (valueChange)="onBandChange(0, 'gain', $event)"
                />
                <label>GAIN</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[0].frequency"
                  [min]="20"
                  [max]="500"
                  [step]="5"
                  size="small"
                  (valueChange)="onBandChange(0, 'frequency', $event)"
                />
                <label>FREQUENCY</label>
              </div>
              <div class="knob-group">
                <app-rotary-knob
                  [value]="bands()[0].q"
                  [min]="0.1"
                  [max]="10"
                  [step]="0.1"
                  size="small"
                  (valueChange)="onBandChange(0, 'q', $event)"
                />
                <label>WIDTH</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Large EQ Display -->
        <div class="eq-display-large">
          <div class="eq-glass-large">
            <canvas #eqCanvas></canvas>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MixerEqualizerComponent implements AfterViewInit {
  @ViewChild('eqCanvas') eqCanvas!: ElementRef<HTMLCanvasElement>;

  on = input.required<boolean>();
  bands = input.required<EQBand[]>();

  toggle = output<void>();
  bandChange = output<{ index: number; property: keyof EQBand; value: number }>();

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

  protected onBandChange(index: number, property: keyof EQBand, value: number): void {
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
