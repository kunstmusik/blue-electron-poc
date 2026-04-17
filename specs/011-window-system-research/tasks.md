# Tasks: UI Window System Research

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: No automated tests are required for this docs-only research feature.

**Organization**: Tasks are grouped by user story so the research can be completed incrementally and handed off cleanly.

## Phase 1: Setup (Shared Research Scaffolding)

**Purpose**: Ensure the research docs have the structure needed for the main research pass.

- [x] T001 Align the implementation plan in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/plan.md` with the current docs-only scope
- [x] T002 [P] Expand the evidence sections and empty comparison placeholders in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T003 [P] Finalize the entity definitions and scoring vocabulary in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/data-model.md`
- [x] T004 [P] Confirm the next-session execution flow in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/quickstart.md`

---

## Phase 2: Foundational (Blocking Research Baseline)

**Purpose**: Build the shared capability baseline before evaluating any candidate frameworks.

- [x] T005 Audit TopComponent registrations under `~/work/nbprojects/blue/blue-ui-core`, `~/work/nbprojects/blue/blue-ui-filemanager`, and `~/work/nbprojects/blue/blue-clojure`, then record the mode and startup inventory in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T006 [P] Audit `WindowManager` and `findTopComponent(...)` usage under `~/work/nbprojects/blue/blue-ui-core`, `~/work/nbprojects/blue/blue-ui-filemanager`, and `~/work/nbprojects/blue/blue-clojure`, then record required programmatic window behaviors in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T007 [P] Map Blue workspace areas and representative panels in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md` and `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/data-model.md`
- [x] T008 Define the feature-parity checklist and support classifications in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`

**Checkpoint**: The NetBeans/Java Blue capability baseline is complete and can be used to score candidates consistently.

---

## Phase 3: User Story 1 - Capture NetBeans Window System Requirements (Priority: P1) 🎯 MVP

**Goal**: Produce a validated capability inventory for the Java Blue workspace model.

- [x] T009 [US1] Classify the confirmed capabilities in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md` as mandatory, preferred, or deferrable
- [x] T010 [US1] Capture persistence, startup, tab-group, and placement expectations in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T011 [US1] Summarize the finished capability baseline and unresolved Java-side questions in `/Users/stevenyi/work/blue-electron/STATUS.md`

**Checkpoint**: User Story 1 is complete.

---

## Phase 4: User Story 2 - Compare Viable Docking Framework Options (Priority: P1)

**Goal**: Evaluate React-friendly and non-React candidate approaches against one shared rubric.

- [x] T012 [US2] Research and document at least two React-friendly docking/workbench candidates in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T013 [P] [US2] Research and document at least one non-React or general workbench-style candidate in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T014 [P] [US2] Capture maintenance, licensing, Electron fit, and extensibility evidence for each candidate in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T015 [US2] Build the candidate parity matrix in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md` using the shared checklist

**Checkpoint**: User Story 2 is complete. Six candidates evaluated against 15 capabilities.

---

## Phase 5: User Story 3 - Produce A Decision-Ready Recommendation (Priority: P2)

**Goal**: Narrow the choice to a preferred direction, fallback, and prototype scope.

- [x] T016 [US3] Select a preferred direction and fallback option in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md`
- [x] T017 [US3] Define the prototype scope, validation questions, and accepted compromises in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/quickstart.md`
- [x] T018 [US3] Rewrite `/Users/stevenyi/work/blue-electron/STATUS.md` with the final recommendation, risks, and prototype handoff

**Checkpoint**: User Story 3 is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T019 Validate `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/research.md` against the success criteria in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/spec.md`
- [x] T020 [P] Refresh `/Users/stevenyi/work/blue-electron/specs/011-window-system-research/checklists/requirements.md` if the wording of the completed research output changes
- [x] T021 [P] Remove stale notes from `/Users/stevenyi/work/blue-electron/STATUS.md` so it only reflects feature `011-window-system-research`

---

## Summary

All 21 tasks complete. Feature `011-window-system-research` is done.

**Preferred framework**: dockview v5.x
**Fallback**: rc-dock v3.3.2
**Immediate next specs**: 012 compile investigation, 013 collapsed sidebar research
**Follow-on after 012/013**: Workbench prototype hardening and real editor implementations
