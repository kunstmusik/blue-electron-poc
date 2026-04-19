# Implementation Plan: Left Edge Parity

**Branch**: `015-left-edge-parity` | **Date**: 2026-04-19 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/spec.md`

## Summary

Extend the existing auxiliary window-system parity slice so left-edge behavior is fully supported for user-driven rearrangement without changing the default seeded layout. The core implementation shift is to replace the current fixed two-group auxiliary model with persisted group instances that can live on left, right, or bottom edges, allowing whole groups or individual prototype tools to move to the left edge, minimize there, reopen as left-attached slide-outs, and restore correctly while reset/default layouts continue to seed zero left-edge tools.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/store code  
**Primary Dependencies**: `dockview` 5.2.0 / `dockview-core` 5.2.0, Zustand 5.x, Vitest 4.x, current workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`  
**Storage**: Renderer-side localStorage layout envelope for the parity slice, migrated from version 4 to version 5 instance-based auxiliary state  
**Testing**: `pnpm --filter @blue/app test`, targeted Vitest coverage for auxiliary layout migrations and move/split/merge helpers, `pnpm --filter @blue/app build`, manual parity review against Java behavior  
**Target Platform**: Electron desktop renderer (`@blue/app`)  
**Project Type**: Desktop application UI feature  
**Performance Goals**: Edge reassignment, minimize, and slide-out transitions should remain visually immediate for the prototype panels; layout restore should complete during normal workbench startup without manual repair in the common case  
**Constraints**: Preserve stable panel IDs; keep zero default left-edge tools in fresh/reset layouts; maintain parity with the existing right/bottom slide-out behavior; allow one visible slide-out per edge; keep the slice bounded to the current four prototype auxiliary panels  
**Scale/Scope**: Four prototype panels, two seeded default groups, up to four derived singleton groups created by user moves, three supported edges (`left`, `right`, `bottom`), persisted layout migration from version 4 to version 5

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. This work is contained to the Electron renderer workbench shell and does not move business logic out of `blue-data`.
- **II. Backwards-Compatible Serialization**: PASS. The feature changes workbench layout state only, not `.blue` project serialization.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity baseline for default placement and window behavior.
- **IV. Engine as External Process**: PASS. No engine or playback changes are involved.
- **V. Test-First for Serialization**: N/A. The work touches layout/session persistence, not `.blue` serialization.

**Gate Result**: PASS. No constitution exception is needed.

## Project Structure

### Documentation (this feature)

```text
specs/015-left-edge-parity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auxiliary-edge-behavior.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/blue-app/
├── src/renderer/components/workbench/
│   ├── WorkbenchShell.tsx
│   ├── AuxiliaryRail.tsx
│   ├── AuxiliarySlideout.tsx
│   ├── AuxiliaryHeaderActions.tsx
│   ├── WindowMenu.tsx
│   ├── DockviewPanel.tsx
│   └── auxiliary-layout.ts
├── src/renderer/stores/
│   └── workbench-store.ts
├── src/renderer/styles/
│   └── index.css
└── src/renderer/tests/
    ├── workbench-auxiliary.test.ts
    └── workbench-store.test.ts

specs/
├── 014-window-system-parity/
└── 015-left-edge-parity/
```

**Structure Decision**: Keep the planning artifacts under `specs/015-left-edge-parity/`, and implement the feature inside the existing renderer workbench shell, store, styles, and tests. Unlike spec 014, this slice benefits from one lightweight UI contract document because left-edge move/split/restore behavior is now a first-class user interaction surface.

## Phase 0 Research Decisions

1. Keep the Java-aligned default seeded layout unchanged:
   - `properties-main` still defaults to the right edge
   - `output-main` still defaults to the bottom edge
   - zero tools are seeded on the left edge in fresh or reset layouts
2. Replace the current fixed-group auxiliary session model with persisted group instances:
   - seeded groups remain the default baseline
   - user-driven moves can change the current edge without redefining the defaults
3. Support single-tool moves by creating derived singleton group instances when a panel leaves a seeded group:
   - this allows `SoundObjectPropertiesTopComponent` and `MidiInputPanelTopComponent` to diverge across edges without duplication
   - moving a singleton back onto a compatible sibling edge can merge it back into the seeded group
4. Use explicit move-to-edge actions in auxiliary header and slide-out chrome for this slice instead of broad free-form drag unlocking:
   - current dockview groups are intentionally locked
   - explicit actions are lower-risk and easier to test for left-edge parity
5. Persist left-edge customizations in the layout envelope and clear them on reset:
   - saved custom left-edge placement restores
   - reset drops derived groups and re-seeds only the Java-aligned defaults
6. Keep left/right/bottom slide-outs independent:
   - one visible slide-out per edge
   - left-edge actions must not corrupt right-edge or bottom-edge state

## Phase 1 Design Artifacts

- `research.md`: decisions for seeded defaults, group-instance modeling, singleton split/merge rules, move affordances, and reset semantics
- `data-model.md`: seeded group definitions, derived group instances, edge placement rules, layout-envelope versioning, and transition invariants
- `contracts/auxiliary-edge-behavior.md`: UI-level behavior contract for move-to-edge, minimize, slide-out, dock-single-tool, restore-group, reveal, and reset
- `quickstart.md`: implementation order and manual validation flows for group moves, single-tool moves, persistence, and reset behavior

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: N/A

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exception is required. The main deliberate complexity is the move from fixed auxiliary groups to instance-based auxiliary sessions. That complexity is justified because the current version 4 model cannot persist left-edge reassignment or support single-tool splits without snapping everything back to the original seeded edge defaults.
