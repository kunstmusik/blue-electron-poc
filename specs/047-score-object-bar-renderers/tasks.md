# Tasks: ScoreObject BarRenderer Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/score-object-bar-renderer-surface.md, quickstart.md  
**Tests**: Required by FR-018 and FR-019. Add or update tests before implementing the behavior they validate.

**Organization**: Tasks are grouped by user story so generic/comment/letter bars, PianoRoll thumbnails, audio waveform bars, and renderer contract hardening can be implemented and validated independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: User-story label from the feature spec.
- Every task includes an exact file path.

---

## Phase 1: Setup (Java Inventory And Current TypeScript Surface)

**Purpose**: Confirm Java parity anchors and current TypeScript score rendering seams before code changes.

- [x] T001 Review Java common view dispatch in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/SoundObjectView.java` and `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/SoundObjectViewFactory.java`
- [x] T002 [P] Review Java generic renderer and GenericViewable implementors in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/GenericView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/GenericViewable.java`, `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/GenericScore.java`, `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/PatternObject.java`, and `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/NotationObject.java`
- [x] T003 [P] Review Java comment renderer in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/CommentView.java`
- [x] T004 [P] Review Java letter renderer and each letter mapping in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/LetterRendererView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/AbstractLineObjectView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/ExternalView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/InstanceView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/JMaskView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/JavaScriptObjectView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/ObjectBuilderView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/PythonObjectView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/SoundView.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/TrackerObjectView.java`, and `/Users/stevenyi/work/nbprojects/blue/blue-clojure/src/main/java/blue/clojure/soundObject/ClojureObjectView.java`
- [x] T005 [P] Review Java PianoRoll thumbnail renderer in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/PianoRollView.java`
- [x] T006 [P] Review Java AudioFile and FrozenSoundObject waveform renderers in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/AudioFileView.java` and `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/FrozenSoundObjectView.java`
- [x] T007 [P] Review Java AudioClip waveform, fade, and layer background rendering in `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioClipPanel.java`, `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/FadeHandle.java`, `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/FadeRenderer.java`, and `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioLayersPanel.java`
- [x] T008 [P] Inventory current TypeScript score row snapshots and timeline bars in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/AudioLayerGroupCanvas.tsx`

---

## Phase 2: Foundational (Snapshot Contract And Renderer Dispatch)

**Purpose**: Add the typed renderer payload and dispatch surface required by every bar renderer.

**Critical**: No user story renderer work should begin until this phase is complete.

### Tests

- [x] T009 [P] Add contract tests for generic and comment `barRenderer` payload creation in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderer-contract.test.ts`
- [x] T010 [P] Add contract tests for every letter mapping and unsupported Clojure fallback in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderer-contract.test.ts`
- [x] T011 [P] Add contract tests for PianoRoll, AudioFile, FrozenSoundObject, AudioClip, and generic fallback payload creation in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderer-contract.test.ts`

### Implementation

- [x] T012 Add `ScoreObjectBarRendererSnapshot` union types to `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T013 Extend `ScoreRowObjectSnapshot` with `barRenderer` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T014 Implement Java-compatible label splitting and repeat-point snapshot helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T015 Implement generic and comment bar payload creation for `GenericScore`, `PatternObject`, `NotationObject`, and `Comment` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T016 Implement letter bar payload creation for `LineObject`, `ZakLineObject`, `External`, `Instance`, `PythonObject`, `JavaScriptObject`, `JMask`, `Sound`, and `TrackerObject` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T017 Implement ObjectBuilder and Clojure explicit fallback payload handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T018 Implement PianoRoll bar payload creation with notes, scale-degree count, notes duration, time behavior, and repeat point in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T019 Implement AudioFile, FrozenSoundObject, and AudioClip bar payload creation in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T020 Export score bar renderer snapshot types through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/types.ts`

**Checkpoint**: Every score row and audio clip has a deterministic bar-renderer payload and contract tests fail until each payload is implemented.

---

## Phase 3: Shared Renderer Infrastructure

**Purpose**: Create reusable Java-style drawing helpers and route timeline bars through the renderer registry.

### Tests

- [x] T021 [P] Add color, contrast, label, and repeat-marker helper tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`
- [x] T022 [P] Add renderer registry dispatch tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`

