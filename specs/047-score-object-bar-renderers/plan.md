# Implementation Plan: ScoreObject BarRenderer Parity

**Branch**: `047-score-object-bar-renderers`  
**Date**: 2026-05-21  
**Spec**: `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/spec.md`  
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/spec.md`

## Summary

Implement Java Blue parity for score-object timeline bar rendering. The feature replaces the current generic DOM bars with a typed renderer registry covering Java's generic, comment, letter, PianoRoll, AudioFile, FrozenSoundObject, and AudioClip bar renderer families. It extends score-row snapshots with renderer payloads, adds focused renderer tests per Java mapping, and introduces current Java-style waveform/fade helpers in `@blue/app` while keeping `@blue/data` pure and ready for a later waveform redesign.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x  
**Primary Dependencies**: `@blue/data`, React 19 renderer components, Zustand 5.x project store, Dockview 5.2.0 score workbench shell, Vitest 4.x, existing Electron main/preload IPC if waveform file access requires it  
**Storage**: Existing in-memory `BlueData` project model and `.blue` XML; waveform cache data is derived app state only and is not persisted  
**Testing**: Vitest unit and renderer tests, existing `@blue/app` and `@blue/data` suites, manual Score panel parity scenarios  
**Target Platform**: Electron desktop app renderer/main/preload packages  
**Project Type**: Desktop app monorepo feature  
**Performance Goals**: Timeline bar rendering remains stable for visible score objects; waveform lookups are cached by file path and pixel scale to avoid repeated decode work during zoom and repaint  
**Constraints**: No Node built-ins, UI dependencies, dynamic imports, or waveform data in `@blue/data`; preserve Java `.blue` compatibility; preserve existing score selection/drag/resize/context-menu behavior; implement current Java waveform approach only, leaving future waveform redesign out of scope  
**Scale/Scope**: Score timeline bar rendering for all Java bar renderer families currently relevant to TypeScript score objects, plus explicit fallback documentation for Java-only/unsupported mappings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-first, UI-separated**: PASS. Renderer payloads are derived from `BlueData`, but drawing, waveform cache, and fade UI helpers live in `@blue/app`, not `@blue/data`.
- **Backwards-compatible serialization**: PASS. No `.blue` XML schema changes are required; snapshot additions are derived.
- **JVM dependencies preserved**: PASS. Python/Clojure runtime behavior is not changed. Clojure rendering remains explicit fallback until data support exists.
- **Engine as external process**: PASS. No engine protocol changes.
- **Test-first for serialization**: PASS. This feature does not alter serialization; contract tests focus on derived snapshot payloads and renderer parity.
- **Research integration**: PASS. Research is anchored to Java view classes and current TypeScript timeline code.

No constitution violations are expected.

## Project Structure

### Documentation (this feature)

```text
specs/047-score-object-bar-renderers/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
packages/blue-app/src/shared/
└── project-editor.ts

packages/blue-app/src/renderer/components/workbench/panels/score/
├── layer-groups/
│   ├── ScoreTimeCanvas.tsx
│   └── AudioLayerGroupCanvas.tsx
└── bar-renderers/
    ├── [new] ScoreObjectBar.tsx
    ├── [new] renderer-registry.tsx
    ├── [new] GenericScoreObjectBar.tsx
    ├── [new] CommentScoreObjectBar.tsx
    ├── [new] LetterScoreObjectBar.tsx
    ├── [new] PianoRollScoreObjectBar.tsx
    ├── [new] AudioFileScoreObjectBar.tsx
    ├── [new] FrozenSoundObjectBar.tsx
    ├── [new] AudioClipBar.tsx
    ├── [new] color-utils.ts
    ├── [new] repeat-marker-utils.ts
    ├── [new] piano-roll-thumbnail-utils.ts
    ├── [new] audio-fade-renderer.ts
    └── [new] waveform-cache.ts

packages/blue-app/src/renderer/tests/
├── [new] score-object-bar-renderer-contract.test.ts
├── [new] score-object-bar-renderers.test.tsx
└── [new] audio-clip-bar-renderer.test.tsx
```

Optional if waveform file access requires main/preload IPC:

```text
packages/blue-app/src/main/
└── main.ts

packages/blue-app/src/preload/
└── preload.ts

packages/blue-app/src/renderer/types/
└── global.d.ts
```

**Structure Decision**: Keep score-object bar rendering in the existing Score panel renderer subtree. Shared snapshots stay in `project-editor.ts`; waveform cache and fade helpers stay in renderer/app code. No new package is required.

## Implementation Phases

### Phase 1: Java Inventory And Snapshot Contract

- Confirm every Java renderer source listed in `research.md`.
- Extend `ScoreRowObjectSnapshot` with `barRenderer`.
- Add snapshot creation helpers for generic, comment, letter, PianoRoll, AudioFile, FrozenSoundObject, AudioClip, and fallback payloads.
- Add focused contract tests before renderer implementation.

### Phase 2: Shared Renderer Infrastructure

- Add color/contrast helpers matching Java bright/dark behavior.
- Add generic base renderer, repeat marker helper, comment renderer, letter renderer, and registry.
- Replace inline score-object bar JSX in `ScoreTimeCanvas` with `ScoreObjectBar` while preserving existing pointer and context-menu behavior.

### Phase 3: Generic, Comment, And Letter Parity

- Implement `GenericView`, `CommentView`, and `LetterRendererView` parity.
- Add separate mapping tests for `GenericScore`, `PatternObject`, `NotationObject`, `Comment`, `LineObject`, `ZakLineObject`, `External`, `Instance`, `PythonObject`, `JavaScriptObject`, `JMask`, `Sound`, `TrackerObject`, and fallback cases for absent Java-only mappings.

### Phase 4: PianoRoll Thumbnail Parity

- Add PianoRoll note summary payloads.
- Implement thumbnail utility and renderer branches for `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, and `NONE`.
- Validate empty, single-pitch, short-row, and clipped-note cases.

### Phase 5: Audio Waveform And Fade Parity

- Add Java-style waveform cache/drawing helper under `@blue/app`.
- Implement AudioFile and FrozenSoundObject renderers.
- Implement Java `FadeRenderer` math and AudioClip renderer with file-start offset, looping, and fade polygons.
- Replace `AudioLayerGroupCanvas` simple clip bars with the AudioClip bar renderer or route through shared `ScoreObjectBar`.

### Phase 6: Validation And Handoff

- Run focused renderer and contract tests.
- Run existing score interaction tests, broader `@blue/app` validation, `@blue/data` validation if touched, and `git diff --check`.
- Record manual parity scenarios and any intentional deferrals in `status.md`.

## Testing Strategy

- Contract tests cover `barRenderer` payload creation for every supported mapping.
- Renderer tests cover visual semantics by querying DOM/canvas output where possible and by testing pure renderer helper geometry/color outputs.
- Fade tests compare Java formula outputs for all fade types.
- Waveform tests use deterministic fake waveform cache entries and missing/loading states.
- Existing score interaction tests catch selection, drag, resize, and context-menu regressions.

## Acceptance Gate

Spec 047 is ready for implementation when:

- `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/score-object-bar-renderer-surface.md`, `quickstart.md`, `tasks.md`, and `status.md` are present.
- `tasks.md` contains separate parity tasks for each renderer family and Java mapping.
- `.specify/feature.json` points to `specs/047-score-object-bar-renderers`.
- The active branch is `047-score-object-bar-renderers`.

## Complexity Tracking

No violations.
