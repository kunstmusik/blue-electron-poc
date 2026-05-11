# Feature Specification: JMask Score Object Editor Parity

**Feature Branch**: `041-jmask-score-object-editor`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "Split the old grouped Tier 2 score-object follow-up so `JMask` gets its own deeper planning slice, with explicit Java Blue UI/UX analysis reflected in the task breakdown."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build JMask Parameters From A Real Editor Stack (Priority: P1)

As a composer using `JMask`, I need a real parameter-editor stack with add, remove, reorder, and generator selection workflows so I can build generative note behavior from the auxiliary editor instead of seeing seed controls only.

**Why this priority**: The current `JMask` surface is materially incomplete, and the Java editor is driven by a deep parameter list workflow rather than a small form.

**Independent Test**: Select a `JMask`, add or edit supported parameters, change generator types, and verify the canonical object updates while the scrollable editor shell stays synchronized.

**Acceptance Scenarios**:

1. **Given** a `JMask` object is selected, **When** the auxiliary editor opens, **Then** it shows a real parameter-stack workflow instead of seed controls only.
2. **Given** the user adds, removes, reorders, or edits supported parameters, **When** the change commits, **Then** the canonical `JMask` model updates and the editor refreshes coherently.

---

### User Story 2 - Configure Optional Mask, Quantizer, And Probability Sections (Priority: P1)

As a composer shaping `JMask` behavior, I need the optional sub-editors and distribution controls that Java Blue exposes so I can configure how each parameter is generated.

**Why this priority**: `JMask` parity is not credible without the optional per-parameter sections that differentiate it from a basic generator form.

**Independent Test**: Enable a supported optional section, edit its controls, and verify the canonical parameter data remains synchronized and survives save or reload.

**Acceptance Scenarios**:

1. **Given** a parameter supports mask, quantizer, accumulator, or probability configuration, **When** the user enables that section, **Then** the editor shows a deliberate sub-editor instead of a placeholder.
2. **Given** the user edits a supported optional-section control, **When** the change commits, **Then** the canonical `JMask` data updates while unsupported fields remain deliberately surfaced.

---

### User Story 3 - Inspect Table-Based And Test-Oriented JMask Workflows (Priority: P2)

As a composer validating generative results, I need the table-based visualizations and the Java-style test flow where practical so I can inspect what the `JMask` object is doing from the editor itself.

**Why this priority**: The table and test workflows are important parity touchpoints, but they should land only after the core parameter stack is planned clearly.

**Independent Test**: Edit a supported table-based control or invoke the test flow claimed by this slice, then verify the editor surfaces the result or a deliberate deferred state.

**Acceptance Scenarios**:

1. **Given** a selected parameter uses a supported table-based or probability-driven editor, **When** the user opens that section, **Then** the editor shows a deliberate visualization or form rather than hiding the data.
2. **Given** the user invokes the `JMask` test flow or preview claimed by this slice, **When** the result is returned, **Then** the UI shows the generated note output or an explicit failure state for the selected target.

### Edge Cases

- What happens when the selected `JMask` contains generator or probability types that the renderer can preserve but not yet edit fully?
- What happens when the user reorders parameters while one parameter editor is expanded or partially edited?
- What happens when a table-based editor contains more points than fit comfortably in the visible canvas?
- What happens when the selected `JMask` target is removed while the user is editing a nested parameter form?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue `JMask` UI/UX anchors before coding begins, including `JMaskEditor`, `EditorListPanel`, `JMaskEditorLayout`, `ParameterEditor`, `GeneratorEditorFactory`, `MaskEditor`, `QuantizerEditor`, `ProbabilityEditor`, and `TableCanvas`.
- **FR-002**: The score-object editor document contract MUST grow a dedicated `JMaskEditorSnapshot` that models parameter-stack data instead of reusing the current seed-only structured payload.
- **FR-003**: The renderer MUST provide a scrollable parameter-editor stack with supported add, remove, reorder, expand, and generator-selection workflows.
- **FR-004**: The implementation MUST define canonical patch boundaries for parameter-list mutations, generator updates, optional-section toggles, and supported nested editor changes.
- **FR-005**: The editor MUST expose supported optional sections such as mask, quantizer, accumulator, probability, and table-driven editors where the TypeScript model can support them honestly.
- **FR-006**: The implementation MUST document which generator, probability, and table workflows are fully supported versus explicitly deferred.
- **FR-007**: The editor MUST preserve unsupported `JMask` data deliberately instead of silently flattening or dropping it from the model.
- **FR-008**: The implementation MUST add tests covering `JMask` document creation, parameter-stack rendering, supported mutations, removed-target fallback behavior, and any test or table workflows claimed by this slice.

### Key Entities *(include if feature involves data)*

- **JMaskEditorSnapshot**: The typed auxiliary-editor payload for `JMask`, including seed controls, parameter-stack data, and declared editing capabilities.
- **JMaskParameterSnapshot**: The renderer-facing description of one parameter row, including generator type, nested optional sections, and unsupported-data markers.
- **JMaskParameterMutation**: The canonical patch payload for one committed parameter-list or nested-parameter edit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can select a `JMask` object and use a real parameter-stack editor instead of seed controls only.
- **SC-002**: A reviewer can edit supported optional sections and observe coherent canonical updates without losing unsupported data.
- **SC-003**: A reviewer can use any table or test workflows explicitly claimed by this slice and receive either a deliberate visualization or an explicit deferred state.
- **SC-004**: Automated tests cover the `JMask` payload, parameter-stack routing, supported nested mutations, removed-target fallback behavior, and any table or test flows claimed by this slice.

## Assumptions

- Spec `038-score-object-editor-tier1-parity` is already closed, so this slice can focus on the heavyweight `JMask` editor gap only.
- The `JMask` UI will require more dedicated form and canvas work than the existing generic structured editor shell can provide.
- The `Sound` and `PianoRoll` follow-up work will live in Specs `039-sound-score-object-editor` and `040-pianoroll-score-object-editor`, not in this slice.
