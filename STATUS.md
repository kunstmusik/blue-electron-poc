# Project Status — blue-electron

**Date**: 2026-05-02
**Branch**: `034-mixer-editor-core`
**Note**: Historical spec sections below preserve their closeout-time branch and feature-context notes; only the topmost spec package reflects the current active handoff state.

## Spec 034 Package

Spec `034-mixer-editor-core` is complete and validated on branch `034-mixer-editor-core`.

- Goal: deliver the first usable mixer app-layer workflow by extending the project snapshot/patch bridge with mixer state, replacing the Mixer placeholder with a real workbench panel, loading the user's effects library from `~/.blue` into a mutable in-memory session without saving, and adding reusable non-modal effect editor windows
- Active feature context:
  - `.specify/feature.json` points to `specs/035-mixer-follow-up`
- Delivered scope:
  - mixer state now flows through `ProjectEditorSnapshot` and `ProjectDocumentPatch`, including effect comments and chain operations
  - `MixerTopComponent` now renders a real workbench mixer panel with arrangement-driven strip sync, chain authoring, and effect editor launch actions
  - the effects library loads from `~/.blue/effectsLibrary.xml` into a session-owned in-memory model with no disk writes
  - the native menu, preload bridge, and renderer store now expose effects-library and effect-editor entrypoints
  - dedicated non-modal effect editor windows reuse by effect id and owner type for both project-owned and library-owned effects
- Validation:
  - `pnpm --filter @blue/data test` — pass
  - `pnpm --filter @blue/app test` — pass
  - `pnpm --filter @blue/data build` — pass
  - `pnpm --filter @blue/app build:main` — pass
  - `pnpm --filter @blue/app build:preload` — pass
  - `pnpm --filter @blue/app build:renderer` — pass
  - `pnpm --filter @blue/app test -- src/renderer/tests/workbench-mixer-panel.test.tsx src/renderer/tests/mixer-chain-editing.test.tsx src/renderer/tests/mixer-effect-editor-contract.test.ts` — pass
  - `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` — pass for `specs/034-mixer-editor-core`
  - `git diff --check` — pass
- Handoff notes:
  - Spec `035-mixer-follow-up` remains the planned next slice for routing safety, advanced chain editing, richer no-save library workflow, and playback/window polish
  - SQLite and any other durable user-library storage redesign stay out of Spec 034
  - the Mixer panel, effects library modal, and effect editor window coverage is now backed by renderer and main-process tests, including dedicated mixer-workbench, chain-editing, and project-effect contract tests added during the closeout review
- Completion status:
  - implementation is complete and validated
  - the branch is ready for handoff

## Spec 033 Package

Spec `033-midi-input-virtual-keyboard-parity` is **complete** and validated on branch `033-midi-input-virtual-keyboard-parity`.

- Goal: implement the Java Blue-parity MIDI Input panel and Virtual Keyboard, integrated into the current workbench design and usable with Blue Live for live triggering
- Active feature context:
  - `.specify/feature.json` points to `specs/033-midi-input-virtual-keyboard-parity`
- Planning artifacts:
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/spec.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/plan.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/research.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/data-model.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/contracts/midi-input-virtual-keyboard-surfaces.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/quickstart.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/tasks.md`
  - `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/checklists/requirements.md`
- Scope anchors captured in the planning docs:
  - Java MIDI UI/runtime references: `MidiInputPanelTopComponent`, `MidiInputProcessorPanel`, `MidiInputEngine`, `VirtualKeyboardTopComponent`, and `VirtualKeyboardPanel`
  - Electron parity targets: toolbar MIDI Input action, `MidiInputPanelTopComponent`, `VirtualKeyboardTopComponent`, project snapshot/patch extension for `MidiInputProcessor`, and Blue Live note-event routing
- Delivered scope:
  - typed MIDI input snapshot/patch support now flows through `@blue/data`, project snapshots, and renderer state
  - Blue Live note-trigger routing now uses a shared MIDI mapping helper and a main-process IPC surface
  - the workbench now opens real MIDI Input and Virtual Keyboard panels from the toolbar and Dockview router
  - renderer coverage now includes the MIDI Input panel, Virtual Keyboard panel, and the MIDI Input toolbar action
  - UI polish and visual refinements applied per separate session
- Key implementation decisions:
  - use the existing project snapshot/patch bridge for MIDI Input panel edits
  - adapt `MidiInputProcessor` scale data through the typed `Scale` model instead of exposing raw XML in the renderer
  - add a pure `@blue/data` MIDI trigger mapping helper and a main-process Blue Live note-trigger IPC surface for the Virtual Keyboard
  - keep OS MIDI device enumeration and background hardware input explicitly deferred for a later slice
- Validation:
  - `pnpm build` — pass (all packages: @blue/data, @blue/engine-client, @blue/app)
  - `pnpm test` — pass (76 @blue/data tests, 2 @blue/engine-client tests, 42 @blue/app test files; 395 tests + 2 skipped)
  - `pnpm --filter @blue/data test -- src/midi/midi-input-processor.test.ts src/midi/midi-trigger-routing.test.ts` — pass
  - `pnpm --filter @blue/app test -- src/renderer/tests/blue-live-toolbar.test.tsx src/renderer/tests/midi-input-panel.test.tsx src/renderer/tests/virtual-keyboard-panel.test.tsx` — pass
  - `git diff --check` — pass (no whitespace/formatting issues)
- Manual verification completed:
  - load a project, adjust MIDI Input panel settings, turn on Blue Live, and trigger instruments using the Virtual Keyboard
- Completion status:
  - all tasks and requirements from the spec have been implemented and validated
  - ready for handoff to next feature slice; no additional work is required for this scope

## Spec 032 Package

Spec `032-blue-data-runtime-model-parity` is complete and validated on branch `032-blue-data-runtime-model-parity`.

- Goal: restore the remaining `@blue/data` runtime-model parity gaps for instrument/BSB generation, mixer XML and routing behavior, and time/automation semantics
- Active feature context:
  - `.specify/feature.json` points to `specs/032-blue-data-runtime-model-parity`
- Planning artifacts:
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/spec.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/plan.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/research.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/data-model.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/contracts/runtime-model-contract.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/quickstart.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/tasks.md`
  - `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/checklists/requirements.md`
