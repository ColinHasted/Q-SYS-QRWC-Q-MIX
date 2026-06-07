# Q-Mix Surface

A browser-based mixing console UI for [Q-SYS](https://www.qsys.com/) audio cores. Built with
Angular 21 and the [`@q-sys/qrwc`](https://www.npmjs.com/package/@q-sys/qrwc) WebSocket client,
it presents a familiar physical-style mixer surface — faders, channel processing strip, aux sends,
cue bus — wired live to named components inside a Q-SYS design.

The UI is responsive and resolution-independent: a container query rescales the entire surface
to fit any 16:9 display, from a tablet to a touchscreen mounted in an equipment rack.

## What's in the box

The default profile is a **16-channel surface** with:

- 16 input channels with label, pan, fader, mute, solo, cue and per-channel VU
- Per-channel processing strip: HPF, gate, parametric EQ (7 bands), compressor, limiter, delay
- Stereo master output with VU and mute
- 4 aux sends per channel with aux-master section
- Solo / cue bus

A second profile for the **Q-SYS Core 510i** is shipped alongside
(`designer/q-mix-surface 510i.qsys`). New surface variants — different channel counts, EQ band
layouts, or Q-SYS component naming schemes — are added by declaring another `MixerProfile` and
providing it through the `MIXER_PROFILE` injection token (see `src/app/mixer/mixer-profile.ts`).

## Architecture

    ┌──────────────────────────────────────────────────────────┐
    │  Angular UI (src/app/mixer/*)                            │
    │  ─ MixerComponent: layout, channel selection             │
    │  ─ Per-panel components: IN, HPF, GATE, EQ, COMP, …      │
    │  ─ Shared controls: gauge-knob, scale-knob, fader, …     │
    └──────────────────────┬───────────────────────────────────┘
                           │  reads signals / calls set*()
    ┌──────────────────────▼───────────────────────────────────┐
    │  QRWC component wrappers (src/qrwc/components/*)         │
    │  ─ One class per Q-SYS named component                   │
    │  ─ Exposes Angular Signals for every Q-SYS control       │
    │  ─ Typed setters issue updates back to the core          │
    └──────────────────────┬───────────────────────────────────┘
                           │
    ┌──────────────────────▼───────────────────────────────────┐
    │  QrwcAngularService — singleton WebSocket connection,    │
    │  reconnect/backoff, components signal                    │
    └──────────────────────┬───────────────────────────────────┘
                           │ ws://CORE_IP/qrc-public-api/v0
                           ▼
                      Q-SYS Core (designer/*.qsys)

The boundary between the QRWC wrappers and the UI is pure Angular signals — no RxJS streams, no
manual change detection. Every control state in Q-SYS is a `Signal`; every UI control writes
back through a typed setter on the relevant component wrapper.

## Q-SYS design files

The matching Q-SYS designs live in `designer/` and must be loaded into the core for the surface
to work:

| File | Surface variant |
| --- | --- |
| `q-mix-surface.qsys` | Default 16-channel build |

Component names inside the design (`Mixer`, `Gate_1`…`Gate_16`, `Mic_Line_Input_1`…, etc.) must
match the templates in the active `MixerProfile`. Rename either side and the binding silently
falls back to defaults.

## Getting started

Prerequisites: Node 20+ and a reachable Q-SYS core (real or Designer-emulated).

    npm install
    npm start

The dev server runs at <http://localhost:4200>.

### Pointing at a core

The default core IP is set in `src/app/app.ts` (`coreIpAddress`). You can override it at runtime
with query parameters:

| Param | Purpose | Example |
| --- | --- | --- |
| `host` | Core IP or hostname | `?host=192.168.1.50` |
| `poll` | Polling interval (ms) | `?poll=100` |

    http://localhost:4200/?host=10.0.0.42&poll=200

### Building for production

    npm run build

Artefacts are emitted to `dist/`. The output is a static bundle — host it from any web server
the cores can reach.

## Project layout

    src/
      app/
        mixer/                 mixer UI components, one per Q-SYS block
          mixer-channel/       fader strip
          mixer-input/         IN panel (gain, 48V, phantom, polarity)
          mixer-hpf/           high-pass filter
          mixer-gate/          gate with response graph
          mixer-equalizer/     7-band parametric EQ + response graph
          mixer-compressor/    compressor with curve display
          mixer-limiter/       limiter
          mixer-output/        per-channel output trim/delay
          mixer-master/        stereo master output
          mixer-aux-sends/     per-channel aux send levels
          mixer-aux-master/    aux bus masters
          mixer-cue/           cue/solo bus
          services/            ChannelProcessingService — caches one
                               processor instance per channel
          shared/              fader, knobs, meters
          mixer-profile.ts     MixerProfile interface + DEFAULT_MIXER_PROFILE
        scss/                  design tokens, mixins, shared panel styles
      qrwc/
        qrwc-angular-service.ts   connection, reconnect, components signal
        qrwc-control-binding.ts   reactive wrapper around a single Q-SYS control
        components/               one wrapper per Q-SYS named component type
    designer/                  matching .qsys design files

## Useful npm scripts

| Script | What it does |
| --- | --- |
| `npm start` | Dev server at :4200 with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run watch` | Dev build, rebuild on change |
| `npm test` | Vitest test runner |