### Implementation

- [x] T023 [P] Implement Java-style RGB conversion, brighten, darken, and readable text helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/color-utils.ts`
- [x] T024 [P] Implement repeat marker geometry helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/repeat-marker-utils.ts`
- [x] T025 Implement `renderer-registry` dispatch for all `ScoreObjectBarRendererSnapshot.kind` values in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/renderer-registry.tsx`
- [x] T026 Implement shared `ScoreObjectBar` wrapper that preserves absolute positioning, clipping, selection z-index, and pointer-event behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/ScoreObjectBar.tsx`
- [x] T027 Replace inline score-object bar JSX with `ScoreObjectBar` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`

**Checkpoint**: ScoreTimeCanvas uses registry-based bars without changing score selection, drag, resize, or context-menu behavior.

---

## Phase 4: User Story 1 - See Java-Style Generic ScoreObject Bars (Priority: P1) MVP

**Goal**: Render Java-compatible generic, comment, and letter bars for ordinary score objects.

**Independent Test**: Load all TypeScript-supported Java view mappings and verify the expected base renderer, label style, selected state, repeat markers, and letter badge.

### Tests for User Story 1

- [x] T028 [P] [US1] Add GenericView rendering tests for fill, border, selected header, label splitting, row-height label gate, and repeat markers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`
- [x] T029 [P] [US1] Add CommentView rendering tests for italic labels and no repeat markers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`
- [x] T030 [P] [US1] Add LetterRendererView badge geometry and selected-state tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`
- [x] T031 [P] [US1] Add per-type letter mapping tests for `LineObject`, `ZakLineObject`, `External`, `Instance`, `PythonObject`, `JavaScriptObject`, `JMask`, `Sound`, and `TrackerObject` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderer-contract.test.ts`

### Implementation for User Story 1

- [x] T032 [US1] Implement Java `GenericView` parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/GenericScoreObjectBar.tsx`
- [x] T033 [US1] Implement Java `CommentView` parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/CommentScoreObjectBar.tsx`
- [x] T034 [US1] Implement Java `LetterRendererView` parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/LetterScoreObjectBar.tsx`
- [x] T035 [US1] Verify `GenericScore` uses `generic` payload and renderer in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T036 [US1] Verify `PatternObject` uses `generic` payload and renderer in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T037 [US1] Verify `NotationObject` uses `generic` payload and renderer in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T038 [US1] Verify `Comment` uses `comment` payload and renderer in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T039 [US1] Verify `LineObject` and `ZakLineObject` use `letter: "L"` payloads in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T040 [US1] Verify `External` uses `letter: "E"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T041 [US1] Verify `Instance` uses `letter: "I"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T042 [US1] Verify `PythonObject` uses `letter: "P"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T043 [US1] Verify `JavaScriptObject` uses `letter: "J"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T044 [US1] Verify `JMask` uses `letter: "J"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T045 [US1] Verify `Sound` uses `letter: "S"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T046 [US1] Verify `TrackerObject` uses `letter: "T"` payload in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T047 [US1] Implement explicit `ObjectBuilder` fallback or `letter: "O"` support based on available `@blue/data` support in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T048 [US1] Implement explicit `ClojureObject` Java-only fallback documentation in renderer fallback output in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/GenericScoreObjectBar.tsx`

**Checkpoint**: User Story 1 is complete when every generic/comment/letter Java mapping is either rendered with parity or explicitly tested as fallback.

---

## Phase 5: User Story 2 - See PianoRoll Note Thumbnails In Bars (Priority: P1)

**Goal**: Extend generic bars with Java `PianoRollView` note-thumbnail rendering.

**Independent Test**: Load PianoRoll objects under every time behavior branch and verify Java-compatible note thumbnail behavior.

### Tests for User Story 2

- [x] T049 [P] [US2] Add PianoRoll payload contract tests for notes, scale-degree count, notes duration, repeat point, and time behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderer-contract.test.ts`
- [x] T050 [P] [US2] Add PianoRoll thumbnail utility tests for min/max note cache, note-height clamp, and vertical scaling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`
- [x] T051 [P] [US2] Add PianoRoll renderer tests for `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, `NONE`, empty notes, and short-row fallback in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`

### Implementation for User Story 2

- [x] T052 [US2] Implement PianoRoll thumbnail cache and geometry helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/piano-roll-thumbnail-utils.ts`
- [x] T053 [US2] Implement Java `PianoRollView` parity on top of generic rendering in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/PianoRollScoreObjectBar.tsx`
- [x] T054 [US2] Route `pianoRoll` registry entries to `PianoRollScoreObjectBar` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/renderer-registry.tsx`
- [x] T055 [US2] Verify PianoRoll bar rendering still coexists with nested score navigation affordances in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`

**Checkpoint**: User Story 2 is complete when PianoRoll bars show Java-style thumbnails without opening the ScoreObject editor.

---

## Phase 6: User Story 3 - See Java-Style Waveform Bars For Audio Objects (Priority: P1)

**Goal**: Implement current Java waveform and fade rendering for AudioFile, FrozenSoundObject, and AudioClip bars.

**Independent Test**: Load audio-backed score objects and audio clips with valid, loading, and missing waveform data and verify Java-compatible visual behavior.

### Tests for User Story 3

- [x] T056 [P] [US3] Add deterministic waveform cache tests for cache keys, loading state, missing data, and pixel-scale invalidation in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx`
- [x] T057 [P] [US3] Add AudioFile renderer tests for waveform request, color contrast, selected header, label, border, and missing-waveform fallback in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx`
- [x] T058 [P] [US3] Add FrozenSoundObject renderer tests for fixed frozen colors, waveform request, extended-duration shade, and unavailable original-duration fallback in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx`
- [x] T059 [P] [US3] Add Java fade math regression tests for `LINEAR`, `CONSTANT_POWER`, `SYMMETRIC`, `FAST`, and `SLOW` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx`
- [x] T060 [P] [US3] Add AudioClip renderer tests for translucent background, waveform offset, looping flag, fade polygons, label, border, selected state, and missing-waveform fallback in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx`