- Task status: complete; `tasks.md` contains 38 checked tasks across Setup, Foundational, User Story 1, User Story 2, User Story 3, and Polish phases
- Delivered scope:
  - BSB now accepts `bsbParameterList` XML, applies replacements to instrument/global/always-on text, and preserves preset/grid data through the final parity checks
  - Mixer XML now round-trips channels, subchannels, master channel, extra render time, and channel metadata with Java-compatible list attributes
  - Tempo maps now sort beat-based points deterministically, and time context/state parsing preserves exact SMPTE values and deep-copied meter maps
  - Runtime-model regression coverage now includes shared fixtures and parity tests for BSB, mixer, instruments, automation, and time behavior
- Validation:
  - `pnpm --filter @blue/data test` — pass
  - `pnpm --filter @blue/data build` — pass
  - `git diff --check` — pass
- Handoff notes:
  - keep the slice inside `packages/blue-data`; renderer/Electron behavior remains out of scope
  - use the Java source anchors in `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/research.md` as the source of truth for behavior mismatches
  - start with failing fixture/tests before model changes, per the constitution
  - keep `.specify/feature.json` aligned to the active spec while this branch is in use
  - this branch is ready for handoff to the next session if additional polish or follow-on work is needed

## Spec 031 Package

Spec `031-blue-data-csd-render-parity` is complete and validated on branch `031-blue-data-csd-render-parity`.

- Goal: restore Java-compatible `BlueData.toCSD()` pipeline behavior, including compile-time context, macro/render-boundary handling, UDO/table parity, automation/channel initialization, and copy-safe deterministic generation
- Active feature context:
  - `.specify/feature.json` points to `specs/031-blue-data-csd-render-parity`
- Planning artifacts:
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/spec.md`
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/plan.md`
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/research.md`
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/data-model.md`
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/contracts/csd-render-contract.md`
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/quickstart.md`
  - `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/tasks.md`
- Task status: complete; `tasks.md` contains 38 tasks and all are checked
- Delivered scope:
  - `BlueData.toCSD()` / `toBlueLiveCSD()` now render from copied arrangement/mixer/table snapshots with isolated compile context per invocation
  - Java-compatible UDO merge/collision renaming and opcode reference rewriting across arrangement instruments and mixer effects
  - Java-compatible ftable number reservation/allocation and deterministic repeated-run ordering
  - Java-compatible render boundary handling, tempo-map emission fallback behavior, and score macro preprocessing
  - Java-compatible always-on scheduling via source-id semantics and explicit BlueMixer score scheduling
  - Audio layer compile path now uses compile-time instrument IDs (no `INSTR_ID` placeholders)
  - Dedicated parity/copy-safety/determinism test coverage added under `packages/blue-data/src/*csd-*.test.ts` plus shared fixture/comparison helpers
  - Normalization and fixture guidance updated in `specs/031-blue-data-csd-render-parity/quickstart.md`
- Automation parity note:
  - For the API render path represented by the Java fixture set, parity is parameter/string-channel init+export behavior without additional automation score instrument emission.
  - Adding automation score emission in this path produced deterministic parity regressions against `demo2026` Java output and was intentionally not kept.
- Validation:
  - `pnpm --filter @blue/data test` — 69 files / 697 tests pass
  - `pnpm --filter @blue/data build` — pass
  - `git diff --check` — pass
- Scope boundaries:
  - keep Spec 031 strictly in `@blue/data` render-generation and compile-context behavior
  - do not fold renderer/Electron menu flows into this slice
  - defer runtime/editor model parity concerns to Spec 032

## Spec 030 Package

Spec `030-blue-data-note-processing-parity` is complete and validated.

