# Tasks: Component System Research

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/plan.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/contracts/research-output.md`

**Tests**: No automated runtime tests are required. Validation for this slice is source-audit completeness, document traceability, and `git diff --check`.

**Organization**: Tasks are grouped by user story so the inventory, comparison, and roadmap outputs can be completed and reviewed incrementally.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Research Scaffolding)

**Purpose**: Lock the 016 deliverables and closure criteria before the source audit starts.

- [x] T001 Finalize the Java inventory scope, exclusion rules, and required feature-tag glossary in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- [x] T002 [P] Align the research deliverable contract and done criteria in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/contracts/research-output.md` and `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md`
- [x] T003 [P] Align the planning artifacts with the dedicated inventory deliverable in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/plan.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`, and `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/data-model.md`

---

## Phase 2: Foundational (Blocking Audit Baseline)

**Purpose**: Establish the audit baseline and output structure that every user story depends on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T004 Record the audited Java source roots, module coverage, and explicit exclusions in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T005 [P] Record the audited Electron source roots and current ownership baseline in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md` using `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryTab.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- [x] T006 Create the category scaffolding and feature-to-category mapping sections in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T007 [P] Create the comparison-matrix and recommendation section scaffolding in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`

**Checkpoint**: The spec package has an agreed inventory structure, an explicit baseline, and the section scaffolding needed to complete the research without reopening the planning pass.

---

## Phase 3: User Story 1 - Inventory The UI Surface Area (Priority: P1) 🎯 MVP

**Goal**: Produce a source-traceable inventory of Java components, Electron counterparts, and reusable component-need categories.

**Independent Test**: Review `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md` and `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md` and confirm every currently registered Java `TopComponent` in scope and every current Electron panel-registry entry is accounted for with explicit parity notes or gaps.

- [x] T008 [US1] Populate the editor-mode Java component rows and feature mappings in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- [x] T009 [P] [US1] Populate the properties-mode Java component rows and feature mappings in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- [x] T010 [P] [US1] Populate the output-mode Java component rows and feature mappings in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- [x] T011 [US1] Map every Java component in scope to a current Electron counterpart or explicit gap in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- [x] T012 [US1] Summarize the reusable component-need categories, member surfaces, and current parity status in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`

**Checkpoint**: User Story 1 is complete when the Java component inventory and the grouped category list are both reviewable and traceable to source.

---

## Phase 4: User Story 2 - Compare Component Approach Families (Priority: P2)

**Goal**: Evaluate the candidate approach families against the identified UI categories without relitigating ownership on a feature-by-feature basis.

**Independent Test**: Review the comparison sections in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md` and confirm every major category is evaluated against Dockview/custom ownership, Radix, shadcn-style wrappers, and Electron-native menus where relevant.

- [x] T013 [US2] Define the comparison criteria and category-by-category evaluation template in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T014 [P] [US2] Evaluate Dockview/custom workbench ownership and Radix primitives for each category in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T015 [P] [US2] Evaluate shadcn-style wrappers and Electron-native menus for each category in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T016 [US2] Write the comparison-matrix conclusions, fit boundaries, and explicit keep-custom decisions in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`

**Checkpoint**: User Story 2 is complete when the comparison matrix explains which categories should stay custom, which can use renderer primitives, and where native menus are acceptable or not.

---

## Phase 5: User Story 3 - Recommend A Roadmap And Next Specs (Priority: P3)

**Goal**: Turn the inventory and comparison work into a concrete decision record and bounded next-step roadmap.

**Independent Test**: Review the recommendation and roadmap sections in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md` and confirm they name an immediate next UI spec, deferred follow-on areas, and explicit rationale for the chosen ownership model.

- [x] T017 [US3] Write the preferred approach per major category and explicit non-goals in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T018 [P] [US3] Document the immediate next spec candidate, deferred follow-on areas, and bounded pilot suggestions in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- [x] T019 [P] [US3] Update the execution and validation handoff guidance in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md`
- [x] T020 [US3] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the final research outcome and recommended next slice

**Checkpoint**: User Story 3 is complete when a reviewer can name the next UI spec and the deferred areas without additional exploratory discussion.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tighten traceability and validate the completed research package.

- [x] T021 [P] Cross-check `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`, `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`, and `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/contracts/research-output.md` for coverage gaps, ambiguity, and redundant wording
- [x] T022 Run final document validation with `git diff --check` and confirm the 016 handoff summary in `/Users/stevenyi/work/blue-electron/STATUS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because the comparison matrix needs the completed inventory and categories
- **User Story 3 (Phase 5)**: Depends on User Story 2 because the recommendation must be grounded in the comparison outcome
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: First deliverable; establishes the traceable inventory and category baseline
- **User Story 2 (P2)**: Builds on US1 to evaluate the candidate component families
- **User Story 3 (P3)**: Builds on US2 to produce the decision record and roadmap

### Parallel Opportunities

- Phase 1: `T002` and `T003` can run in parallel after `T001`
- Phase 2: `T005` and `T007` can run in parallel after `T004`
- User Story 1: `T009` and `T010` can run in parallel after `T008`
- User Story 2: `T014` and `T015` can run in parallel after `T013`
- User Story 3: `T018` and `T019` can run in parallel after `T017`
- Phase 6: `T021` can run before `T022`

---

## Parallel Example: User Story 1

```bash
Task: "Populate the properties-mode Java component rows and feature mappings in /Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md"
Task: "Populate the output-mode Java component rows and feature mappings in /Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md"
```

## Parallel Example: User Story 2

```bash
Task: "Evaluate Dockview/custom workbench ownership and Radix primitives for each category in /Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md"
Task: "Evaluate shadcn-style wrappers and Electron-native menus for each category in /Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md"
```

## Parallel Example: User Story 3

```bash
Task: "Document the immediate next spec candidate, deferred follow-on areas, and bounded pilot suggestions in /Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md"
Task: "Update the execution and validation handoff guidance in /Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational audit scaffolding
3. Complete Phase 3: User Story 1
4. Stop and validate that the Java inventory document is complete and traceable before moving into comparisons

### Incremental Delivery

1. Lock the deliverables and audit baseline
2. Complete the Java/Electron inventory and category grouping in User Story 1
3. Complete the approach comparison in User Story 2
4. Complete the recommendation and roadmap in User Story 3
5. Run final validation and handoff polish

### Recommended Execution Order For This Feature

1. Finalize the dedicated inventory document and research contract
2. Complete the Java/Electron source audit and category grouping
3. Compare Dockview/custom, Radix, shadcn-style, and Electron-native approaches
4. Write the recommendation record and next-spec roadmap
5. Validate the package and update status for handoff

---

## Notes

- `[P]` tasks are limited to different files or independent sections with no dependency on incomplete work
- The recommended MVP is User Story 1 because it creates the source-traceable inventory and required UI feature list that the rest of the research depends on
- This is a documentation-only slice; runtime code changes are explicitly out of scope
