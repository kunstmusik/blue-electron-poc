# Feature Specification: Blue Data CSD Render Pipeline Parity

**Feature Branch**: `031-blue-data-csd-render-parity`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Review DATA_COMPATABILITY_REPORT.md and use spec-kit process to plan out spec. If multiple specs are appropriate, use spec kit to create the different plans. We'll do task planning and implementation one at a time per spec afterwards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate CSD That Matches Java Blue (Priority: P1)

As a composer generating CSD from a project, I need TypeScript output to match Java Blue's core render pipeline so the resulting orchestra, score, tables, automation, and duration behavior are musically equivalent.

**Why this priority**: Render parity is the point where all earlier data-model compatibility work becomes audible and testable.

**Independent Test**: Generate CSD from representative projects in Java and TypeScript and compare the resulting orchestra/score output for the compatibility cases identified in the report.

**Acceptance Scenarios**:

1. **Given** a representative project with arrangement, tables, global orchestra/score, and UDO usage, **When** TypeScript generates CSD, **Then** the output structure and content match Java's render pipeline behavior.
2. **Given** render start and end settings are used, **When** TypeScript generates CSD, **Then** render boundaries, duration macros, and end handling match Java.

---

### User Story 2 - Preserve Compile-Time Context and Automation Behavior (Priority: P1)

As a composer using automation, string channels, or compile-time instrument metadata, I need TypeScript to preserve Java's compile context so generated CSD uses the right instrument ids, parameter automation, and global score/orchestra preprocessing.

**Why this priority**: Missing compile context produces subtle but serious render differences even when the final CSD compiles.

**Independent Test**: Generate CSD from projects exercising parameter automation, always-on instruments, string channels, and render macros; compare Java and TypeScript results.

**Acceptance Scenarios**:

1. **Given** a project contains automation or compile-time source ids, **When** TypeScript generates CSD, **Then** the emitted instruments and score events match Java's compile-time behavior.
2. **Given** a project uses render macros or global score preprocessing, **When** TypeScript generates CSD, **Then** the generated score text contains Java-compatible substitutions.

---

### User Story 3 - Render From Safe Copies Instead of Live Mutable State (Priority: P2)

As a developer invoking `toCSD()` from editor or test flows, I need render generation to work from safe copies and complete compile context so generation does not mutate live project state or depend on renderer-side assumptions.

**Why this priority**: Java render parity depends on copy safety and complete compile bookkeeping, not just text concatenation.

**Independent Test**: Render representative projects while mutating the original data before and after generation; verify render generation uses copied state and stable compile bookkeeping.

**Acceptance Scenarios**:

1. **Given** a populated `BlueData` instance, **When** `toCSD()` runs, **Then** the render pipeline operates on compatibility-safe copies rather than mutating live state.
2. **Given** compile bookkeeping such as source ids or open ftable numbers is needed, **When** generation runs, **Then** TypeScript assigns them the same way Java does.

### Edge Cases

- What happens when a project uses no explicit tempo map but still relies on non-default tempo behavior?
- How should render generation behave when render end time is less than or equal to render start?
- What happens when global score macros, always-on instruments, and arrangement-generated score text all contribute to total duration?
- How should TypeScript handle projects that compile successfully in Java only because of UDO renaming or command-block preprocessing?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java `CSDRender`, `CompileData`, arrangement render helpers, and related render-time utility classes before coding starts.
- **FR-002**: `BlueData.toCSD()` MUST follow Java's render pipeline structure rather than a simplified text-concatenation approach.
- **FR-003**: Render generation MUST operate on compatibility-safe copies of the project data needed by the pipeline.
- **FR-004**: `CompileData` MUST preserve Java-compatible bookkeeping for source ids, string channels, open ftable numbers, original parameters, and related compile-time context.
- **FR-005**: Render generation MUST include Java-compatible UDO merge and collision-renaming behavior across arrangement, instruments, effects, and global code.
- **FR-006**: Render generation MUST include Java-compatible table allocation and ftgen numbering behavior.
- **FR-007**: Render generation MUST include Java-compatible arrangement global score generation and global orchestra command-block processing.
- **FR-008**: Global score preprocessing MUST support Java-compatible render macro substitution, including total duration and render start values.
- **FR-009**: Render generation MUST emit Java-compatible tempo-map output and render-end handling.
- **FR-010**: Parameter automation and related compile-time score output MUST match Java behavior.
- **FR-011**: Always-on instruments and instrument ids MUST be scheduled using Java-compatible source-id behavior rather than placeholder numbering.
- **FR-012**: Audio-layer render integration MUST use real compile-time instrument ids rather than placeholder literals.
- **FR-013**: The implementation MUST add Java-vs-TypeScript CSD comparison tests for representative projects covering the high-risk render cases identified in the report.

### Key Entities *(include if feature involves data)*

- **CSD Render Request**: A render invocation using the canonical project plus render settings.
- **Compile Data Context**: Render-time bookkeeping for instrument ids, string channels, tables, automation, and source metadata.
- **UDO Merge Result**: The combined set of project and generated UDOs after Java-compatible collision handling.
- **Render Boundary State**: Start, end, total duration, and end-instrument logic used to finalize output.
- **Automation Render Output**: Generated instruments and score events representing parameter automation during render.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Representative Java and TypeScript CSD output matches for the in-scope fixture set after normalizing incidental formatting differences.
- **SC-002**: A reviewer can generate CSD from automation-heavy and UDO-heavy projects and observe Java-compatible source-id, macro, and duration behavior.
- **SC-003**: Audio-layer and always-on instrument output no longer relies on placeholder instrument ids.
- **SC-004**: Render generation does not mutate live project state during parity tests.
- **SC-005**: Automated comparison tests cover compile data, macros, tempo-map output, automation, and representative arrangement/table/UDO cases.

## Assumptions

- Earlier specs restore enough XML and score-model fidelity that render parity can build on stable inputs.
- Formatting-only differences in generated CSD are acceptable if the semantic output matches Java behavior.
- Realtime or UI-facing menu actions are out of scope here; this slice focuses on `@blue/data` render generation itself.
