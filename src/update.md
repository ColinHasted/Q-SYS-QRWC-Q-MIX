# Plan: Q-Mix Surface Codebase Improvement Guide

A staged, low-risk refactor plan that modernizes Angular usage, reduces QRWC component boilerplate,
tidies the SCSS architecture, and gives the project a consistent "human-written" voice.

The codebase is already in very good shape — most of the work is **consolidation** and
**consistency**, not rewriting. Five phases below, each independently shippable.

---

## Phase 1 — Hygiene & Voice (low risk, high signal)

Goals: remove auto-generated/AI-flavored residue, fix obvious inconsistencies, make the project
read as human-authored.

1. **Replace README.md** — currently CLI boilerplate. Write project purpose, architecture diagram
   (mixer → QRWC service → Q-SYS core), how the `designer/` `.qsys` files map to components,
   how to run against a real core vs offline.
2. **Remove debug `console.log` calls** — keep `console.warn`/`error` for genuine failure paths.
   - `src/qrwc/qrwc-angular-service.ts` lines 47, 56, 57, 61
   - `src/app/app.ts` line 30
   - Optionally wrap behind a `DEBUG` const or use the Angular `isDevMode()` guard.
3. **Resolve TODO stubs around VU metering** — the meter wiring pattern was just established for
   `MixerChannelComponent` via `ChannelProcessingService`. Apply the same approach to:
   - `mixer-master.component` (stereo VU)
   - `mixer-aux-master.component` (per-aux VU)
   - `mixer-cue.component` (cue VU)
   - Each TODO comment then gets deleted, not just satisfied.
4. **Delete the "legacy" SCSS sections** in `mixer-equalizer.component.scss` (lines ~26, 177, 207,
   220). They are dead and the comments admit it.
5. **Comment style guide** — write a short `CONVENTIONS.md` (or a section in README) covering:
   - JSDoc on public class APIs only; no restatement-of-obvious inline comments.
   - Prefer "why" comments over "what" comments.
   - No ASCII-banner section dividers (e.g. `// ===== Setters =====`).
   - Imperative present tense ("Initialize binding", not "Setup the binding").
   - Use one term consistently: prefer "channel" over "input", "knob" over "control".
6. **Tests**: acknowledge `app.spec.ts` is a placeholder. Either commit to building a meaningful
   test suite or remove the scaffold to stop signalling false coverage.

---

## Phase 2 — QRWC API Consistency & Type Safety

Goals: make the QRWC layer feel like one cohesive library rather than a collection of generated
files. Reduce boilerplate, fix the most user-visible inconsistency.

1. **Standardize method casing to camelCase across all QRWC components** — currently
   `SetInputGain`/`ToggleInputMute` (PascalCase) coexists with `setRatioPosition` (camelCase)
   even *within* the same class (`QrwcCompressorComponent`). Decision: settle on TS-idiomatic
   camelCase for everything. This is the single most disruptive change in the plan — every
   `*.component.ts` that calls QRWC needs updating. Do it as one mechanical rename PR so reviewers
   can grep.
2. **Type the binding arrays** — replace `any[]` / `any[][]` in QRWC components with
   `QrwcControlBinding[]` / `QrwcControlBinding[][]`. Same for `IQrwcControlState.Values?: any[]`
   → `number[]`.
3. **De-duplicate `bindControl` vs `QrwcControlBinding`** — `QrwcAngularService.bindControl()` is
   ~95% the same code as `QrwcControlBinding`. Pick one as the canonical implementation and have
   the other delegate (recommendation: keep the class form, make `bindControl` a thin factory).
4. **Finish `useLog` support** in `QrwcControlBinding.setPosition()` — the constructor accepts
   `useLog` but never applies it.
5. **Optional: introduce a small `defineControls()` helper** to collapse the repeating pattern in
   `QrwcMixerComponent`/`QrwcMicLineInputComponent`/`QrwcParametricEqualizerComponent`. Not a full
   schema/codegen system — just enough to declare scalar / 1D / 2D controls and get typed
   accessors. Don't over-engineer; this is only worth it if a 4th similar component is on the way.
6. **Tighten the `dispose()` story** — `QrwcParametricEqualizerComponent.dispose()` only clears a
   debounce. Either every component needs a real dispose pattern, or the documentation should say
   "bindings live for the lifetime of the QRWC connection; no per-component cleanup needed".
   Pick one and apply it.

