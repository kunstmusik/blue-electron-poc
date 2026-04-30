# Feature Specification: Blue Data Score, Library, and Sound Object Model Parity

**Feature Branch**: `029-blue-data-score-library-parity`  
**Created**: 2026-04-29  
**Status**: Complete
**Input**: User description: "Review DATA_COMPATABILITY_REPORT.md and use spec-kit process to plan out spec. If multiple specs are appropriate, use spec kit to create the different plans. We'll do task planning and implementation one at a time per spec afterwards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Library-Backed Java Projects Correctly (Priority: P1)

As a composer opening older or library-heavy Java Blue projects, I need score structures, sound-object libraries, and instrument libraries to resolve correctly so references and legacy arrangements still point at the intended content.

**Why this priority**: Broken library resolution leaves projects structurally loaded but semantically wrong, especially for `Instance` sound objects and older arrangement/instrument mappings.

**Independent Test**: Load representative Java projects containing `soundObjectLibrary`, `Instance` sound objects, legacy arrangement instrument ids, and nested score structures; verify references resolve and resave without reference loss.

**Acceptance Scenarios**:

1. **Given** a Java project contains `Instance` sound objects backed by library entries, **When** TypeScript loads it, **Then** each instance resolves to the intended library object and survives save/reopen.
2. **Given** an older project uses instrument-library-backed arrangement ids, **When** TypeScript loads it, **Then** arrangement assignments resolve the same way Java does.

---

### User Story 2 - Save Score and Sound Object XML That Java Can Reopen (Priority: P1)

As a composer moving projects between Java Blue and the TypeScript port, I need score, layer, and sound object XML written by TypeScript to follow Java's schema so reopening in Java does not corrupt project structure.

**Why this priority**: TypeScript-specific score XML breaks cross-tool save compatibility even when load seems to work locally.

**Independent Test**: Load, edit, and save projects using `GenericScore`, `PolyObject`, `PatternLayer`, `AudioLayer`, and other common sound objects; reopen in Java Blue and verify structure and content remain intact.

**Acceptance Scenarios**:

1. **Given** a project contains Java-style sound object XML, **When** TypeScript loads and saves it, **Then** the saved XML uses Java-compatible types and common fields.
2. **Given** a `GenericScore` contains score text, **When** TypeScript saves it, **Then** Java can reopen the score text without relying on a TypeScript-only tag name.

---

### User Story 3 - Preserve Score and Layer Model Semantics (Priority: P2)

As a developer building later parity slices, I need score, layer, and sound-object model behavior to match Java defaults and copy semantics so render and editor features can depend on stable shared models.

**Why this priority**: Score/layer defaults, deep-copy behavior, and class-name resolution are prerequisites for later note-processing and render work.

**Independent Test**: Construct and deep-copy representative score trees with nested `PolyObject`, `SoundLayer`, pattern layers, and audio layers; verify defaults, preserved fields, and type resolution match Java expectations.

**Acceptance Scenarios**:

1. **Given** a score is created or loaded with minimal content, **When** TypeScript normalizes it, **Then** it contains Java-compatible default root score structure.
2. **Given** a score tree is deep-copied, **When** child layers or objects are mutated on the copy, **Then** the source score remains unchanged and the copied tree retains Java-compatible fields.

### Edge Cases

- What happens when a sound object or layer type is saved with a Java full class name in one project and a short type name in another?
- How should TypeScript handle corrupt library entries or unresolved instance references that Java skips or preserves specially?
- What happens when a project omits layer groups or uses only legacy score structures?
- How should pattern and audio layer XML behave when they come from Java modules outside `blue-core`?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java `SoundObjectLibrary`, `InstrumentLibrary`, `Score`, `PolyObject`, `SoundLayer`, `GenericScore`, and the Java pattern/audio layer modules before coding starts.
- **FR-002**: `SoundObjectLibrary` MUST load, save, and deep-copy Java-compatible library sound objects, including stable `objRefId` handling.
- **FR-003**: `Instance` sound objects MUST resolve library references using Java-compatible object-reference mapping behavior.
- **FR-004**: `InstrumentLibrary` MUST preserve Java-compatible category-tree structure and support legacy arrangement instrument resolution.
- **FR-005**: Sound object XML save MUST use Java-compatible type names and common base fields instead of TypeScript-only short-name contracts.
- **FR-006**: `GenericScore` MUST load and save score text using the Java-compatible score field contract.
- **FR-007**: `Score` MUST restore Java-compatible default root structure, including root layer-group expectations when legacy input omits explicit groups.
- **FR-008**: `SoundObjectRegistry` and related loaders MUST accept Java full class names consistently across score, pattern, audio, and live-data contexts.
- **FR-009**: `PolyObject` and `SoundLayer` MUST preserve Java-compatible XML fields, copy behavior, and model state required for later render parity.
- **FR-010**: Pattern layers MUST load Java-compatible sound object children rather than only a TypeScript short-name subset.
- **FR-011**: Audio layer, pattern layer, and related score-layer XML MUST preserve compatibility with their Java module counterparts.
- **FR-012**: The implementation MUST add round-trip tests for library-backed projects, nested score trees, `GenericScore` score text, and representative pattern/audio layer structures.

### Key Entities *(include if feature involves data)*

- **SoundObjectLibrary**: The root library of reusable sound objects addressed by stable reference ids.
- **Library Reference Binding**: The relationship between an `Instance` sound object and its referenced library entry.
- **Instrument Library Tree**: Java-compatible hierarchy used for legacy arrangement and instrument resolution.
- **Score Graph**: The root score plus nested layer groups, sound layers, and sound objects that make up the project timeline structure.
- **Sound Object Envelope**: Java-compatible base XML contract shared by concrete sound object types.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can load and resave a library-backed Java project without losing library entries or `Instance` bindings.
- **SC-002**: A reviewer can reopen TypeScript-saved score XML in Java Blue and confirm `GenericScore`, `PolyObject`, and common sound objects still load correctly.
- **SC-003**: A reviewer can load a legacy score that omits explicit modern layer structure and observe Java-compatible normalized score defaults.
- **SC-004**: A reviewer can deep-copy nested score trees and verify child-layer mutation does not leak back into the source tree.
- **SC-005**: Automated tests cover full-class-name loading, library reference resolution, and representative score/layer XML round-trips.

## Assumptions

- This slice focuses on score and sound-object model fidelity, not the full note-processing or render-generation semantics of every object.
- Later specs will handle note parser/processors and end-to-end `toCSD()` parity after the shared model contracts are stable.
- Java module boundaries do not limit compatibility scope; pattern and audio layers are in scope because their XML participates in project round-trips.