- Goal: restore Java-compatible score-text parsing, note timing semantics, note-processor XML round-trip behavior, named chain persistence, and high-risk processor execution behavior in `@blue/data`
- Delivered scope:
  - Java-compatible score parser with carry (`.`), `+` start-time expansion, ramp (`<`/`>`) expansion, continuation-line support, bracketed-expression evaluation, comments, and tied-note handling
  - `Note` class with Java-parity pfield seeding/carry, lowercase `i` parsing, `setStartTime()` p2 sync, `isTied`, `getObjectiveDuration`, `getEndTime`, `getPCount`, and bracket expression evaluation
  - `NoteList` with Java-parity `add`, `get`, `size`, `sort`, `clear`, `removeIf`, `normalizeNoteList`
  - All 18 note processors saving with Java full class names (e.g., `blue.noteProcessor.AddProcessor`) and loading both short and full class names
  - `NoteProcessorChainMap` using Java-compatible `<npc>` wrapper elements with legacy `<noteProcessorChain>` fallback
  - `UnsupportedProcessor` for lossless preservation of unknown processor types and nested XML payloads, including `PythonProcessor`
  - `GenericScore` unified on shared `getNotes()` parser (no bespoke parse path)
  - `ValueTimeMapper` kept as a helper-only type so the processor registry matches Java's line-processor model
  - `applyTimeBehavior` uses `getObjectiveDuration()` for duration calculations matching Java
  - `getBaseTen()` pch utility for `PchAddProcessor`, `PchInversionProcessor`
  - Processor implementations match Java in-place mutation semantics and exception behavior
- Planning artifacts:
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/spec.md`
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/plan.md`
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/research.md`
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/data-model.md`
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/contracts/note-processing-contract.md`
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/quickstart.md`
  - `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/tasks.md`
- Task status: complete; all 40 tasks marked done
- Validation:
  - `pnpm --filter @blue/data test` — 679 tests pass
  - `pnpm --filter @blue/data build` — clean
  - `pnpm --filter @blue/app build` — clean
  - `git diff --check` — clean
- Handoff notes:
  - Spec 031 (CSD render parity) should build on the restored parser and processor semantics
  - `TimeWarpProcessor` uses a simplified inline tempo-map; full `TempoMap` integration may be needed for complex warp strings
  - `TuningProcessor` uses simplified tuning table handling; complex scale lookups may need further work
  - `Code` processor preserves XML but does not execute code
  - `UnsupportedProcessor` preserves unknown types losslessly for future execution support

## Spec 029 Package

Spec `029-blue-data-score-library-parity` is complete and validated.

- Goal: restore Java-compatible score graph, library-backed reference behavior, and sound-object XML interoperability for `@blue/data`
- Delivered scope:
  - Java-compatible score and library loading/saving for `Instance`, `GenericScore`, `PolyObject`, `PatternLayer`, and audio-layer structures
  - Java-compatible score/model copy semantics for `Score`, `SoundObjectLibrary`, `InstrumentLibrary`, and related registry helpers
  - removal of dynamic `require()` / `import()` usage from the blue-data slice in favor of static module wiring
  - regression coverage for score/library, registry, and migration behavior
- Planning artifacts:
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/spec.md`
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/plan.md`
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/research.md`
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/data-model.md`
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/contracts/score-library-contract.md`
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/quickstart.md`
  - `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/tasks.md`
