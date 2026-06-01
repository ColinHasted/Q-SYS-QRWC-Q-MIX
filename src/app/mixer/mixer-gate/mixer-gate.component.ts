import { Component, input, output, ViewChild, ElementRef, AfterViewInit, effect, computed, inject, Signal } from '@angular/core';
import { GaugeKnobComponent } from '../shared/gauge-knob/gauge-knob.component';
import { ChannelProcessingService } from '../services/channel-processing.service';
import { QrwcGateComponent } from '../../../qrwc/components/qrwc-gate-component';

@Component({
  selector: 'app-mixer-gate',
  standalone: true,
  imports: [GaugeKnobComponent],
  templateUrl: './mixer-gate.component.html',
  styleUrls: ['./mixer-gate.component.scss']
})
export class MixerGateComponent implements AfterViewInit {
  @ViewChild('curveCanvas') curveCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly channelProcessing = inject(ChannelProcessingService);

  // Input: which channel this gate UI is controlling (null = no selection).
  channel = input<number | null>(null);

  protected disabled = computed(() => this.channel() == null);

  // Computed: get the QRWC gate component for the current channel (or null).
  private qrwcGate = computed<QrwcGateComponent | null>(() => {
    const ch = this.channel();
    return ch == null ? null : this.channelProcessing.getGate(ch);
  });

  // Expose QRWC signals for template binding with safe defaults.
  bypass        = computed(() => this.qrwcGate()?.bypass() ?? true);
  thresholdPos  = computed(() => this.qrwcGate()?.thresholdLevelPosition() ?? 0);
  thresholdStr  = computed(() => this.qrwcGate()?.thresholdLevelString() ?? '');
  attackPos     = computed(() => this.qrwcGate()?.attackPosition() ?? 0);
  attackStr     = computed(() => this.qrwcGate()?.attackString() ?? '');
  holdPos       = computed(() => this.qrwcGate()?.holdTimePosition() ?? 0);
  holdStr       = computed(() => this.qrwcGate()?.holdTimeString() ?? '');
  releasePos    = computed(() => this.qrwcGate()?.releasePosition() ?? 0);
  releaseStr    = computed(() => this.qrwcGate()?.releaseString() ?? '');
  depthPos      = computed(() => this.qrwcGate()?.depthPosition() ?? 0);
  depthStr      = computed(() => this.qrwcGate()?.depthString() ?? '');
  detectorLevel = computed(() => this.qrwcGate()?.detectorLevel() ?? -80);
  open          = computed(() => this.qrwcGate()?.open() ?? false);

  // Keep value signals for the curve canvas
  threshold     = computed(() => this.qrwcGate()?.thresholdLevel() ?? -40);
  depth         = computed(() => this.qrwcGate()?.depth() ?? 0);

  constructor() {
    effect(() => {
      // Track signals that should trigger a redraw.
      const _ = [this.threshold(), this.depth(), this.disabled()];
      if (this.curveCanvas) {
        this.drawCurve();
      }
    });
  }

  ngAfterViewInit(): void {
    this.drawCurve();
  }

  protected onToggle(): void {
    const gate = this.qrwcGate();
    if (gate) gate.SetBypass(!gate.bypass());
  }

  protected onThresholdChange(position: number): void { this.qrwcGate()?.SetThresholdLevelPosition(position); }
  protected onAttackChange(position: number): void    { this.qrwcGate()?.SetAttackPosition(position); }
  protected onHoldChange(position: number): void      { this.qrwcGate()?.SetHoldTimePosition(position); }
  protected onReleaseChange(position: number): void   { this.qrwcGate()?.SetReleasePosition(position); }
  protected onDepthChange(position: number): void     { this.qrwcGate()?.SetDepthPosition(position); }

  private drawCurve(): void {
    if (!this.curveCanvas?.nativeElement) return;

    const canvas = this.curveCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // When no channel selected, leave the canvas as an empty grid only.
    if (this.disabled()) return;

    // Draw gate curve
    const thresholdNorm = (this.threshold() + 80) / 80; // -80 to 0 -> 0 to 1
    const depthNorm = Math.abs(this.depth()) / 80; // 0 to -80 -> 0 to 1

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Below threshold - reduced by depth
    const threshX = thresholdNorm * width;
    const depthY = height - (depthNorm * height * 0.8);

    ctx.moveTo(0, depthY);
    ctx.lineTo(threshX * 0.8, depthY);

    // Transition zone
    ctx.lineTo(threshX, height * 0.1);

    // Above threshold - unity
    ctx.lineTo(width, height * 0.1);

    ctx.stroke();
  }
}
