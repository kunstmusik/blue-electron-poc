# Implementation Plan: Collapsed Sidebar Group Research

**Branch**: `013-collapsed-sidebar-research` | **Date**: 2026-04-18 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/spec.md](/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/spec.md`

## Summary

Produce a decision-ready follow-on research package for collapsed auxiliary groups in the dockview workbench by turning the Java Blue collapsed-side-dock behavior from the supplied screenshots into an explicit baseline, then comparing the three candidate implementation directions against the current `blue-electron` shell. The plan narrows the next prototype toward dockview-backed groups with a thin custom collapse controller so panel identity, reveal/focus behavior, and persistence stay unified.

## Technical Context

**Language/Version**: Markdown documentation plus source inspection across TypeScript 5.x / React 19 / Electron and installed dockview 5.2.0 API types  
**Primary Dependencies**: Existing dockview workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`, Zustand state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`, panel registry in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`, prior window-system research in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research`, provided Java screenshots, and Java Blue reference sources under `~/work/nbprojects/blue`  
**Storage**: Markdown artifacts under `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research` plus `STATUS.md` as status input; no new runtime storage in this phase  
**Testing**: Checklist review plus manual validation that the planning artifacts define reveal, hide, focus, persistence, sizing, and grouped-edge behavior clearly enough for the next prototype session  
**Target Platform**: Electron desktop app for `blue-electron`  
**Project Type**: Research/design feature  
**Performance Goals**: N/A for this docs-only phase; the output must bound the next prototype to one right-edge scenario and one bottom-edge scenario without leaving major interaction gaps undefined  
**Constraints**: Keep a single panel/group identity model rooted in dockview; preserve future stable panel IDs and Window-menu reveal flow; reflect the Java-visible collapsed behavior shown in the screenshots; do not introduce a second persistent layout system unless the benefit is explicit; no production UI implementation in this phase  
**Scale/Scope**: One behavior baseline for properties/output auxiliary groups, three candidate approaches, one preferred direction, one fallback direction, and one bounded prototype slice

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. This feature is UI-shell research only and does not move business logic into renderer components.
- **II. Backwards-Compatible Serialization**: PASS. No `.blue` serialization or file-format changes are proposed in this phase.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the reference for target workspace behavior.
- **IV. Engine as External Process**: PASS. No engine or playback-process changes are in scope.
- **V. Test-First for Serialization**: N/A. This feature does not introduce serialization work.

**Gate Result**: PASS. No constitution violations are introduced by a docs-only research feature.

## Project Structure

### Documentation (this feature)

```text
specs/013-collapsed-sidebar-research/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/
    └── requirements.md
```

### Source Code and Reference Inputs

```text
packages/blue-app/
└── src/renderer/
    ├── components/workbench/
    │   ├── WorkbenchShell.tsx
    │   ├── WindowMenu.tsx
    │   ├── DockviewPanel.tsx
    │   └── panel-registry.ts
    ├── stores/
    │   └── workbench-store.ts
    └── styles/
        └── index.css

specs/
├── 011-window-system-research/
└── 013-collapsed-sidebar-research/

.specify/
├── feature.json
├── memory/
│   └── constitution.md
└── templates/

node_modules/.pnpm/
└── dockview@5.2.0_.../node_modules/dockview
```

**Structure Decision**: Keep this feature entirely in documentation under `specs/013-collapsed-sidebar-research/`. The only code interaction in this phase is source inspection of the existing dockview shell and installed dockview APIs to make the next prototype concrete.

## Phase 0 Research Decisions

1. Use the provided Java screenshots, the spec 011 capability baseline, and the current panel registry as the behavior baseline for collapsed auxiliary groups.
2. Treat dockview as the current architectural baseline and verify its capabilities from the installed local package/API types rather than memory.
3. Evaluate the options by unified panel identity, reveal/focus flow, persistence burden, edge-handle discoverability, and fit for both right and bottom auxiliary groups.
4. Keep the next prototype intentionally small: one right-edge pair (`SoundObjectPropertiesTopComponent` plus `MidiInputPanelTopComponent`) and one bottom-edge pair (`ScoreObjectEditorTopComponent` plus `MixerTopComponent`).
5. Prefer solutions that add thin control logic around the existing dockview shell over solutions that introduce a second parallel layout model.

## Phase 1 Design Artifacts

- `research.md`: planning-phase decision log and candidate comparison for dockview-native groups, paneview, and a custom collapse wrapper
- `data-model.md`: entities for auxiliary groups, collapsed handles, reveal requests, persistence metadata, and approach assessment
- `quickstart.md`: next-session implementation sequence for the bounded prototype
- `tasks.md`: intentionally deferred to `/speckit.tasks`; not created in this planning step

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: N/A

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exceptions or added architectural complexity are required in this planning phase.
