# Implementation Plan: Score Editor Management and Navigation

**Branch**: `040-score-editor-management-navigation` | **Date**: 2026-05-07 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/spec.md](/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/spec.md`

## Summary

Re-scope the old interaction follow-up so it lands after the remaining score-object editor planning. This slice now focuses on the shell-level work that is still genuinely missing after Specs 036 and 037: the `Manage` workflow, supported score-manager/layer-group-manager behavior, marker/navigation flows, playback-follow and time-pointer polish, and the remaining score-adjacent placeholder surfaces that belong with score navigation rather than score-object editing.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: Spec 036 score shell and time-state bridge, Spec 037 auxiliary score-object panels, planned Specs 038 and 039 for remaining score-object editor parity, existing playback store and workbench routing, Dockview 5.2.0, Vitest 4.x  
**Storage**: canonical score structure remains in main-process `BlueData`; shell-local follow/navigation session state remains renderer-local where appropriate  
**Testing**: Vitest renderer and shared-contract coverage plus renderer/main build validation  
**Target Platform**: Electron desktop on macOS first  
**Project Type**: app-layer shell and navigation feature built on the existing score shell and project patch infrastructure  
**Performance Goals**: management dialogs and navigator workflows should update the visible shell immediately without forcing panel reopen; playback-follow should avoid excessive shared-store churn  
**Constraints**: do not reopen already-landed direct manipulation work unless regressions block this slice, preserve Java parity where applicable, and keep score-object editor work out of this spec  
**Scale/Scope**: score structure management, navigation workflows, playback-follow/time-pointer polish, and score-adjacent panel follow-up only

## Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical structure changes stay in score patches; shell-local follow state remains renderer-local.
- **Backwards-Compatible Serialization**: PASS. Structure and marker/navigation related writes remain grounded in canonical `BlueData`.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue manager and navigator classes remain the parity source.
- **Engine as External Process**: PASS. Playback-follow polish does not change engine architecture.
- **Test-First for Serialization**: PASS. The plan adds manager/navigation and follow-state coverage where new canonical patch behavior is claimed.
- **Research Integration**: PASS. The re-scope is based on what Specs 036 and 037 already delivered and what still remains missing in the shell.

## Project Structure

### Documentation

```text
/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/
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
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts
```

**Structure Decision**: Keep the existing score shell and auxiliary panel architecture, and add the missing management/navigation surfaces around it instead of reopening the foundational shell implementation.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/research.md](/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/data-model.md](/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/contracts/score-editor-management-navigation-surfaces.md](/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/contracts/score-editor-management-navigation-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/quickstart.md](/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Management operations stay canonical, while follow state remains shell-local when appropriate.
- **Backwards-Compatible Serialization**: PASS. No renderer-owned persistence is introduced.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The spec remains anchored to Java score manager and navigator behavior.
- **Engine as External Process**: PASS. Playback-follow polish is renderer-facing only.
- **Test-First for Serialization**: PASS. New canonical structure-management behavior is covered before parity is claimed.
- **Research Integration**: PASS. The new scope is aligned with the actual post-036 and post-037 gaps.