- Branch status: currently on `029-blue-data-score-library-parity`
- Task status: complete; `tasks.md` contains 37 tasks and all are complete
- High-risk implementation files:
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/instance.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-library.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/sound-layer.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-registry.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-utilities.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/pattern-layer.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer.ts`
- Validation completed:
  - `pnpm --filter @blue/data test`
  - `pnpm --filter @blue/app test`
  - `git diff --check`
- Handoff notes:
  - Keep 029 focused on score/library/sound-object model parity; do not absorb note processor semantics from Spec 030
  - Pattern/audio layer XML compatibility is in-scope despite Java module boundaries
  - Prefer centralized Java full-class-name normalization over one-off loader patches
  - Spec 028 is already marked complete and should be treated as a prerequisite baseline for this slice
  - This slice is closed out; remaining work is future-spec scope only

## Spec 028 Package

Spec `028-blue-data-xml-preservation` is complete and validated.

- Delivered scope:
  - Java-compatible root `BlueData` load/save behavior for the in-scope sections
  - legacy root migration for `udo`, `timeContext`, and project property aliases
  - preservation of opaque root XML payloads such as `pluginData`
  - omitted-mixer handling that matches Java Blue behavior
  - `BlueData.deepCopy()` parity for the root document, including score state and root layer groups
- Validation:
  - `pnpm --filter @blue/data test`
  - `git diff --check`
- Notes:
  - `instrumentLibrary` is loaded for root compatibility but remains intentionally omitted from save output, matching the Java reference
  - deeper model semantics for later parity slices remain deferred to the later specs

## Spec 027 Package

Spec `027-blue-live-part1` is complete and closed out.

- Goal: Blue Live lifecycle/output routing, Live Space / Live Code / Options editor surfaces, settings window, and Evaluate Code routing for Global Orchestra, Global Score, and Blue Live Live Code
- Implemented in this pass:
  - Blue Live output batching bug fixed so the `Csound (Blue Live)` output tab now receives lines again
  - Live Code uses CodeMirror ORC with explicit `Cmd-Enter` / `Ctrl-Enter` bindings and transient flash styling
  - Evaluate Code now uses selected text when present, otherwise current context
  - ORC context fallback: enclosing `instr` / `opcode` block when inside one, otherwise the current line
  - SCO context fallback: current line
  - Native application menu / Settings window helper coverage added alongside renderer and main-process lifecycle tests
  - Live Space Trigger remains intentionally deferred with a `not yet implemented` alert until the Score implementation owns trigger-note routing
- Verification completed:
  - `pnpm --filter @blue/data test`
  - `pnpm --filter @blue/app test`
  - `pnpm --filter @blue/app build`
  - `git diff --check`
  - Manual Blue Live toolbar, parallel engine, Recompile/All Notes Off, editor, Settings, and Evaluate Code scenarios
- Deferred scope:
  - Live Space trigger-note routing remains deferred to the later Score implementation
- Working tree note:
  - The repo is intentionally dirty with the Spec 027 edits plus the pre-existing untracked `BLUE_DATA_COMPATIBILITY_REPORT_*.md` files that were not part of this pass

## Spec 026 Package

Spec `026-tables-udo-csd` is complete and closed out.

- Goal: add a project Tables editor, a shared project UDO workspace, and native Project menu CSD generation actions while keeping user UDO library support deferred
- Planning / implementation artifacts: `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/spec.md`, `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/plan.md`, `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/research.md`, `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/contracts/`, `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/tasks.md`
- Completed scope: project-backed Tables editor, shared `UdoWorkspacePanel` with Java-style table/editor reuse and indexed row selection, UDO style conversion and generated-code preview, BSB and project UDO panel reuse, generated CSD screen/disk commands, and the renderer/main IPC bridges needed to wire them through the current project snapshot
- Validation status: focused `pnpm --filter @blue/data test` and `pnpm --filter @blue/app test` passes were rerun for the wrapper-layer fixes, and the earlier Spec 026 `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` validation remains the closeout baseline
- Deferred scope: user/global UDO library support, any richer Java Project menu parity beyond the generation actions already implemented, and any future tables/UDO enhancements beyond this slice
- Immediate next step: none for Spec 026; remaining work is future-spec scope only

## Spec 025 Package

Spec `025-output-window` is complete and closed out. The implementation slice adds the dockable Output window, the renderer-owned tabbed output store, the IPC bridge for engine stdout/stderr, and the virtualized output panel UI used to review playback output after a session ends.

- Goal: mirror the Java Blue Output Window with a dockable bottom-edge output panel that shows realtime Csound stdout/stderr, preserves output per named tab, and remains usable for long engine sessions
- Planning / implementation artifacts: `/Users/stevenyi/work/blue-electron/specs/025-output-window/spec.md`, `/Users/stevenyi/work/blue-electron/specs/025-output-window/plan.md`, `/Users/stevenyi/work/blue-electron/specs/025-output-window/research.md`, `/Users/stevenyi/work/blue-electron/specs/025-output-window/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/025-output-window/contracts/io-provider-api.md`, `/Users/stevenyi/work/blue-electron/specs/025-output-window/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/025-output-window/tasks.md`
- Completed scope: shared IOProvider and output-tab types, renderer output store, preload IPC listeners, engine output forwarding, bottom-edge workbench registration, OutputPanel rendering, slideout reuse, output-store tests, and auxiliary-layout validation for the output edge during reorganizations
- Validation status: focused Vitest regressions for output store behavior, auxiliary drag/drop inference, slideout rendering, and workbench auxiliary layout passed during implementation
- Manual validation: the user verified the output window and auxiliary layout behavior after the last fix pass, with no remaining visible jank
- Immediate next step: none for Spec 025; remaining work is future-spec scope only

## Spec 024 Package

Spec `024-bsb-performance` is complete and closed out. The implementation slice reduced BSB render churn by preserving store identity for untouched orchestra state, narrowing renderer subscriptions, separating live BSB control from document commits, and memoizing the hot widget shells.

- Goal: remove the remaining BlueSynthBuilder UI jank by separating live BSB control from document commits, preserving identity across single-widget edits, and narrowing renderer invalidation to the affected subtree only
- Planning / implementation artifacts: `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/spec.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/plan.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/contracts/bsb-performance-surface.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/tasks.md`
- Completed scope: store identity regression coverage, batch document commit transport, realtime BSB control updates, explicit failure recovery via canonical project resync, structural-sharing orchestra and widget-tree updates, renderer boundary isolation, widget memo boundaries, jsdom-based render isolation tests, transport regression tests, and the related spec-task updates
- Validation status: `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `pnpm --filter @blue/data test`, and `git diff --check` pass
- Manual validation: the app was checked with dev tools closed and the remaining jank was no longer noticeable
- Immediate next step: none for Spec 024; remaining work is future-spec scope only

## Spec 023 Package

Spec `023-bsb-widget-ui` is complete. The implementation pass and final manual verification pass are done, and the remaining work in the repo is future-spec scope only. Recent follow-up work after the review synthesis restored the highest-value Java parity contracts and cleaned up the remaining editor-side behavior gaps without reopening the broader widget-rendering slice.

