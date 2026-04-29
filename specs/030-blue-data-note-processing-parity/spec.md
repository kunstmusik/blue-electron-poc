# Feature Specification: Blue Data Note Parsing and Note Processor Parity

**Feature Branch**: `030-blue-data-note-processing-parity`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Review DATA_COMPATABILITY_REPORT.md and use spec-kit process to plan out spec. If multiple specs are appropriate, use spec kit to create the different plans. We'll do task planning and implementation one at a time per spec afterwards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parse Java Score Text the Same Way (Priority: P1)

As a composer using existing Blue score text, I need note parsing semantics to match Java so score strings produce the same note events, durations, and pfield carry behavior after moving to the TypeScript port.

**Why this priority**: Divergent note parsing changes musical output even when XML and UI appear correct.

**Independent Test**: Run Java and TypeScript against representative score text fixtures covering carries, ramps, comments, continuation lines, ties, bracketed expressions, and pfield shorthand; verify the resulting notes and durations match.

**Acceptance Scenarios**:

1. **Given** score text uses Java carry and shorthand semantics, **When** TypeScript parses it, **Then** the produced notes match Java behavior.
2. **Given** score text includes comments, ties, ramps, or continuation lines, **When** TypeScript parses it, **Then** timing and pfield results match Java.

---

### User Story 2 - Load and Save Java Note Processor Chains (Priority: P1)

As a composer reopening projects with note processor chains, I need TypeScript to load, preserve, and save those chains in Java-compatible form so processor-enabled projects survive round-trip editing.

**Why this priority**: Note processor chains are stored in project XML and are currently broken by short type names and missing processor support.

**Independent Test**: Load Java projects with named and inline note processor chains, save them from TypeScript, reopen them in Java Blue, and verify the same processors and parameters remain present.

**Acceptance Scenarios**:

1. **Given** a project contains Java full-class-name note processors, **When** TypeScript loads it, **Then** each processor is recognized or preserved without loss.
2. **Given** a project contains named note processor chains, **When** TypeScript saves it, **Then** Java can reopen the same chain definitions.

---

### User Story 3 - Execute Processors with Java Semantics (Priority: P2)

As a composer rendering a score through note processors, I need processor behavior to match Java so generated notes are musically equivalent across the two implementations.

**Why this priority**: Several current processors materially alter pitch, time, or note selection incorrectly.

**Independent Test**: Execute representative processor chains in Java and TypeScript and compare resulting notes for the known incompatible processors identified in the compatibility report.

**Acceptance Scenarios**:

1. **Given** a note processor chain contains pitch, time, random, line-based, or subset processors, **When** TypeScript executes the chain, **Then** the resulting notes match Java semantics.
2. **Given** a processor receives invalid input that Java rejects, **When** TypeScript executes it, **Then** the same failure is surfaced instead of silently skipping the error.

### Edge Cases

- What happens when processor XML uses Java full class names, short names, or legacy parameter shapes?
- How should TypeScript handle processors that Java supports but the current port does not yet implement, such as `PythonProcessor`?
- What happens when score parsing depends on objective duration rather than subjective duration?
- How should seeded random processors behave when the same seed is reused across repeated runs?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java `Note`, `ScoreUtilities`, note parser behavior, `NoteProcessorChain`, `NoteProcessorChainMap`, and representative Java note processor classes before coding starts.
- **FR-002**: Score text parsing MUST match Java behavior for pfield carry, `.` carry, `+` start-time expansion, ramps, comments, continuation lines, bracketed expressions, and tied-note handling.
- **FR-003**: `Note` timing helpers, end-time calculations, and objective-duration-related behavior MUST match Java semantics.
- **FR-004**: Shared score parsing MUST be used consistently so `GenericScore` does not diverge from the core parser contract.
- **FR-005**: `ScoreUtilities` time-behavior helpers MUST match Java behavior, including `durationForScale` handling and duration calculations.
- **FR-006**: Note processor XML save MUST use Java-compatible type naming and field contracts.
- **FR-007**: Note processor XML load MUST accept Java full class names consistently.
- **FR-008**: `NoteProcessorChainMap` MUST preserve named chains through load, save, and copy behavior.
- **FR-009**: The implementation MUST restore Java-compatible processor semantics for the incompatible processors identified in the compatibility report, including equals, rotate, line add/multiply, pch add, pch inversion, tuning, time warp, sublist, random add, random multiply, add, and multiply.
- **FR-010**: Missing Java processor support that is required for project compatibility, including `PythonProcessor`, MUST either be implemented or preserved without silent data loss.
- **FR-011**: Processor execution MUST surface Java-compatible failure behavior where Java throws or rejects invalid configuration.
- **FR-012**: The implementation MUST add parser and processor parity tests comparing representative Java and TypeScript fixtures.

### Key Entities *(include if feature involves data)*

- **Parsed Note Event**: A score note with Java-compatible pfield, timing, objective duration, and end-time semantics.
- **Note Processor Descriptor**: One serialized note processor definition with type, parameters, and Java-compatible XML identity.
- **Note Processor Chain**: Ordered processors applied to a note list.
- **Named Note Processor Chain Map**: Root-level mapping of named processor chains used by score objects and other project sections.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Representative Java score text fixtures produce the same parsed notes in TypeScript.
- **SC-002**: A reviewer can load, save, and reopen Java note processor chain XML without losing processors or names.
- **SC-003**: A reviewer can compare TypeScript and Java output for the high-risk processors identified in the report and observe matching note results.
- **SC-004**: Invalid processor configurations that Java rejects are not silently ignored by TypeScript.
- **SC-005**: Automated tests cover parser semantics, named chains, Java full-class-name load, and the previously incompatible processor behaviors.

## Assumptions

- This slice focuses on note parsing and note processor behavior, not the entire end-to-end render pipeline that later consumes those notes.
- Java source behavior is the source of truth when TypeScript and Java currently disagree on musical output.
- Some runtime-heavy or JVM-backed processor behavior may be preserved first if safe execution requires a later spec, but XML loss is not acceptable.
