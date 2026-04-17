# Implementation Plan: UI Window System Research

**Branch**: `011-window-system-research` | **Date**: 2026-04-17 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/011-window-system-research/spec.md](/Users/stevenyi/work/blue-electron/specs/011-window-system-research/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/spec.md`

## Summary

Produce a decision-ready research package for the future `blue-electron` window/workbench system by mapping the Java Blue NetBeans Window System usage to an explicit capability baseline, then defining how to evaluate React-friendly and non-React docking/workbench candidates against that baseline. This feature is documentation and planning only; it does not implement a UI framework yet.

## Technical Context

**Language/Version**: Markdown documentation plus source inspection across TypeScript/Electron and Java Blue codebases  
**Primary Dependencies**: Local Java Blue sources in `~/work/nbprojects/blue`, current Electron app sources in `/Users/stevenyi/work/blue-electron/packages/blue-app`, Spec Kit artifacts under `/Users/stevenyi/work/blue-electron/specs/011-window-system-research`  
**Storage**: Markdown files under `/Users/stevenyi/work/blue-electron/specs/011-window-system-research` and `/Users/stevenyi/work/blue-electron/STATUS.md`  
**Testing**: Checklist review plus manual validation that the produced artifacts satisfy the feature spec and leave a clear next-session execution path  
**Target Platform**: Electron desktop app for `blue-electron`  
**Project Type**: Research/design feature  
**Performance Goals**: N/A for this phase; output must be decision-ready rather than runtime-ready  
**Constraints**: No production UI code in this phase; document both React-friendly and non-React options; use Java Blue behavior as the compatibility baseline; candidate maintenance/licensing data must be verified with current sources during the research pass  
**Scale/Scope**: One capability baseline, one comparison matrix, at least four candidate approaches, one preferred direction, one fallback, and one bounded prototype scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. This feature is UI-framework research only and does not move data logic into the UI.
- **II. Backwards-Compatible Serialization**: PASS. No `.blue` data-model or serialization changes are proposed in this phase.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue is the reference implementation for workspace behavior in this feature.
- **IV. Engine as External Process**: PASS. No engine protocol or runtime integration changes are in scope.
- **V. Test-First for Serialization**: N/A. This feature does not introduce serialization work.

**Gate Result**: PASS. No constitution violations are introduced by a docs-only research feature.

## Project Structure

### Documentation (this feature)

```text
specs/011-window-system-research/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code and Reference Inputs

```text
packages/
├── blue-app/
│   └── src/
├── blue-data/
│   └── src/
└── blue-engine-client/
    └── src/

.specify/
├── feature.json
├── memory/
│   └── constitution.md
└── templates/

~/work/nbprojects/blue/
├── blue-ui-core/src/main/java/
├── blue-ui-filemanager/src/main/java/
└── blue-clojure/src/main/java/
```

**Structure Decision**: Keep this feature entirely in documentation under `specs/011-window-system-research/` plus a rewritten root `STATUS.md`. The only source-code interaction in this phase is source inspection for evidence gathering.

## Phase 0 Research Decisions

1. Use Java Blue source inspection as the canonical evidence source for current workspace behavior, not memory or screenshots.
2. Capture parity in terms of window-system capabilities rather than framework APIs.
3. Treat candidate selection as time-sensitive and verify maintenance, licensing, and Electron suitability in the implementation session with current sources.
4. Define a prototype scope that validates workbench shell assumptions before any broader editor UI build-out.

## Phase 1 Design Artifacts

- `research.md`: decision log, initial source map, and comparison framework for the implementation session
- `data-model.md`: entities for capabilities, workspace areas, candidates, and recommendation output
- `quickstart.md`: execution flow for the next session
- `tasks.md`: dependency-ordered task list for carrying out the research feature

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: N/A

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exceptions or added architectural complexity are required in this phase.
