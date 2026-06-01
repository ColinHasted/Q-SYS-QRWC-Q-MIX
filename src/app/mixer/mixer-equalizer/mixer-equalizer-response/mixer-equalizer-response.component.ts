import { Component, input, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { ParametricEQBand, ParametricEQResponseCalculator } from '../../../../qrwc/components/helpers/parametric-eq-response-calculator';
import { EQBand, FilterType, QrwcParametricEqualizerComponent } from '../../../../qrwc/components/qrwc-parametric-equalizer-component';
import { Chart, LogarithmicScale, registerables } from 'chart.js';
import { QrwcResponsalyzerComponent, RtaBandwidth } from '../../../../qrwc/components/qrwc-responsalyzer-component';

/**
 * Normalise a raw Q-SYS filter type value (0-indexed int, 1-indexed int, or
 * string name) to a known FilterType enum member. Defaults to Parametric.
 */
function normalizeFilterType(raw: any): FilterType {
  // String names sent by some Q-SYS firmware versions
  if (typeof raw === 'string') {
    const s = raw.toLowerCase();
    if (s.includes('low') && s.includes('shelf'))  return FilterType.LowShelf;
    if (s.includes('high') && s.includes('shelf')) return FilterType.HighShelf;
    if (s.includes('param') || s.includes('peak') || s.includes('bell')) return FilterType.Parametric;
    raw = Number(raw);
  }
  const n = Number(raw);
  // 1-indexed enum values (matches what Q-SYS echoes back): 1=Parametric, 2=LowShelf, 3=HighShelf
  if (n === FilterType.Parametric) return FilterType.Parametric; // 1
  if (n === FilterType.LowShelf)   return FilterType.LowShelf;   // 2
  if (n === FilterType.HighShelf)  return FilterType.HighShelf;  // 3
  // 0-indexed fallback for initial state: only 0 is unambiguous
  if (n === 0) return FilterType.Parametric;
  return FilterType.Parametric;
}

function remapQRWCEqBands(eqBands: EQBand[]): ParametricEQBand[] {
  return eqBands.map((eqBand) => ({
    Frequency: eqBand.Frequency(),
    Gain: eqBand.Gain(),
    Bandwidth: eqBand.Bandwidth(),
    Q: eqBand.Q(),
    Type: normalizeFilterType(eqBand.Type()),
  }));
}


@Component({
  selector: 'app-mixer-equalizer-response',
  standalone: true,
  imports: [],
  templateUrl: './mixer-equalizer-response.component.html',
  styleUrls: ['./mixer-equalizer-response.component.scss']
})
export class MixerEqualizerResponseComponent implements AfterViewInit {

  private readonly ParametricEQResponseCalculator =
    new ParametricEQResponseCalculator(10, 20000, 48);

  chart: any;

  @ViewChild('responseCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Coalesce all chart.update() calls into a single rAF per frame. */
  private chartUpdatePending = false;
  private scheduleChartUpdate(): void {
    if (this.chartUpdatePending) return;
    this.chartUpdatePending = true;
    requestAnimationFrame(() => {
      this.chartUpdatePending = false;
      if (this.chart) this.chart.update();
    });
  }

  /** The EQ component for the currently selected channel (null when nothing is selected). */
  parametricEQ = input<QrwcParametricEqualizerComponent | null>(null);

  /** Fixed responsalyzer — component name never changes. */
  private readonly responsalyzerComponent = new QrwcResponsalyzerComponent(
    'Responsalyzer',
    RtaBandwidth.Octave24
  );

  constructor() {
    effect(() => {
      // Always read ALL reactive signals first so they're tracked regardless
      // of whether the chart exists yet.
      const eq = this.parametricEQ();
      const bands = eq ? remapQRWCEqBands(eq.ActiveEQBands()) : null;
      const bandPoints = eq?.EQBands.map((band) => ({
        x: Number(band.Frequency()) || 0,
        y: Number(band.Gain()) || 0,
      }));

      if (!this.chart) return;

      if (!eq || !bands) {
        this.chart.data.datasets[0].data = [];
        this.chart.data.datasets[1].data = [];
        this.chart.data.datasets[2].data = [];
        this.scheduleChartUpdate();
        return;
      }

      const response = this.ParametricEQResponseCalculator.calculateFilterResponse(bands);
      this.chart.data.datasets[0].data = response.map((r) => ({ x: r.Frequency, y: r.Magnitude }));
      this.chart.data.datasets[1].data = response.map((r) => ({ x: r.Frequency, y: r.Phase }));
      this.chart.data.datasets[2].data = bandPoints!;
      this.scheduleChartUpdate();
    });

    // Responsalyzer — re-runs whenever magnitude or frequency data changes.
    effect(() => {
      const magnitude = this.responsalyzerComponent.magnitude();
      const frequencies = this.responsalyzerComponent.frequencies();
      if (!this.chart) return;
      if (!magnitude?.length || !frequencies?.length) {
        this.chart.data.datasets[3].data = [];
        this.scheduleChartUpdate();
        return;
      }
      this.chart.data.datasets[3].data = frequencies.map((freq, i) => ({
        x: freq,
        y: magnitude[i],
      }));
      this.scheduleChartUpdate();
    });
  }

  private updateEQCurve(): void {
    const eq = this.parametricEQ();
    if (!this.chart) return;
    if (!eq) {
      this.chart.data.datasets[0].data = [];
      this.chart.data.datasets[1].data = [];
      this.chart.data.datasets[2].data = [];
      this.scheduleChartUpdate();
      return;
    }
    const bands = remapQRWCEqBands(eq.ActiveEQBands());
    const response = this.ParametricEQResponseCalculator.calculateFilterResponse(bands);
    this.chart.data.datasets[0].data = response.map((r) => ({ x: r.Frequency, y: r.Magnitude }));
    this.chart.data.datasets[1].data = response.map((r) => ({ x: r.Frequency, y: r.Phase }));
    this.chart.data.datasets[2].data = eq.EQBands.map((band) => ({
      x: Number(band.Frequency()) || 0,
      y: Number(band.Gain()) || 0,
    }));
    this.scheduleChartUpdate();
  }

  ngAfterViewInit(): void {
    // Register the necessary scales
    Chart.register(...registerables, LogarithmicScale);

    // Create the Chart.js chart
    const ctx = this.canvasRef.nativeElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'EQ Response',
            data: [],
            tension: 0.25, // light curve smoothing (0..1)
            borderColor: '#00cc66', // Darker green for dark background
            borderWidth: 1,
            fill: false,
            pointRadius: 0, // No points, just the line
            yAxisID: 'y', // Attach to the right Y-axis
          },
          {
            label: 'Phase (degrees)',
            data: [],
            tension: 0.25, // light curve smoothing (0..1)
            borderColor: '#ff6b35', // Orange for contrast on dark background
            borderWidth: 1,
            fill: false,
            pointRadius: 0, // No points, just the line
            yAxisID: 'y1', // Attach to the right Y-axis
          },
          {
            label: 'EQ Band Points',
            data: [],
            borderColor: '#ffdd00', // Bright yellow for visibility
            pointBorderColor: (context) => {
              return this.parametricEQ()?.EQBands[
                Number(context.dataIndex)
              ]?.Bypass()
                ? '#cc2222' // Darker red for bypassed
                : '#ffdd00'; // Bright yellow for active
            },
            pointRadius: 1.5, // Slightly larger for visibility
            showLine: false, // Disable connecting lines between the dots
            yAxisID: 'y', // Attach to the right Y-axis
          },
          {
            label: 'RTA',
            data: [],
            borderColor: 'rgba(192, 75, 192, 0.85)',
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            tension: 0,
            yAxisID: 'y',
          },

        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0, // Immediate resize response
        interaction: {
          intersect: false,
        },
        animation: {
          duration: 0, // Disable animations for better performance during resize
        },
        plugins: {
          legend: {
            display: false, // Hide legend for cleaner look
          },
        },
        scales: {
          x: {
            type: 'logarithmic',
            title: {
              display: false, // Remove title
            },
            min: 10,
            max: 20000,
            grid: {
              color: 'rgba(80, 204, 102, 0.1)', // Darker green grid
              lineWidth: 0.5,
            },
            ticks: {
              maxRotation: 0, // Horizontal labels
              minRotation: 0, // Horizontal labels
              callback: (value) => {
                const predefinedValues = [
                  20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000,
                ];

                if (predefinedValues.includes(+value)) {
                  return +value >= 1000 ? +value / 1000 + 'k' : value;
                }

                return undefined;
              },
              color: '#00cc66', // Darker green text
              font: {
                size: 9, // Smaller font
                family: 'monospace',
              },
            },
          },
          y: {
            title: {
              display: false, // Remove title
            },
            min: -20,
            max: 20,
            grid: {
              color: 'rgba(80, 204, 102, 0.15)', // Darker green grid
              lineWidth: 0.5,
            },
            ticks: {
              color: '#00cc66', // Darker green text
              font: {
                size: 9, // Smaller font
                family: 'monospace',
              },
              stepSize: 10, // Show every 10dB
            },
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: false, // Remove title
            },
            min: -180,
            max: 180,
            grid: {
              drawOnChartArea: false, // Avoid overlapping grid lines
            },
            ticks: {
              color: '#ff6b35', // Orange text to match phase line
              font: {
                size: 8, // Smaller font
                family: 'monospace',
              },
              stepSize: 90, // Show every 90 degrees
            },
          },
        },
      },
    });

    // Add ResizeObserver for better responsive behavior
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          if (this.chart) this.chart.resize();
        });
      });
      resizeObserver.observe(ctx.parentElement!);
    }

    // Chart was null when effects first ran — draw now with whatever data is available.
    this.updateEQCurve();
  }

}
