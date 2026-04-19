# Implementation Plan: Window System Parity

**Branch**: `014-window-system-parity` | **Date**: 2026-04-18 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/spec.md`

## Summary

Implement a bounded NetBeans RCP parity slice for auxiliary workbench groups by keeping dockview as the canonical runtime for docked, floating, and maximized groups, while adding an app-level minimized-edge controller for visible side tabs. The target behavior is explicit: prototype `properties` and `output` groups can minimize into edge tabs, reopen directly into floating and resizable tool windows, maximize into a top-tab presentation like the main editor area, restore to their home edge without duplication, and persist those presentation states across layout reloads.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/store code  
**Primary Dependencies**: `dockview` 5.2.0 / `dockview-core` 5.2.0, Zustand 5.x, Vitest 4.x, existing workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`  
**Storage**: Renderer-side localStorage layout envelope for the parity slice, combining dockview JSON with supplemental minimized-edge metadata  
**Testing**: `pnpm --filter @blue/app test`, targeted Vitest coverage for state/persistence helpers, `pnpm --filter @blue/app build`, parity review against Java reference behavior  
**Target Platform**: Electron desktop renderer (`@blue/app`)  
**Project Type**: Desktop application UI feature  
**Performance Goals**: Presentation-state transitions should feel immediate for the four prototype panels, and layout restore should complete during normal workbench startup without manual repair in the common case  
**Constraints**: Preserve stable panel IDs; do not allow duplicate logical panel instances; remain parity-first against the Java window system; keep dockview as the single panel/group host; scope the first slice to the right-edge `properties` pair and bottom-edge `output` pair  
**Scale/Scope**: Four prototype panels, two auxiliary groups, four presentation states (`docked`, `minimized`, `floating`, `maximized`), one persisted layout envelope, one parity validation slice

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. This work stays in the Electron renderer and does not move business logic into UI from `blue-data`.
- **II. Backwards-Compatible Serialization**: PASS. The only persistence touched here is workbench layout state, not `.blue` project serialization.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity reference and source of expected behavior.
- **IV. Engine as External Process**: PASS. No playback or engine protocol changes are involved.
- **V. Test-First for Serialization**: N/A. This feature does not add or modify `.blue` serialization.

**Gate Result**: PASS. No constitution exceptions are required for the parity slice.

## Project Structure

### Documentation (this feature)

```text
specs/014-window-system-parity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/blue-app/
├── src/renderer/components/workbench/
│   ├── WorkbenchShell.tsx
│   ├── DockviewPanel.tsx
│   ├── WindowMenu.tsx
│   ├── AuxiliaryRail.tsx
│   ├── auxiliary-layout.ts
│   └── panel-registry.ts
├── src/renderer/stores/
│   └── workbench-store.ts
├── src/renderer/styles/
│   └── index.css
└── src/renderer/tests/
    └── workbench-auxiliary.test.ts

specs/
├── 013-collapsed-sidebar-research/
└── 014-window-system-parity/
```

**Structure Decision**: Keep the planning artifacts under `specs/014-window-system-parity/`, and implement the runtime parity slice inside the existing renderer workbench shell, store, styles, and tests. No separate contracts directory is needed because this feature is an internal UI-state and behavior slice rather than a new public interface.

## Phase 0 Research Decisions

1. Use the Java `TopComponent` registrations and visible window behavior as the parity baseline:
   - `SoundObjectPropertiesTopComponent` and `MidiInputPanelTopComponent` belong to `properties`
   - `ScoreObjectEditorTopComponent` and `MixerTopComponent` belong to `output`
2. Treat stable panel IDs as the canonical identity layer, mirroring Java's `findTopComponent(...).open().requestActive()` reveal model.
3. Use dockview's existing runtime features for non-minimized presentations:
   - `DockviewApi.addFloatingGroup(...)` for floating/resizable tool windows
   - `DockviewApi.maximizeGroup(...)` for top-tab maximized presentation
   - `DockviewApi.toJSON()` / `fromJSON()` with serialized floating groups as the base persistence layer
4. Keep minimized presentation outside raw dockview layout as app-owned metadata and UI, because the visible edge-tab rail is the parity behavior dockview does not model directly.
5. Model transitions at the auxiliary-group level rather than the individual panel-open/close level so one logical group can move between docked, minimized, floating, and maximized states without cloning panels.
6. Keep the first implementation slice bounded to the existing prototype groups from spec 013, but design the state model so more `properties` and `output` groups can be added later without redefining the transition system.

## Phase 1 Design Artifacts

- `research.md`: parity baseline, dockview capability findings, final architectural decisions, and deferred follow-ons
- `data-model.md`: auxiliary-group state entities, persistence envelope, invariants, and state-transition rules
- `quickstart.md`: implementation order and validation flows for the first parity slice

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: N/A

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exceptions are required. The main deliberate complexity is the app-level minimized-edge controller, which is justified because dockview already covers docked, floating, and maximized runtime states but does not provide the NetBeans-style persistent minimized rail on its own.
