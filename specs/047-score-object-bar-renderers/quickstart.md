# Quickstart: ScoreObject BarRenderer Parity

## Prerequisites

- Work from branch `047-score-object-bar-renderers`.
- Review Java sources listed in `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/research.md`.
- Keep waveform work scoped to current Java behavior. Do not redesign waveform rendering in this slice.

## Focused Automated Validation

Run focused snapshot and renderer tests as they are added:

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/score-object-bar-renderer-contract.test.ts src/renderer/tests/score-object-bar-renderers.test.ts src/renderer/tests/audio-clip-bar-renderer.test.tsx --browser.enabled=false
```

Run existing score interaction tests affected by timeline rendering:

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/audio-layer-group-canvas.test.tsx src/renderer/tests/score-time-canvas-cross-group.test.tsx src/renderer/tests/score-object-properties-panel.test.tsx src/renderer/tests/score-object-editor-panel.test.tsx src/renderer/tests/score-panel-session-reset.test.tsx --browser.enabled=false
```

Run broader validation before handoff closeout:

```bash
pnpm --filter @blue/app test
pnpm --filter @blue/app build
pnpm --filter @blue/data test -- --maxWorkers=1
git diff --check
./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks
```

## Manual Scenarios

### Scenario 1: Generic And Comment Bars

1. Open or create a project with `GenericScore`, `PatternObject`, `NotationObject`, and `Comment` objects.
2. Confirm generic objects use Java-style fill, border, selected state, readable text, and repeat markers where applicable.
3. Confirm comments use italic labels and do not draw repeat markers.
4. Resize rows below and above 20px and confirm labels appear only at Java-compatible heights.

### Scenario 2: Letter Renderer Bars

1. Open or create objects for `LineObject`, `ZakLineObject`, `External`, `Instance`, `PythonObject`, `JavaScriptObject`, `JMask`, `Sound`, and `TrackerObject`.
2. Confirm each bar renders the correct Java letter badge.
3. Confirm labels start after the badge and remain clipped in narrow bars.
4. Confirm unavailable Java-only mappings such as Clojure are explicit fallbacks, not silent false parity.

### Scenario 3: PianoRoll Thumbnail

1. Open a PianoRoll with notes across multiple pitches.
2. Confirm note thumbnails appear below the title band when the row is tall enough.
3. Switch or load examples using `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, and `NONE` behavior.
4. Confirm note x positions, clipping, and repeat windows match Java Blue behavior.

### Scenario 4: AudioFile And FrozenSoundObject Waveforms

1. Open `AudioFile` and `FrozenSoundObject` score objects with valid audio paths.
2. Confirm bars draw waveform data using Java-style color contrast and selected-state header behavior.
3. Test a missing file path and confirm the bar remains stable with no waveform data.
4. For `FrozenSoundObject`, confirm extended-duration shading appears when original duration metadata is available.

### Scenario 5: AudioClip Waveform And Fades

1. Open an `AudioLayerGroup` with one or more `AudioClip` items.
2. Confirm clip bars use translucent background, waveform, label, and border behavior matching Java Blue.
3. Change `fileStartTime` and `looping` through the existing editor and confirm waveform offset/looping display updates.
4. Set fade-in and fade-out durations and each fade type; confirm fade polygons visually update.

## Completion Criteria

- All functional requirements in `spec.md` are represented in `tasks.md`.
- Focused renderer and contract tests pass.
- Existing score interaction tests pass.
- Manual scenarios are recorded in `status.md` during closeout.
