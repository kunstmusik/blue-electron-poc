# Implementation Plan: BlueSynthBuilder Interface Parity

**Branch**: `022-bsb-interface-parity` | **Date**: 2026-04-24 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md`

## Summary

Extend the Spec 021 BlueSynthBuilder baseline into a real Java Blue-style BSB editor by replacing the Interface placeholder with an editable widget canvas, a synchronized property/grid panel, existing-preset application, and an embedded opcode-list editor. The plan preserves Spec 021's top-level BSB tab layout and CodeMirror-based code editors while expanding `@blue/data` and the renderer snapshot/patch flow to carry hierarchical widget, grid, and preset state without dropping unsupported BSB XML.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data`
**Primary Dependencies**: Existing `@blue/data` BlueSynthBuilder model and BSB widget classes, existing `@blue/app` Orchestra/BSB editor shell from Spec 021, Zustand 5.x project store, CodeMirror 6 BSB code editors, current renderer styling/utilities, and Java Blue BSB reference sources under `/Users/stevenyi/work/nbprojects/blue`
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer consumes serializable BSB interface/preset snapshots and dispatches explicit patch intents through the existing project document IPC bridge; `.blue` XML remains the persistence format
**Testing**: Vitest unit/renderer tests, `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, XML round-trip fixtures, `git diff --check`
**Target Platform**: Electron desktop renderer on macOS first, with the existing workbench/editor stack from Spec 021
**Performance Goals**: BSB-heavy instruments should open interactively, interface edits should update without editor-remount regressions, and code-completion synchronization should remain immediate after interface changes
**Constraints**: Preserve Java Blue `.blue` compatibility, keep `blue-data` UI-free and Node-free, avoid regressing Spec 021 BSB code-tab stability, preserve unsupported widget/preset data safely, and keep Orchestra-wide scope closed while focusing only on BSB follow-on parity
**Scale/Scope**: One follow-on slice focused on BlueSynthBuilder only: interface canvas, widget/property editing, grid settings, preset application/preservation, embedded opcode-list editing, and snapshot/patch extensions that support those surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. BlueSynthBuilder model, preset structures, opcode-list state, and XML round-trip behavior stay in `@blue/data`; the renderer consumes snapshots and dispatches patch intents.
- **Backwards-Compatible Serialization**: PASS. The slice exists to deepen BSB XML compatibility and safe editing, with unsupported widget/preset preservation treated as a primary requirement.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The work stays inside BSB data/UI parity and does not replace JVM-dependent runtime paths.
- **Engine as External Process**: PASS. Playback and engine IPC are untouched.
- **Test-First for Serialization**: PASS. New BSB preset/opcode/interface model changes require round-trip and preservation tests before UI parity can be considered complete.
- **Research Integration**: PASS. Planning is anchored to the Java BSB editor, interface editor, embedded opcode panel, and preset model classes.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── bsb-interface-parity-surface.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/
├── blue-synth-builder.ts
├── blue-synth-builder.test.ts
└── blue-synth-builder/
    ├── bsb-graphic-interface.ts
    ├── bsb-group.ts
    ├── [existing widget classes]
    └── [new preset/grid helpers if required]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
└── project-store.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/
├── BlueSynthBuilderEditor.tsx
└── bsb/
    ├── BSBInterfaceEditor.tsx
    ├── BSBWidgetEditor.tsx
    ├── BSBCodeEditor.tsx
    ├── BSBUDOPanel.tsx
    └── [new BSB canvas/property/preset/UDO helpers]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── bsb-editor.test.tsx
├── orchestra-code-instrument-editors.test.tsx
└── [new BSB interface/preset/opcode regression tests]
```

**Structure Decision**: Keep BSB XML/preset/opcode semantics in `@blue/data`; keep renderer-only canvas, property-sheet, preset-bar, and embedded-opcode composition under the existing `panels/orchestra/bsb/` boundary; extend the shared project snapshot/patch contract instead of inventing a separate BSB transport layer.

## Complexity Tracking

No constitution violations are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/research.md](/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/contracts/bsb-interface-parity-surface.md](/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/contracts/bsb-interface-parity-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The design separates serializable BSB interface/preset state from React presentation and keeps XML semantics in `@blue/data`.
- **Backwards-Compatible Serialization**: PASS. The design requires preset, grid, widget, and opcode-list preservation before deeper UI parity is considered complete.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No JVM-backed runtime substitution is introduced.
- **Engine as External Process**: PASS. The planning scope does not change playback architecture.
- **Test-First for Serialization**: PASS. BSB preset/opcode/interface round-trip coverage is a gating expectation.
- **Research Integration**: PASS. The plan records the Java editor shell, interface editor, embedded opcode panel, and preset model as the primary source anchors.