- Goal: replace the generic placeholder widget boxes with Java Blue-parity widget-specific visual rendering for all 15 BSB widget types in both edit and non-edit mode; close out `@blue/data` model property gaps identified against Java `*BeanInfo.java` descriptors; deliver typed per-widget property sheet panels that expose the same fields as Java Blue's property sheet
- Planning / implementation artifacts: `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/spec.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/plan.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/research.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/contracts/bsb-widget-ui-surface.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/quickstart.md`
- Completed scope: 15 widget renderers (non-edit and edit mode), generic dynamic property sheet with BeanInfo filtering plus BeanInfo-to-model key translation, resize handles, drag-to-move, canvas context menu (add/remove widgets), CSS grid overlay optimization, Java-compatible XML save/preset handling for BSB text/value/dropdown/checkbox/XY/slider-bank/line-object widgets, preset application fixes with widget-specific `getPresetValue`/`setPresetValue`, runtime value setting with parameter sync, randomize support, engine-client request queueing, project-store patch batching, instance-scoped BSB widget clipboard behavior, runtime `BSBTextField` commit-on-blur/Enter editing, `BSBFileSelector` browse/clear/copy-to-media/drop handling, slider-bank runtime editing with snapshot/XML persistence, `BSBLineObject` line serialization plus point-editing/line-selection behavior, and runtime compile-parity fixes for parameter-backed checkbox/dropdown/XY controller/H- and V-slider bank widgets
- Known scope: `BSBEnvelopeGenerator` and `BSBTabbedPane` remain deferred
- Deferred to future specs: populated Java-style `BSBSubChannelDropdown` option sourcing until the renderer snapshot exposes mixer subchannel inventory; `BSBEnvelopeGenerator` and `BSBTabbedPane` remain deferred
- Validation: `pnpm --filter @blue/data test -- --run src/instruments/blue-synth-builder.test.ts` PASS; `pnpm --filter @blue/app test -- --run src/renderer/tests/bsb-interface-editor.test.tsx src/renderer/tests/bsb-property-validation.test.ts` PASS; earlier package-wide `pnpm --filter @blue/data build`, `pnpm --filter @blue/app build`, and `git diff --check` validation from the main SPEC 023 pass still stand
- Immediate next step: none for Spec 023; remaining work is deferred to future specs

## Spec 022 Package

Spec `022-bsb-interface-parity` is complete as the BSB editing infrastructure slice.

- Goal: establish the BSB editing infrastructure (canvas, property sheet, grid settings, preset management, UDO table/editor) that SPEC 023 will build upon for widget-specific rendering
- Planning / implementation artifacts: `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/contracts/bsb-interface-parity-surface.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/tasks.md`
- Implemented: BSB snapshot/patch plumbing, preset-group round-trip support, editable interface canvas with selection, synchronized property/grid sidebar shell, preset application bar, Java-style split-view UDO editor (UDOTable + UDOEditor with add/remove/copy/paste/move operations), optimistic patch handling, and test coverage
- Known gaps: the Interface tab still renders generic placeholder boxes instead of widget-specific controls (Slider, Knob, Toggle, SoundFile, etc.). Widget-specific rendering is deferred to SPEC 023.
- Validation: `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` pass
- Handoff focus: SPEC 023 will implement widget-specific rendering using the infrastructure established in this slice
- Immediate next step: start SPEC 023 for individual BSB widget rendering (Slider, Knob, Toggle, SoundFile, etc.)

## Spec 021 Package

Spec `021-orchestra-editor` is complete and closed out for `blue-app`.

- Goal: replace the Orchestra placeholder with a Java Blue-style arrangement/library-left and instrument-editor-right surface
- Scope completed: nested draggable splitters, TanStack-backed arrangement table, inline enabled/id editing, row context actions with deferred import/export placeholders, selected instrument editor/comments tabs, GenericInstrument and JavaScriptInstrument code editors with explicit UDO placeholder tabs, BlueX7 baseline preservation editor, BlueSynthBuilder baseline editor, Python dummy panel, and temporary program-library placeholder
- Data compatibility: `@blue/data` now preserves instrument comments, JavaScriptInstrument, PythonInstrument, BlueX7, Java-compatible instrument assignments, and baseline BlueSynthBuilder `graphicInterface` XML
- Project bridge: `ProjectEditorSnapshot`, `ProjectDocumentPatch`, main-process patching, preload/global typing, and `project-store` now carry orchestra snapshots and patch intents
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/tasks.md` contains 55 completed tasks
- Validation status: `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` pass
- Explicit deferrals: program-wide orchestra library, `.binstr` import/export beyond placeholders, embedded opcode-list editing for Generic/JavaScript instruments, detailed BlueX7 parameter editor parity, Python execution/editor parity, and deeper Java BlueSynthBuilder layout/widget/preset/opcode-list parity
- Immediate next step: start Spec 022 planning for BlueSynthBuilder interface/widget/preset parity

## Spec 020 Package

Spec `020-main-toolbar-parity` is complete and closed out for `blue-app`.

- Goal: replace the renderer header with a Java Blue-style main toolbar and move file/window ownership into the native Electron menus
- Scope: transport controls, engine-authoritative playhead and selection displays, Blue Live buttons, native `File` menu ownership, native `Window` menu command routing, and window-title parity
- Specification status: complete in `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/spec.md`
- Planning status: complete; design artifacts are in `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/contracts/main-toolbar-parity-surface.md`, and `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/quickstart.md`
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/tasks.md` contains 27 tasks and all are complete
- Implementation status: complete; the Java-style toolbar shell, transport controls, playhead/selection display, native File and Window menu handling, and `Blue - [project.blue]` window titles are implemented
- Validation status: `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` all pass
- Remaining gap: playhead timing is intentionally hybrid for now, with engine-authored snapshots plus renderer interpolation; shared-memory transport remains deferred
- Immediate next step: start the next spec once a new follow-on scope is selected

