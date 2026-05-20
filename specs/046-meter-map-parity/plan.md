# Implementation Plan: Meter Map Parity

**Branch**: `046-meter-map-parity` *(not created; planned only)*  
**Spec**: `/Users/stevenyi/work/blue-electron/specs/046-meter-map-parity/spec.md`  
**Date**: 2026-05-20

## Summary

Implement Java Blue parity for time-signature editing in the Score panel. The feature adds an accurate meter ruler bar with Java-style add/edit/delete interactions, fixes mixed-meter region math, replaces the Project menu placeholder with an Edit Time Signature Map modal, and routes all meter mutations through typed canonical project patches backed by `@blue/data`.

This plan intentionally separates meter from Spec 045 tempo work. If Spec 045 lands first, meter implementation may reuse shared dialog, menu, and row layout patterns, but meter correctness must stand on its own.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x  
**Primary Dependencies**: `@blue/data`, Zustand 5.x project store, Dockview 5.2.0 workbench shell, Radix Context Menu where already used, Vitest 4.x  
**Input Data**: main-process canonical `BlueData` project document and renderer `ProjectEditorSnapshot`  
**Output Data**: updated meter-map snapshot, `.blue` XML persistence through existing `@blue/data` serialization  
**Testing**: Vitest unit and renderer tests, existing `@blue/app` and `@blue/data` suites, manual Score panel scenarios  
**Constraints**: No Node built-ins or dynamic imports in `@blue/data`; keep `@blue/data` browser-safe; avoid renderer-only canonical state  
**Scope Boundary**: No undo stack implementation unless a matching project-document undo mechanism already exists; no tempo behavior changes except incidental shared utility reuse.

## Constitution Check

- **Java-first parity**: Required. Implementation begins by comparing Java Blue's `MeterRegionBar`, `MeterMapEditorPanel`, `EditMeterMapAction`, and `MeterMap` model behavior.
- **Canonical state**: Required. Renderer dispatches typed patches; main-process `BlueData` remains canonical.
- **XML compatibility**: Required. Existing `.blue` meter-map save/load behavior must continue to round-trip.
- **Strict TypeScript**: Required. Shared contracts must be typed and covered by tests.
- **Scoped implementation**: Required. This spec touches meter-map behavior only, except for shared Score panel layout and menu command integration.

No constitution violations are expected.

## Project Structure

### Documentation

```text
specs/046-meter-map-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── meter-map-surface.md
├── checklists/
│   └── requirements.md
├── quickstart.md
└── tasks.md
```

### Expected Code Touchpoints

```text
packages/blue-data/src/time/
├── meter-map.ts
└── meter-map.test.ts

packages/blue-app/src/shared/
└── project-editor.ts

packages/blue-app/src/main/
├── application-menu.ts
├── application-menu.test.ts
└── main.ts

packages/blue-app/src/renderer/
├── hooks/use-ipc-listeners.ts
├── stores/project-store.ts
├── tests/meter-map-contract.test.ts
├── tests/meter-row-parity.test.tsx
├── tests/meter-map-modal.test.tsx
└── components/workbench/panels/
    ├── ScorePanel.tsx
    └── score/
        ├── ColumnHeader.tsx
        ├── MeterRegionBar.tsx
        ├── MeterEntryDialog.tsx
        ├── MeterMapEditorDialog.tsx
        └── meter-map-utils.ts
```

## Implementation Phases

### Phase 1: Shared Meter Contract

- Add or refine shared meter snapshot data so renderer code receives ordered entries plus derived start beats.
- Add meter-map patch variants for add, update, remove, and replace-map.
- Validate first-entry, duplicate-measure, positive integer, denominator, and neighbor-boundary rules.
- Update project-store optimistic merge behavior.

### Phase 2: Correct Boundary Math

- Add pure utilities for deriving meter regions from entries and computing clicked measure from a beat.
- Replace fixed meter arithmetic in the current `MeterRegionBar`.
- Confirm BBT/BBST/BBF ruler conversions use canonical meter data.

### Phase 3: Meter Region Bar Parity

- Implement Java-style render, hover, tooltip, double-click add/edit, and right-click context menu.
- Add `MeterEntryDialog` for single-entry edits.
- Preserve first-entry immutability and non-first delete rules.

### Phase 4: Project Menu Modal

- Replace Project menu placeholder with a real enabled command.
- Add renderer listener and Score panel dialog state.
- Implement `MeterMapEditorDialog` with copy semantics, Add at last measure + 8, delete restrictions, OK, and Cancel.

### Phase 5: Validation And Handoff

- Run focused meter tests.
- Run broader `@blue/app` and `@blue/data` validation.
- Perform manual quickstart scenarios.
- Update status documentation with completed tasks and any intentional validation differences from Java.

## Testing Strategy

- `@blue/data` tests cover meter XML and conversion behavior.
- Shared contract tests cover snapshot creation, patch validation, and canonical patch application.
- Renderer tests cover region rendering, tooltip, double-click, context menu, and modal OK/Cancel.
- Main-process tests cover Project menu enablement and command dispatch.
- Regression tests cover mixed 4/4, 3/4, and 7/8 maps to prevent fixed-measure shortcuts from returning.

## Acceptance Gate

Spec 046 is ready to implement when:

- All design artifacts in this directory are present.
- `tasks.md` is dependency ordered and independently executable.
- The current active branch remains Spec 045 until the implementer intentionally creates a 046 branch.