Explicitly out of scope: full code-generation from `.qsys` schema — interesting but a separate
project.

---

## Phase 3 — Angular Modernization (Angular 20 idioms)

Goals: bring the few remaining "Angular 15-flavored" patterns up to current best practice. Most of
the codebase is already modern (`inject()`, signals, standalone, `@for`/`@if`,
`linkedSignal` already in use in `MixerEqualizerComponent`).

1. **Migrate `@ViewChild` → `viewChild()` signal API** in the knob/fader/canvas components:
   - `gauge-knob`, `pan-knob`, `scale-knob`, `position-knob`, `fader`
   - `mixer-gate`, `mixer-compressor`, `mixer-equalizer-response`
2. **Replace `OnDestroy` manual listener cleanup with `effect()` + cleanup callback** in the four
   knob components and `fader`. Less risk of forgotten teardown.
3. **Add `ChangeDetectionStrategy.OnPush` explicitly** to all components. The signal-based
   architecture already makes this safe; making it explicit documents the intent and helps future
   contributors.
4. **Auto-initialize `ChannelProcessingService`** — currently the `MixerComponent` constructor
   calls `channelProcessing.initialize()`. Move that into the service constructor (idempotent) or
   into a `provideChannelProcessing()` `EnvironmentProviders` factory, so the manual call goes
   away.
5. **`linkedSignal` opportunities** — survey remaining `computed`s that "follow an input but can
   be locally overridden". Initial scan suggests none beyond the existing one in
   `MixerEqualizerComponent`, but worth a quick pass.
6. **`model()` two-way binding** — only convert if the call sites actually benefit. Most parents
   today pass props and listen to events; refactoring just for the sake of `model()` adds noise.
   Skip unless a clear win surfaces.

---

## Phase 4 — SCSS Consolidation

Goals: extract the repeated patterns that have crept in, without changing the visual output.

1. **Add missing design tokens** to `src/app/scss/_variables.scss`:
   - Button gradient stops (`$btn-bg-dark/mid/light`, `$btn-hover-*`, `$btn-text-inactive`)
   - Common shadows (`$shadow-button`, `$shadow-button-large`, `$shadow-inset-panel`)
   - Common borders (`$border-dark = rgba(0,0,0,0.5)`, `$highlight-subtle = rgba(255,255,255,0.1)`)
   - Background tones (`$bg-darkest = #0a1520`)
   - Two extra glow colors used inline in EQ (`$glow-red-warm`, `$glow-purple`)
2. **New mixins** in `_mixins.scss` (or a new `_buttons.scss` partial):
   - `@mixin control-pane-gradient($color)` — replaces the 10× repeated gradient in
     `_control_panes.scss`.
   - `@mixin sunken-glass-display($aspect: null)` — the EQ display style; reuse in compressor and
     gate graph windows.
   - `@mixin button-base()` / `@mixin button-hover()` / `@mixin active-colored-button($glow)` —
     covers the 6× channel button variants and 6× EQ band buttons.
   - `@mixin led-segment($color)` — VU segment glow.
3. **Move VU meter styles to a single home** — currently duplicated between `mixer.component.scss`
   and `mixer-input.component.scss`. Promote to `_shared.scss` or a new `_vu-meter.scss` partial.
4. **Fix unit consistency** — `gauge-knob.component.scss` uses `rem` for two values; switch to
   `em` to match the rest of the project.
5. **Document the unit strategy** at the top of `_variables.scss`:
   *"em throughout components, cqw/cqh on `app-root` only, never px in component styles."*
6. **Optional, defer**: introduce CSS custom properties (`--glow-cyan`, etc.) for runtime
   theming. Only worth it if you want skinning at runtime; otherwise SCSS variables are simpler.

Visual regression check after this phase: side-by-side screenshot of every panel before/after.

---

## Phase 5 — Optional architectural polish

Only worth doing if Phases 1–4 land cleanly and you want to keep going.

1. **Provider factory for QRWC component instances** — `new QrwcMixerComponent('Mixer', 17, 5)`
   in `mixer.component.ts` could become `inject(MIXER_QRWC)`. Modest readability win.
2. **Real test coverage** — start with `QrwcControlBinding` (pure logic, easy to test), then the
   `ChannelProcessingService` channel/block mapping math.