## Spec 019 Package

Spec `019-csound-editor-parity` is complete for `blue-app`.

- Goal: add Java Blue Csound editor parity on top of the CodeMirror Global Orchestra editor from spec 018
- Scope: reliable Cut/Copy/Paste, Java Blue-style editor context menu insertions, first Java Blue-derived completion/hint parity pass, and reusable editor helpers for future Csound text surfaces
- Specification status: complete draft in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/spec.md`
- Planning status: complete; design artifacts are in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/contracts/csound-editor-parity-surface.md`, and `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/quickstart.md`
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/tasks.md` contains 37 tasks and all are complete
- Implementation status: complete; clipboard reliability, Java Blue-style editor context-menu insertions, completion/hint baseline, and reusable editor surface support are implemented
- Validation status: `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` all pass
- Remaining gap: project-level UDO completion is deferred
- Immediate next step: start the next Csound editor parity slice focused on any remaining Java Blue feature gaps and deeper tooling parity

### Java Reference Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/BlueVariablesMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/OpcodesMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/BlueOpcodesMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/editor/actions/CodeRepositoryMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/editor/actions/AddToCodeRepositoryAction.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/CsoundOrcCompletionProvider.java`

### Planning Notes

- Use a renderer-owned context menu first, likely Radix-backed, because the menu needs direct CodeMirror selection and insertion state.
- Review Electron standard Edit menu roles for clipboard reliability; native menus may be needed for keyboard/platform behavior, but should not replace the Java Blue-style editor context menu by default.
- Blue Variables and Blue Opcodes are high-confidence implementation targets for this slice.
- Opcodes, Custom, and Add to Code Repository may be full, partial, or explicitly disabled/deferred depending on available metadata and repository storage support.
- Completion parity now covers document-local Csound variables, Blue Variables/Blue Opcodes entries, and document-local UDO names; project-level UDO support is deferred.
- Completion implementation now uses the CodeMirror Csound rich opcode catalog for Java Blue-shaped opcode rows and manual-summary help text, scans document-local Csound variables using the Java prefix rules, supports document-local UDO names, and exposes optional BSB replacement-key completion context for future BlueSynthBuilder editors. The package does not expose a standalone `opcodes.json`; the rich catalog module is the usable source.

## Spec 018 Package

Spec `018-csound-editor-tooling` is complete and committed as the CodeMirror editor-selection and Global Orchestra implementation slice for `blue-app`.

- Goal: choose and implement a richer editor for `GlobalOrchestraTopComponent` after evaluating CodeMirror plus `@kunstmusik/codemirror-lang-csound` against Monaco plus optional grammar/language-support work
- Constraint: Monaco adoption is no longer assumed mandatory; dynamic completion support is now an explicit decision criterion, and the selected editor must expose a documented path for project/runtime completion sources
- Specification status: revised for CodeMirror vs Monaco evaluation
- Planning status: revised; the 018 design package is now in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/plan.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/contracts/global-orchestra-editor-surface.md`, and `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/quickstart.md`
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/tasks.md` contains 20 completed tasks
- Implementation status: complete; CodeMirror is selected and implemented for `GlobalOrchestraTopComponent`
- Close-out status: complete; CodeMirror is active for `GlobalOrchestraTopComponent`, the current project load/edit/save path is preserved, and editor-selection research is documented
- Immediate next step: open the follow-on Java Blue Csound editor parity slice for Cut/Copy/Paste behavior, context-menu insertions, completion/hint parity, and future reuse across other Csound text surfaces

### Suggested Scope Boundary

- Treat the current spec 017 Global Orchestra panel as the baseline surface to be replaced
- Evaluate CodeMirror plus `@kunstmusik/codemirror-lang-csound` and Monaco plus optional grammar/language-support work before choosing the implementation path
- Require the selected editor in the shipped slice for `GlobalOrchestraTopComponent`
- Require a documented dynamic completion extension point for the selected editor
- Keep `tree-sitter-csound` as a possible follow-on or Monaco-language-support input rather than the only language-support candidate
- Leave Global Score and other code-oriented surfaces as explicitly deferred follow-on targets
- Defer Java Blue editor context-menu parity, Cut/Copy/Paste verification, and project/runtime completion sources to the next spec rather than expanding 018

### Planning Outcome

