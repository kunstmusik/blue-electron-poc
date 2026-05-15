# Tasks: JMask Score Object Editor Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-009. Add `@blue/data`, contract, renderer, and nested-mutation coverage before or alongside the implementation it protects.

## Phase 1: Setup

- [ ] T001 Review the Java Blue `JMaskEditor`, `EditorListPanel`, `JMaskEditorLayout`, `ParameterEditor`, `TableCanvas`, `GeneratorRegistry`, and `ProbabilityEditorFactory` anchors documented in `research.md`
- [ ] T002 [P] Inventory the current `JMaskEditor.tsx` placeholder, the current `project-editor.ts` seed-only contract, Spec 040 interaction or test patterns, and reusable renderer form or canvas components
- [ ] T003 [P] Inventory the current `@blue/data` `JMask` gap: top-level seed-only shell, missing `Field` or `Parameter` subsystem, missing generator or modifier models, and missing note-generation path
- [ ] T004 [P] Catalog the Java generator, probability, modifier, and table-driven editor families that appear in the workflow: `Constant`, `Item List`, `Segment`, `Random`, `Probability`, `Oscillator`, `Uniform`, `Triangle`, `Linear`, `Exponential`, `Gaussian`, `Cauchy`, `Beta`, `Weibull`, `Mask`, `Quantizer`, and `Accumulator`

## Phase 2: Model And Contract Foundation

- [ ] T005 [P] Add `@blue/data` unit tests for `JMask` XML round-trip and deep-copy coverage across `Field`, `Parameter`, visibility, field names, generator registry ordering, and optional-section preservation
- [ ] T006 Port `Field`, `Parameter`, `GeneratorRegistry`, and the core generator interfaces into `@blue/data`, then cover canonical add, remove, push, rename, visibility, and change-type operations with unit tests
- [ ] T007 Port the core generator classes into `@blue/data`: `Constant`, `ItemList`, `Segment`, `Random`, `Probability`, and `Oscillator`, with unit tests for their editable fields and XML preservation
- [ ] T008 Port `Mask`, `Quantizer`, `Accumulator`, `Table`, `TablePoint`, `DoubleOrTable`, and the probability generator classes into `@blue/data`, with unit tests for nested serialization and supported table state
- [ ] T009 Port the `JMask` note-generation prerequisites into `@blue/data` and add unit tests that establish whether preview is fully supported or must remain explicitly deferred
- [ ] T010 [P] Add shared contract tests for `JMaskEditorSnapshot`, visibility-popup items, parameter-row payloads, generator unions, modifier payloads, probability subtype payloads, table payloads, and explicit unsupported-data markers
- [ ] T011 Extend the score-object editor document union in `packages/blue-app/src/shared/project-editor.ts` with dedicated `JMask` snapshot types for the top bar, visibility popup, parameter rows, generator unions, optional sections, table payloads, and preview capability state
- [ ] T012 Define canonical mutation helpers and patch shapes for seed edits, parameter add or remove or push operations, row visibility toggles, double-click rename, generator updates, optional-section toggles, probability selection, and table point operations
- [ ] T013 Add removed-target fallback, unsupported-data preservation, and duration-propagation coverage for the new `JMask` payload in shared and main-process tests

## Phase 3: User Story 1 - Top Bar And Parameter Stack (P1)

- [ ] T014 [P] [US1] Add renderer tests for the top bar behavior: title, options popup, seed toggle or spinner, preview button, and `Cmd/Ctrl+T` shortcut behavior or explicit deferred preview state
- [ ] T015 [P] [US1] Add renderer tests for parameter-row chrome and lifecycle: full-width stacked layout, hidden-row filtering, renumbering after edits, and protected removal rules for the first three rows
- [ ] T016 [P] [US1] Add renderer tests for row interactions: right-click context menu, add before or after, remove, push up or down, change type, double-click rename, and modifier-toggle availability
- [ ] T017 [US1] Map Java `EditorListPanel` and `JMaskEditorLayout` behavior into the React shell plan, including viewport-width tracking, scroll behavior, hidden-row filtering, and duration propagation into open rows
- [ ] T018 [US1] Implement the JMask top bar with the title, visibility popup, seed controls, and the preview or test entry point claimed by this slice
- [ ] T019 [US1] Implement the scrollable parameter stack with Java-style full-width rows, hidden-row filtering, renumbering, and renderer-local expansion or focus state
- [ ] T020 [US1] Implement parameter-row menus and label behaviors: right-click context menu, double-click rename, protected first-three-row removal state, and section-toggle availability based on generator interfaces
- [ ] T021 [US1] Implement generator type chooser routing using the Java registry order for add and change-type flows: `Constant`, `Item List`, `Segment`, `Random`, `Probability`, and `Oscillator`

## Phase 4: User Story 2 - Generator Editors (P1)

