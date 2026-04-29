# Feature Specification: Blue Data XML Preservation and Root Compatibility

**Feature Branch**: `028-blue-data-xml-preservation`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Review DATA_COMPATABILITY_REPORT.md and use spec-kit process to plan out spec. If multiple specs are appropriate, use spec kit to create the different plans. We'll do task planning and implementation one at a time per spec afterwards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Existing Java Projects Without Root Data Loss (Priority: P1)

As a composer opening an existing Java Blue project, I need `@blue/data` to load every root project section that affects project behavior so the TypeScript port does not silently drop project data before I even edit anything.

**Why this priority**: Silent root-level data loss invalidates every later parity effort because the project is already damaged on first load.

**Independent Test**: Load representative Java `.blue` projects containing `soundObjectLibrary`, `instrumentLibrary`, legacy root `udo`, legacy root `timeContext`, plugin data, markers, scratch data, MIDI input processor data, and missing mixer sections; verify the resulting `BlueData` object retains all sections and resaves them without section loss.

**Acceptance Scenarios**:

1. **Given** a Java `.blue` file contains root sections that TypeScript previously ignored, **When** `BlueData.loadFromString()` loads it, **Then** each section is either fully deserialized or preserved losslessly for save.
2. **Given** a Java `.blue` file omits `<mixer>`, **When** it loads, **Then** the resulting project matches Java's disabled-mixer behavior rather than TypeScript's enabled default.

---

### User Story 2 - Save Java-Compatible Root XML (Priority: P1)

As a composer moving between Java Blue and the TypeScript port, I need root project XML written by `@blue/data` to remain Java-compatible so save/reopen and cross-application round-trips are safe.

**Why this priority**: Cross-tool save compatibility is the core constitution requirement for `blue-data`.

**Independent Test**: Load a Java project, save it from TypeScript, reopen it in Java Blue, and verify that root project sections, property defaults, legacy migrations, and lossless preservation behavior still work.

**Acceptance Scenarios**:

1. **Given** a project was loaded from Java XML, **When** TypeScript saves it, **Then** root sections are emitted in Java-compatible structure and field naming.
2. **Given** a project contains legacy root property tags or aliases, **When** TypeScript loads and saves it, **Then** the normalized output remains Java-compatible and no user data is lost.

---

### User Story 3 - Copy and Migrate Projects Safely (Priority: P2)

As a developer using `BlueData.deepCopy()` and migration paths during render or editor operations, I need root project copies and upgrades to preserve the full document so later operations do not mutate or strip project state.

**Why this priority**: Parity-safe render and editing work depends on complete copies and correct migration of older XML.

**Independent Test**: Deep-copy a representative `BlueData` instance with populated root sections, mutate the copy, and verify the source object remains unchanged while the copy retains the same root content and compatibility-relevant defaults.

**Acceptance Scenarios**:

1. **Given** a `BlueData` instance contains full project state, **When** `deepCopy()` runs, **Then** the copy contains the same root sections as Java's copy constructor semantics.
2. **Given** older Java XML requires root migration, **When** TypeScript loads it, **Then** migration produces the same durable project state Java would use for later save and render work.

### Edge Cases

- What happens when a file mixes current and legacy root sections, such as both normalized project properties and legacy `commandLine` tags?
- How should unknown or not-yet-ported plugin data be preserved when the TypeScript model cannot yet execute that plugin behavior?
- What happens when a library-backed arrangement depends on root sections loading in a specific order?
- How should save behavior handle empty but present root sections versus truly absent sections?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java `blue.BlueData` root load, save, copy, and upgrade behavior before coding starts.
- **FR-002**: `BlueData.loadFromString()` MUST load or losslessly preserve `soundObjectLibrary`, `instrumentLibrary`, legacy root `udo`, legacy root `timeContext`, plugin data, markers, scratch data, and MIDI input processor data.
- **FR-003**: Root project load order MUST match Java where ordering affects later deserialization, including library-backed arrangement and object-reference resolution.
- **FR-004**: Root project save MUST emit Java-compatible XML structures and field names for all in-scope root sections.
- **FR-005**: `BlueData.deepCopy()` MUST preserve all root sections required by Java's copy constructor semantics.
- **FR-006**: Missing `<mixer>` input MUST produce Java-compatible disabled-mixer state.
- **FR-007**: Project properties defaults MUST match Java defaults rather than current TypeScript placeholder defaults.
- **FR-008**: Project properties load MUST support Java legacy migration behavior for control-rate and command-line related fields.
- **FR-009**: Legacy aliases such as Java's older media-copy property names MUST be accepted on load and normalized safely on save.
- **FR-010**: Loaded `ProjectProperties` MUST be wired into time-related root state the same way Java does so later time calculations observe project settings.
- **FR-011**: Unknown or deferred root sections MUST not be discarded merely because TypeScript does not yet implement their full behavior.
- **FR-012**: The implementation MUST add round-trip tests for representative root XML permutations, including legacy files and files with omitted mixer sections.

### Key Entities *(include if feature involves data)*

- **BlueData Root Document**: The top-level project envelope containing arrangement, score, libraries, properties, mixer, plugin data, live data, and preservation-only sections.
- **Preservation Section**: A root-level XML-backed section that must survive load and save even if TypeScript does not yet fully execute its runtime behavior.
- **Project Properties Envelope**: Canonical project property state, including normalized defaults and migrated legacy fields.
- **Root Copy Invariant**: The requirement that a copied `BlueData` instance preserve the same compatibility-relevant root sections as the source object.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A representative Java `.blue` file with populated root sections can be loaded and resaved without losing any root section that exists in the input.
- **SC-002**: A reviewer can reopen TypeScript-saved root XML in Java Blue and confirm root sections remain loadable.
- **SC-003**: A reviewer can load a project with no `<mixer>` section and observe Java-compatible disabled-mixer state after load.
- **SC-004**: A reviewer can deep-copy a populated `BlueData` instance and verify root sections in the copy match the source while later mutations do not leak across objects.
- **SC-005**: Automated `@blue/data` tests cover current, legacy, and omitted-root-section cases for this slice.

## Assumptions

- This slice focuses on root document fidelity and preservation, not the full internal behavior of every nested subsystem.
- Unknown plugin-specific runtime behavior may remain deferred as long as its XML survives losslessly.
- Later specs will handle deeper parity for score models, note processing, render generation, and runtime subsystems once root preservation is safe.