- CodeMirror is now a first-class candidate because `@kunstmusik/codemirror-lang-csound` already provides CSD/ORC/SCO language support, opcode and UDO completions, semantic highlighting, hover, indentation, and folding
- Monaco remains viable but likely requires more Csound-specific language work because there is no comparable package already in the repo
- Both candidates support dynamic completions: CodeMirror through completion sources/language data and Monaco through completion item providers
- Keep the current `project-store` patch path as the only persistence flow for `globalOrc`
- Final direction: CodeMirror is selected for 018 because the package installs/builds cleanly in `@blue/app` and gives the strongest Csound-specific baseline

### Implementation Summary

- Added CodeMirror dependencies: `codemirror`, `@codemirror/autocomplete`, `@codemirror/state`, `@codemirror/view`, and `@kunstmusik/codemirror-lang-csound`
- Implemented `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx` as the local CodeMirror adapter
- Implemented `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-language.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-completions.ts`
- Updated `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx` to use the selected editor when a project is loaded
- Added renderer coverage for the selected editor marker and dynamic completion adapter in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

### Validation

- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- Residual warnings are unchanged: package lacks `"type": "module"` for `postcss.config.js`, and Vite reports the existing large renderer chunk warning

### Candidate Research Input

- User-supplied grammar candidate: [tree-sitter-csound](https://github.com/PasqualeMainolfi/tree-sitter-csound)

## Spec 017 Package

Spec `017-global-project-editors` is complete as the current editor-surface implementation slice for `blue-app`.

- Goal: replace the placeholder editor tabs for `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, and `ProjectPropertiesTopComponent` with basic working implementations backed by the current project data model
- Constraint: keep this slice bounded to basic editing and project-property workflow; defer Monaco, Csound language tooling, and tree-sitter work to the following spec
- Specification status: complete
- Planning status: complete
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/tasks.md` contains 27 implementation tasks
- Implementation status: complete; the target panels are now wired to the current project document and validated with `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, and `pnpm --filter @blue/app build`
- Close-out status: complete; final UI polish removed redundant in-panel headers and restored Dockview tab titles to the Java-aligned human-readable labels from the panel registry
- Immediate next step: start `018-csound-editor-tooling` as the Monaco and Csound-language-tooling research slice

### Suggested Scope Boundary

- `GlobalOrchestraTopComponent`: basic editable global orchestra text surface bound to the current project
- `GlobalScoreTopComponent`: basic editable global score text surface bound to the current project
- `ProjectPropertiesTopComponent`: basic built-in project-properties sections only; plugin-provided extension tabs remain deferred unless they fall out naturally from existing data binding work

### Deferred Follow-On

- Start `018-csound-editor-tooling` after spec 017 to evaluate Monaco integration and tree-sitter-backed Csound language support, using [tree-sitter-csound](https://github.com/PasqualeMainolfi/tree-sitter-csound) as the starting grammar candidate for investigation

## Spec 016 Package

Spec `016-component-system-research` is complete as the research and planning slice for future UI/component-system work in `blue-app`.

- Goal: inventory Java blue UI surfaces and current Electron counterparts, group them into reusable component-need categories, compare Dockview/custom workbench ownership against Radix primitives, shadcn-style wrappers, and Electron-native menus where relevant, and recommend bounded next UI specs
- Constraint: this slice is documentation-only and must stay traceable to current Java registrations and current Electron implementation boundaries
- Planning status: complete
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/tasks.md` contains 22 research tasks
- Implementation status: complete; the research output now includes the dedicated Java inventory and the component-system recommendation record

## Spec 016 Close-Out

The 016 research package is complete:

- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/plan.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/data-model.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/contracts/research-output.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/checklists/requirements.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/tasks.md`

Key outcome of the 016 research slice:

- use Java `TopComponent` registrations and window-manager metadata as the baseline inventory corpus
- require a dedicated Java inventory deliverable at `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md` that maps every registered Java component in scope to required UI features
- audit the current Electron port from both `panel-registry.ts` and the live workbench shell
- group findings by surface family rather than by individual file or window alone
- compare four concrete approach families: Dockview/custom workbench ownership, Radix primitives, shadcn-style wrappers, and Electron-native menus
- expect a hybrid recommendation rather than a single-library answer
- immediate next spec candidate recorded during 016 was `017-component-primitive-pilot`, but that placeholder is now superseded by the concrete implementation slice `017-global-project-editors`

### Primary Research Inputs

- Java reference roots:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor`
- Java window-manager metadata:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr`
- Electron workbench roots:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json`

### Suggested Next Step

- Start `017-global-project-editors` to implement the first non-placeholder editor-area surfaces identified during the 016 audit
- Keep Monaco, tree-sitter, and broader code-editor tooling deferred to the following spec so the first implementation pass stays bounded

## Spec 015 Close-Out

Spec `015-left-edge-parity` is complete as the current auxiliary left-edge parity slice for `blue-app`.

## Spec 014 Close-Out

Spec `014-window-system-parity` is complete as the current bounded prototype slice for auxiliary window-system parity in `blue-app`.

## Spec 013 Close-Out

Spec `013-collapsed-sidebar-research` is complete as a bounded prototype and research slice.

- The 013 runtime prototype proved stable panel IDs, auxiliary-edge metadata, and a simplified edge-rail shell in `blue-app`.
- That slice intentionally did **not** claim full NetBeans RCP parity.
- Its main recommendation stands: keep dockview as the canonical panel/group host and localize custom behavior around auxiliary-group presentation state.

## Spec 014 Implemented Slice

The implemented 014 slice now provides the bounded prototype behavior for the four target panels:

- Auxiliary groups can be `docked`, `minimized`, `slideout`, or `maximized`
- Minimizing a group leaves visible ordered edge tabs on the owning edge
- Clicking a minimized tab toggles one edge-attached, resizable slide-out tool window per edge
- Docking from a slide-out docks only the selected tool, while the rail restore action docks the whole minimized group
- Maximizing a docked auxiliary group presents it with top tabs like the main editor area
- Restore returns the selected tool or group to its home edge without duplicating stable panel IDs
- Layout save/restore and Window-menu reveal must honor the existing presentation state

## What Landed

- **Canonical runtime host**: dockview remains the live host for docked and maximized auxiliary groups
- **App-owned layer**: minimized edge tabs, edge-attached slide-outs, home-edge restore metadata, stable-ID reveal routing, and parity session state
- **Prototype scope**:
  - right / `properties`: `SoundObjectPropertiesTopComponent`, `MidiInputPanelTopComponent`
  - bottom / `output`: `ScoreObjectEditorTopComponent`, `MixerTopComponent`
- **Parity-support scope**:
  - left / right / bottom edges are supported by the shell and state model
  - no left-edge Java-backed prototype tool has been assigned in this slice yet
- **Primary implementation files**:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`

## Validation

- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- In-app verification confirmed the current right and bottom prototype flows are working well enough to close the slice.
- No full Java-side manual parity checklist has been completed yet, so broader UX confirmation is still follow-on.

## Spec 015 Implementation Summary

The 015 left-edge parity slice is now implemented:

- **v5 instance-based model**: The auxiliary layout has been migrated from the fixed version 4 two-group model to a version 5 instance-based model with seeded and derived-singleton group instances
- **Layout migration**: Version 2, 3, and 4 stored layouts are automatically upgraded to version 5 on load
- **Whole-group moves**: Users can move any auxiliary group to the left, right, or bottom edge via header actions
- **Single-tool splits**: Moving one tool out of a multi-tool seeded group creates a derived singleton instance on the target edge
- **Merge-back**: Derived singletons can merge back into their seeded sibling group, preserving seed definition panel order
- **Reset layout**: The Window menu now exposes a "Reset Default Layout" action that discards derived singletons and re-seeds the default right/bottom layout
- **Zero left-edge defaults**: Fresh and reset layouts seed zero left-edge tools
- **Edge independence**: Left, right, and bottom edge state is fully independent
- **Drag-to-edge moves**: Docked auxiliary groups move by dragging their header area, and slide-out tools move by dragging the slide-out title bar to left, right, or bottom edge drop zones
- **Group-aware edge behavior**: Restoring minimized tools on an occupied edge rejoins the existing edge group; minimizing a docked edge group minimizes the full edge group
- **Docked-size restore**: Minimizing and restoring a docked edge group now restores the last live docked size instead of the seeded default size
- **Auxiliary tab context menu**: Auxiliary tabs now use a Radix-based context menu with `Close`, `Close Group`, `Maximize`/`Restore`, `Minimize`, and `Minimize Group`
- **Menu decision**: Electron-native context menus were deferred; the current choice is to keep workbench-internal menus renderer-owned for Java-parity styling and direct access to Dockview/Zustand state

### Primary Implementation Files

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts` — v5 data model, migration, normalization, move/merge/reset operations
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts` — store actions for group-instance IDs, move-to-edge, merge-back, reset-layout
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` — renders rails, slideouts, and move controls from instance-based state
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx` — move-to-edge and minimize controls in docked group headers
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx` — move-to-edge controls in slide-out chrome
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx` — updated to use groupInstanceId for restore actions
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryTab.tsx` — Radix-backed auxiliary tab context menu
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx` — reset-layout action and presentation badges

### Validation

- `pnpm --filter @blue/app test`: PASS (49 tests, 0 failures, 2 skipped)
- `pnpm --filter @blue/app build`: PASS
- In-app verification of left-edge moves, singleton splits, merge-back, reset, and the new auxiliary tab context menu is recommended as follow-on

### Remaining Follow-On

- Manual in-app parity review against the Java reference for left-edge behavior
- Broader UX polish for left-edge slide-out sizing and tab ordering
- Decide whether `Float` / `Float Group` should use Dockview popout groups in separate OS windows and add the required auxiliary-state tracking before enabling those menu items
- Add a follow-on spec to inventory reusable component needs from the Java application and compare a Radix-first approach against adopting shadcn wrappers more broadly, including whether workbench context menus should remain Radix-based or move to Electron-native menus

## Related Specs

- **Spec 011**: closed; dockview was selected as the workbench foundation, with rc-dock as fallback
- **Spec 012**: closed; demo2026 parity work now matches the Java `01.csd` reference byte-for-byte
- **Spec 013**: closed; bounded auxiliary-rail prototype and implementation recommendation completed