### Implementation for User Story 3

- [x] T061 [US3] Implement app-owned waveform cache types and lookup state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/waveform-cache.ts`
- [x] T062 [US3] Implement reusable waveform drawing helper for Java-style min/max summaries in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/waveform-cache.ts`
- [x] T063 [US3] Implement Java `AudioFileView` parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/AudioFileScoreObjectBar.tsx`
- [x] T064 [US3] Implement Java `FrozenSoundObjectView` parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/FrozenSoundObjectBar.tsx`
- [x] T065 [US3] Implement Java `FadeRenderer.getValue` parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/audio-fade-renderer.ts`
- [x] T066 [US3] Implement Java `AudioClipPanel` rendering parity in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/AudioClipBar.tsx`
- [x] T067 [US3] Route `audioFile`, `frozenSoundObject`, and `audioClip` registry entries in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/renderer-registry.tsx`
- [x] T068 [US3] Replace simple audio clip bars with `AudioClipBar` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/AudioLayerGroupCanvas.tsx`
- [x] T069 [US3] Add minimal waveform file-access IPC only if renderer-local file decoding cannot access project audio files in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`

**Checkpoint**: User Story 3 is complete when audio-backed bars match current Java Blue behavior and future waveform redesign remains isolated to waveform helpers.

---

## Phase 7: User Story 4 - Keep Renderer Data Canonical And Testable (Priority: P2)

**Goal**: Harden renderer payloads, fallback behavior, and existing score interactions after all renderer families exist.

**Independent Test**: Run contract, renderer, and existing score interaction suites and confirm no renderer family mutates canonical project data while drawing.

### Tests for User Story 4

- [x] T070 [P] [US4] Add fallback renderer tests for unknown, CSDSoundObject, unavailable ObjectBuilder, and Clojure-style object types in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderers.test.tsx`
- [x] T071 [P] [US4] Add regression tests proving score selection, drag, resize, context-menu, and copy/paste behavior still work with `ScoreObjectBar` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-panel.test.tsx`
- [x] T072 [P] [US4] Add snapshot immutability tests proving waveform data is not stored in `@blue/data` or `.blue` XML in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-bar-renderer-contract.test.ts`

### Implementation for User Story 4

