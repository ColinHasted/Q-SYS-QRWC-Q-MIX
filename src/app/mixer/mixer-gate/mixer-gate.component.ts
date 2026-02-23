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

  // Input: which channel (1-16) this gate UI is controlling
  channel = input.required<number>();

  // Computed: get the QRWC gate component for the current channel
  private qrwcGate = computed<QrwcGateComponent>(() => {
    return this.channelProcessing.getGate(this.channel());
  });

  // Expose QRWC signals for template binding
  bypass = computed(() => this.qrwcGate().bypass());
  threshold = computed(() => this.qrwcGate().thresholdLevel());
  attack = computed(() => this.qrwcGate().attack());
  hold = computed(() => this.qrwcGate().holdTime());
  release = computed(() => this.qrwcGate().release());
  depth = computed(() => this.qrwcGate().depth());
  detectorLevel = computed(() => this.qrwcGate().detectorLevel());
  open = computed(() => this.qrwcGate().open());

  constructor() {
    effect(() => {
      const _ = [this.threshold(), this.depth()];
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
    gate.SetBypass(!gate.bypass());
  }

  protected onThresholdChange(value: number): void {
    this.qrwcGate().SetThresholdLevel(value);
  }

  protected onAttackChange(value: number): void {
    this.qrwcGate().SetAttack(value);
  }

  protected onHoldChange(value: number): void {
    this.qrwcGate().SetHoldTime(value);
  }

  protected onReleaseChange(value: number): void {
    this.qrwcGate().SetRelease(value);
  }

  protected onDepthChange(value: number): void {
    this.qrwcGate().SetDepth(value);
  }

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
