# Implementation Plan: Score Editor Management and Navigation

**Branch**: `042-score-editor-management-navigation` | **Date**: 2026-05-16 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/spec.md](/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/spec.md`

## Summary

Refresh the shell-level score follow-up so it starts with the concrete Java parity gaps still missing in the TypeScript port: root-ruler render start or end interaction and visualization, marker authoring parity on that same ruler surface, the real `Manage` workflow, and the remaining marker-centered navigation or follow-playback placeholder cleanup. The key sequencing change is that render-range interaction lands first because the project already persists render start or end canonically, and the marker workflow depends on the same root-ruler interaction surface.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages
**Primary Dependencies**: Spec 036 score shell and time-state bridge, Spec 037 auxiliary score-object panels, completed Specs 038-041, `@blue/data` `BlueData` and `MarkersList`, existing native-menu command plumbing, Dockview 5.2.0, Radix Context Menu, Vitest 4.x
**Storage**: canonical marker and render-range values remain in main-process `BlueData`; shell-local drag, dialog, and follow state remains renderer-local where appropriate
**Testing**: Vitest renderer, shared, and data-layer coverage plus renderer build validation and Spec Kit prerequisite validation
**Target Platform**: Electron desktop on macOS first
**Project Type**: app-layer score-shell parity slice built on the existing workbench, project patch, and auxiliary-panel infrastructure
**Performance Goals**: root-ruler and marker drags should update the visible shell immediately without reopening the panel, and follow-playback should avoid unnecessary shared-store churn
**Constraints**: preserve `.blue` save or reload compatibility, keep root-timeline authoring semantics aligned with Java Blue, do not reopen already-landed direct manipulation unless it blocks this slice, and keep per-object editor work out of this spec
**Scale/Scope**: render-range ruler interactions, marker authoring or navigation, manage dialogs, follow-playback or time-pointer polish, and score-adjacent panel follow-up

## Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical marker and render-range values stay in project data; shell drag or follow state remains renderer-local.
- **Backwards-Compatible Serialization**: PASS. The plan reuses the existing `BlueData` render-range fields and marker list instead of adding renderer-owned persistence.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue `TimeBar`, `MarkersBar`, `AddMarkerAction`, `MarkersTopComponent`, and manager dialogs remain the parity anchors.
- **Engine as External Process**: PASS. Follow-playback polish is renderer-facing only and does not alter engine architecture.
- **Test-First for Serialization**: PASS. The plan adds persistence and mutation coverage before claiming render-range or marker parity.
- **Research Integration**: PASS. The updated sequencing comes directly from the Java parity review and the current TypeScript shell gaps.

## Project Structure

### Documentation

```text
/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/
├── checklists/
│   └── requirements.md
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── score-editor-management-navigation-surfaces.md
└── tasks.md
```

### Source Code

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts
/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/MarkersPanel.tsx
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
```

**Structure Decision**: Keep the existing score shell and auxiliary-panel architecture, reuse the existing transport patch path for render start or end persistence, and add missing canonical marker mutations plus shared native-menu commands instead of inventing separate dialog-only state.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/research.md](/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/data-model.md](/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/contracts/score-editor-management-navigation-surfaces.md](/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/contracts/score-editor-management-navigation-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/quickstart.md](/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Render-range and marker persistence stays canonical, while drag state, open dialogs, and follow heuristics stay local to the shell.
- **Backwards-Compatible Serialization**: PASS. The slice relies on the existing `renderStartTime`, `renderEndTime`, and `markersList` project fields.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The refreshed plan keeps the Java score-shell classes as the reference for behavior and ordering.
- **Engine as External Process**: PASS. Follow-playback-on-render-start and time-pointer polish are menu and viewport concerns only.
- **Test-First for Serialization**: PASS. Data-layer save or reload coverage and shared patch coverage are part of the foundational phase.
- **Research Integration**: PASS. The updated scope reflects the actual current TS code: render-range data already exists, marker visuals already render, and both still need the missing interaction layer.