# Feature Specification: Score Object Editor Parity

**Feature Branch**: `037-score-object-editor-parity`  
**Created**: 2026-05-03  
**Status**: Complete  
**Input**: User description: "Continue the planned score work after the score shell lands by implementing the Java Blue ScoreObject editor and ScoreObject properties auxiliary surfaces."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Shared ScoreObject Properties (Priority: P1)

As a composer selecting items in the score, I need a real `ScoreObjectPropertiesTopComponent` so I can edit shared ScoreObject fields such as name, time, color, and time behavior without leaving the main score workflow.

**Why this priority**: The shared properties surface is the fastest way to make score selections editable across many object types, and it is one of the user's explicit requirements for the overall score feature.

**Independent Test**: Select supported score objects and audio clips from the score timeline, edit the shared fields in the properties panel, and verify the score view and canonical project data update immediately.

**Acceptance Scenarios**:

1. **Given** exactly one supported score object is selected, **When** the properties panel opens, **Then** it shows the Java Blue-style shared fields for that selection.
2. **Given** the user changes shared properties such as name, start time, subjective duration, color, or supported time behavior controls, **When** the edit is applied, **Then** the backing project score updates and the visible timeline reflects the change.

---

### User Story 2 - Open The Correct Type-Specific Editor (Priority: P1)

As a composer working with different score-object types, I need `ScoreObjectEditorTopComponent` to route the selection to the correct type-specific editor so I can edit score-object content with Java Blue-style affordances instead of generic placeholders.

**Why this priority**: The overall score feature requires more than shell-level editing. Type-specific editors are how the user actually edits score-object contents in Java Blue.

**Independent Test**: Select each supported score-object type and `AudioClip`, observe the correct editor load in `ScoreObjectEditorTopComponent`, make an edit, and verify the editor writes back to the project model.

**Acceptance Scenarios**:

1. **Given** a supported score-object or `AudioClip` selection, **When** `ScoreObjectEditorTopComponent` becomes active, **Then** it loads the correct editor surface for that type.
2. **Given** the active type-specific editor changes supported content fields, **When** the user saves or commits the edit through the surface, **Then** the backing score object updates without losing selection context.

---

### User Story 3 - Handle Library-Backed And Unsupported Objects Safely (Priority: P2)

As a composer working with library-backed or partially supported projects, I need the auxiliary score-editor surfaces to behave clearly when the selection is an `Instance`, a library-owned object, multiple objects, or a Java-only unported object type.

**Why this priority**: Java Blue projects regularly contain library-backed score objects, and the Electron port must degrade safely where full editor parity is not yet possible.

**Independent Test**: Select an `Instance`, a library-owned object, multiple objects, and an unsupported Java-only object, and confirm the auxiliary surfaces either open the correct target or show a deliberate empty or unsupported state.

**Acceptance Scenarios**:

1. **Given** the selected score object is an `Instance` or a library-owned object, **When** the auxiliary editor surfaces open, **Then** they target the underlying editable object and clearly indicate the library-editing context.
2. **Given** the selection is unsupported, ambiguous, or empty, **When** the auxiliary surfaces refresh, **Then** they show a stable empty or unsupported state instead of a stale editor.

### Edge Cases

- What happens when no score object is selected and either auxiliary score-editor panel is visible?
- What happens when the selected object type exists in Java Blue but does not yet have a TypeScript data model or editor?
- What happens when the selected object is removed while its editor or properties panel is open?
- What happens when the selection contains more than one score object or mixes object families with incompatible editor behavior?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue auxiliary score-editor anchors before coding begins, including the legacy `SoundObjectPropertiesTopComponent`, `ScoreObjectEditorTopComponent`, `AudioClipEditor`, and the registered `ScoreObjectEditor` plugin classes.
- **FR-002**: The renderer MUST implement a real `ScoreObjectPropertiesTopComponent` surface that covers the shared ScoreObject fields used by Java Blue, including name, start time, subjective duration, color, and supported time-behavior controls.
- **FR-003**: The properties panel MUST support the shared note-processor-chain and repeat-point behaviors that Java exposes for sound-object types where those concepts apply.
- **FR-004**: The renderer MUST implement a plugin-style or registry-style `ScoreObjectEditorTopComponent` surface that selects one type-specific editor per active supported score-object type.
- **FR-005**: The editor registry MUST cover the score-object types already supported by the TypeScript port plus `AudioClip`: `GenericScore`, `PolyObject`, `PythonObject`, `JavaScriptObject`, `Comment`, `AudioFile`, `Sound`, `External`, `Instance`, `LineObject`, `ZakLineObject`, `PatternObject`, `PianoRoll`, `JMask`, `TrackerObject`, `NotationObject`, `FrozenSoundObject`, and `AudioClip`.
- **FR-006**: The implementation MUST define explicit fallback behavior for Java-only or otherwise unported object types such as `ObjectBuilder` instead of pretending full parity exists where the data model does not.
- **FR-007**: Selecting an `Instance` or library-owned object MUST route editing to the underlying referenced object while clearly signaling the library-editing context.
- **FR-008**: The auxiliary score-editor surfaces MUST clear or show a deliberate fallback state when the active selection is empty, unsupported, or not uniquely editable.
- **FR-009**: The implementation MUST add tests covering shared properties mutations, type-specific editor routing, `Instance` and library-backed behavior, `AudioClip` editing, and unsupported-selection fallback states.
- **FR-010**: New Electron-facing naming, IDs, labels, and documentation introduced by this spec MUST prefer `ScoreObject` terminology where appropriate, even when Java legacy anchors still use `SoundObject` names.

### Key Entities *(include if feature involves data)*

- **Score Object Selection State**: The canonical representation of which score object, if any, is currently editable by the auxiliary score-editor surfaces.
- **Score Object Editor Descriptor**: The mapping between a score-object type and its type-specific editor surface.
- **Shared ScoreObject Fields**: The selection-wide properties exposed by the Java properties panel, such as name, time, color, time behavior, repeat point, and note-processor chain.
- **Library Editing Context**: The state that distinguishes editing a timeline object from editing a library-backed underlying object.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can select supported score objects and audio clips and edit shared properties through the properties panel.
- **SC-002**: A reviewer can select each TypeScript-supported score-object type plus `AudioClip` and see the correct type-specific editor surface load in `ScoreObjectEditorTopComponent`.
- **SC-003**: A reviewer can select `Instance` or library-backed objects and observe the correct underlying editor target instead of an unusable placeholder.
- **SC-004**: Automated tests cover auxiliary selection behavior, shared properties editing, type-specific editor routing, and unsupported fallback states.

## Assumptions

- `036-score-editor-foundation` has already delivered the score shell, score selection plumbing, and the typed score document bridge that these auxiliary surfaces depend on.
- Existing CodeMirror and other renderer editor surfaces can be reused where appropriate instead of introducing unrelated new editor stacks.
- Full Java parity for object types that are not yet represented in `@blue/data` may require separate model-port work before the corresponding editor can exist.