- [x] T073 [US4] Ensure fallback rendering uses explicit reason text for testability without adding visible timeline noise in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/bar-renderers/GenericScoreObjectBar.tsx`
- [x] T074 [US4] Audit `ScoreTimeCanvas` pointer handlers after renderer extraction and keep event ownership unchanged in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`
- [x] T075 [US4] Audit `AudioLayerGroupCanvas` layout after AudioClip renderer integration and keep layer heights/separators stable in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/AudioLayerGroupCanvas.tsx`
- [x] T076 [US4] Update TypeScript exports and imports affected by `ScoreObjectBarRendererSnapshot` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/types.ts`

**Checkpoint**: User Story 4 is complete when renderer behavior is fully snapshot-driven and existing score editing workflows remain intact.

---

## Final Phase: Polish, Validation, And Handoff

**Purpose**: Validate the full feature and update handoff notes.

- [x] T077 [P] Update quickstart validation notes in `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/quickstart.md`
- [x] T078 [P] Update feature handoff status in `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/status.md`
- [x] T079 [P] Update project handoff state in `/Users/stevenyi/work/blue-electron/STATUS.md`
- [x] T080 Run focused score-object bar renderer tests from `/Users/stevenyi/work/blue-electron`
- [x] T081 Run existing score interaction tests from `/Users/stevenyi/work/blue-electron`
- [x] T082 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [x] T083 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [x] T084 Run `pnpm --filter @blue/data test -- --maxWorkers=1` from `/Users/stevenyi/work/blue-electron` if `@blue/data` is touched
- [x] T085 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [x] T086 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [x] T087 Perform manual scenarios from `/Users/stevenyi/work/blue-electron/specs/047-score-object-bar-renderers/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all renderer user stories.
- **Shared Renderer Infrastructure (Phase 3)**: Depends on Foundation and blocks visible renderer implementation.
- **US1 Generic/Comment/Letter (Phase 4)**: Depends on Shared Renderer Infrastructure and is the MVP.
- **US2 PianoRoll (Phase 5)**: Depends on generic base renderer and PianoRoll payloads.
- **US3 Audio/Waveform (Phase 6)**: Depends on renderer registry and audio payloads; can run after Phase 3 in parallel with US2.
- **US4 Canonical/Test Hardening (Phase 7)**: Depends on all renderer families selected for implementation.
- **Polish**: Depends on selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Requires Foundation and Shared Renderer Infrastructure.
- **US2 (P1)**: Requires generic renderer from US1 or the generic base portion of US1.
- **US3 (P1)**: Requires Foundation and Shared Renderer Infrastructure; independent of PianoRoll after shared registry exists.
- **US4 (P2)**: Depends on all P1 renderer families.

### Parallel Opportunities

- T002 through T008 can run in parallel.
- T009 through T011 can run in parallel.
- T023 and T024 can run in parallel.
- T028 through T031 can run in parallel.
- T049 through T051 can run in parallel.
- T056 through T060 can run in parallel.
- T070 through T072 can run in parallel.
- T077 through T079 can run in parallel during handoff updates.

## Parallel Example: Letter Mapping Verification

```text
Task: "T039 Verify LineObject and ZakLineObject use letter L payload in /Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts"
Task: "T040 Verify External uses letter E payload in /Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts"
Task: "T041 Verify Instance uses letter I payload in /Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts"
```

## Parallel Example: Audio Renderer Tests

```text
Task: "T057 Add AudioFile renderer tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx"
Task: "T058 Add FrozenSoundObject renderer tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx"
Task: "T059 Add Java fade math regression tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/audio-clip-bar-renderer.test.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3.
3. Complete US1 generic/comment/letter parity.
4. Stop and validate US1 manually and with focused tests before adding thumbnails and waveform rendering.

### Incremental Delivery

1. Deliver generic/comment/letter bars.
2. Add PianoRoll thumbnails.
3. Add AudioFile/FrozenSoundObject/AudioClip waveform and fade bars.
4. Add canonical/fallback hardening and full validation.

### Handoff Guidance

- Keep every renderer family independently testable.
- Do not change `.blue` XML to support rendering.
- Do not move waveform logic into `@blue/data`.
- Record any deferred Java interaction behavior, such as fade handles or alt-drag file-start edits, in `status.md`.