3. **ESLint rule for casing** — once Phase 2 is done, add a rule forbidding PascalCase methods so
   the inconsistency cannot return.

---

## Relevant files

**Documentation / project shell**
- `README.md` — replace
- `CONVENTIONS.md` (new) — comment & naming style

**QRWC layer**
- `src/qrwc/qrwc-control-binding.ts` — finish `useLog`, clarify dispose story
- `src/qrwc/qrwc-angular-service.ts` — remove debug logs, de-duplicate `bindControl`
- `src/qrwc/IQrwcControlState.ts` — type `Values` as `number[]`
- `src/qrwc/components/qrwc-mixer-component.ts` — casing rename, typed binding arrays
- `src/qrwc/components/qrwc-gate-component.ts`, `qrwc-compressor-component.ts`,
  `qrwc-limiter-component.ts`, `qrwc-mic-line-input-component.ts`,
  `qrwc-parametric-equalizer-component.ts` — casing rename, typed arrays
- All other `qrwc-*-component.ts` — casing rename

**App layer**
- `src/app/app.ts` — drop debug log
- `src/app/mixer/services/channel-processing.service.ts` — auto-init
- `src/app/mixer/mixer.component.ts` — drop manual `initialize()` call, OnPush
- `src/app/mixer/mixer-channel/mixer-channel.component.ts` — already wired; OnPush
- `src/app/mixer/mixer-master/`, `mixer-aux-master/`, `mixer-cue/` — finish VU TODOs
- `src/app/mixer/shared/{gauge-knob,pan-knob,scale-knob,position-knob,fader}/` —
  `viewChild()` + effect cleanup, OnPush
- `src/app/mixer/mixer-{gate,compressor,equalizer/...response}` — `viewChild()` for canvas
- Every `*.component.ts` that calls QRWC — casing rename follow-through

**SCSS**
- `src/app/scss/_variables.scss` — new tokens, unit strategy doc
- `src/app/scss/_mixins.scss` — new mixins
- `src/app/scss/_shared.scss` or new `_buttons.scss` / `_vu-meter.scss` — extracted patterns
- `src/app/scss/_control_panes.scss` — use new `control-pane-gradient` mixin
- `src/app/mixer/mixer-equalizer/mixer-equalizer.component.scss` — delete legacy sections,
  consume `sunken-glass-display`, `active-colored-button`
- `src/app/mixer/mixer-compressor/mixer-compressor.component.scss`,
  `mixer-gate/mixer-gate.component.scss` — consume `sunken-glass-display`
- `src/app/mixer/shared/gauge-knob/gauge-knob.component.scss` — em consistency

---

## Verification

Per phase, run before merging:
- `npm run build` — confirms TS compiles and bundles
- `npm start` and walk through each panel; confirm IN, HPF, GATE, COMP, EQ, LIMITER, OUT,
  MONITOR, CUE, AUX, AUX-MASTER all render and respond to a live core
- Visual diff (screenshot per panel) after Phase 4 — confirm zero pixel-level regression
- After Phase 2 (casing): grep `[A-Z][a-z]+[A-Z].*\(` inside `src/qrwc/components/` to confirm
  no PascalCase method names remain
- After Phase 3 (`viewChild`): grep `@ViewChild` to confirm none remain
- Smoke test the Q-SYS designer files in `designer/` still match component name templates

---

## Decisions / Scope

- **In scope**: hygiene, type safety, naming, modern Angular API migration, SCSS DRY
- **Deferred**: real test suite, CSS custom-property theming, schema/codegen for QRWC components,
  provider-factory wrapping of QRWC component classes
- **Out of scope**: visual redesign, layout changes, new features

## Further Considerations

1. **How aggressive on the casing rename?** Option A (recommended): one mechanical PR renaming
   every `SetX` → `setX` across QRWC + call sites. Option B: ship new components in camelCase,
   leave old in PascalCase. Option C: keep PascalCase as the project's convention and document it
   (least disruptive but unusual for TS).
2. **Do you want to keep the `console.log` calls behind `isDevMode()`** rather than removing them
   outright? Useful when debugging at a customer site.
3. **CSS custom properties for runtime theming** — yes/no? Adds a small amount of indirection but
   enables on-the-fly skinning, e.g. a "dark blue" vs "amber" surface variant.