- [ ] T022 [P] [US2] Add renderer and mutation tests for the `Constant` and `Random` generator editors
- [ ] T023 [P] [US2] Add renderer and mutation tests for the `Item List` generator editor, including list-mode switching plus item add, edit, and remove flows
- [ ] T024 [P] [US2] Add renderer and mutation tests for the `Segment` generator editor, including its table surface or explicit deferred table boundary
- [ ] T025 [P] [US2] Add renderer and mutation tests for the `Oscillator` generator editor, including waveform selection, phase or exponent edits, and constant-versus-table frequency routing
- [ ] T026 [P] [US2] Add renderer and mutation tests for the `Probability` generator shell, subtype selection, and the no-extra-control states for `Uniform` and `Triangle`
- [ ] T027 [US2] Implement the `Constant` and `Random` generator editors and canonical patch wiring
- [ ] T028 [US2] Implement the `Item List` generator editor and canonical patch wiring
- [ ] T029 [US2] Implement the `Segment` generator editor surface plus canonical table patch wiring, or surface explicit deferred messaging if interactive tables are scoped out
- [ ] T030 [US2] Implement the `Oscillator` editor with waveform selector, phase or exponent controls, and fixed-frequency versus frequency-table switching
- [ ] T031 [US2] Implement the `Probability` generator shell with subtype selector and nested routing for `Uniform`, `Triangle`, `Linear`, `Exponential`, `Gaussian`, `Cauchy`, `Beta`, and `Weibull`

## Phase 5: User Story 2 - Modifiers, Tables, And Nested Probability Editors (P1)

- [ ] T032 [P] [US2] Add renderer and mutation tests for `Mask`, `Quantizer`, and `Accumulator` toggles and sub-editors, including duration-sensitive updates where applicable
- [ ] T033 [P] [US2] Add renderer tests for Java `TableCanvas` parity interactions: hover selection, left-click insert, `Alt+Click` insert-on-line, drag within neighbor boundaries, and right-click removal of non-endpoints
- [ ] T034 [P] [US2] Add renderer and mutation tests for the parameterized probability subtype editors: `Linear`, `Exponential`, `Gaussian`, `Cauchy`, `Beta`, and `Weibull`
- [ ] T035 [US2] Implement the `Mask` editor with high or low numeric controls, map value behavior, and high or low table routing
- [ ] T036 [US2] Implement the `Quantizer` editor with the supported Java controls and table behavior, or surface explicit deferred messaging for excluded pieces
- [ ] T037 [US2] Implement the `Accumulator` editor with the supported accumulation controls and canonical patch wiring
- [ ] T038 [US2] Implement the parameterized probability subtype editors `Linear`, `Exponential`, `Gaussian`, `Cauchy`, `Beta`, and `Weibull`, and keep `Uniform` and `Triangle` deliberate as no-extra-control states
- [ ] T039 [US2] Implement the shared table-editing surface and canonical table patches wherever the claimed generator or modifier editors expose Java-style table workflows

## Phase 6: User Story 3 - Preview And Unsupported Data (P2)

- [ ] T040 [P] [US3] Add renderer and main-process tests for the `JMask` preview or test flow plus unsupported-data messaging
- [ ] T041 [US3] Implement the preview or test flow claimed by this slice for the selected `JMask` target only after the `@blue/data` generation path is functional; otherwise surface explicit deferred preview messaging in the top bar and quickstart docs
- [ ] T042 [US3] Implement explicit unsupported-data surfacing and reload-safe preservation messaging for any unedited generator, modifier, probability, or table forms in the editor shell

## Phase 7: Polish And Validation

- [ ] T043 [P] Update `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` with the final supported generator, probability, table, and preview subset
- [ ] T044 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the planning or implementation handoff state for Spec 041
- [ ] T045 Run `pnpm --filter @blue/data test`
- [ ] T046 Run `pnpm --filter @blue/app exec vitest run --config vitest.config.ts --browser.enabled=false`
- [ ] T047 Run `pnpm --filter @blue/app test`
- [ ] T048 Run `pnpm --filter @blue/app build:renderer`
- [ ] T049 Run `git diff --check`
- [ ] T050 Perform the manual `JMask` validation scenarios from `quickstart.md`

## Handoff Notes

- The current TypeScript port does not yet include the nested `JMask` field subsystem, so Spec 041 must treat `@blue/data` model work as a prerequisite instead of assuming renderer-only parity.
- Keep unsupported `JMask` nested data explicit and reload-safe rather than flattening it into a shallow form.
- Do not claim generator, modifier, probability, or table parity until the supported subset is documented concretely.
- Mirror the Java row interactions deliberately: top-bar visibility popup, double-click label rename, right-click parameter menus, protected first-three-row removal behavior, and `Cmd/Ctrl+T` preview entry.
- Keep any preview behavior scoped to the selected `JMask` target and aligned with existing editor-side modal patterns.
