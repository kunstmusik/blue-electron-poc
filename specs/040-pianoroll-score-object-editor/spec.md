# Feature Specification: PianoRoll Score Object Editor Parity

**Feature Branch**: `040-pianoroll-score-object-editor`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "Split the old grouped Tier 2 score-object follow-up so `PianoRoll` gets its own deeper planning slice, with explicit Java Blue UI/UX analysis reflected in the task breakdown."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Notes On A Real PianoRoll Canvas (Priority: P1)

As a composer writing notes in `PianoRoll`, I need a real note canvas with pitch and time context so I can create, move, resize, and select notes from the auxiliary editor rather than editing metadata only.

**Why this priority**: `PianoRoll` is one of the largest remaining score-object editor gaps and cannot be treated as a form-based structured editor.

**Independent Test**: Select a `PianoRoll`, add or edit notes from the canvas, and verify canonical note data updates without breaking selection, scrolling, or editor routing.

**Acceptance Scenarios**:

1. **Given** a `PianoRoll` is selected, **When** the auxiliary editor opens, **Then** it shows a time ruler, pitch context, and note canvas instead of bare metadata fields only.
2. **Given** the user adds, moves, resizes, or multi-selects notes, **When** the interaction commits, **Then** the canonical `PianoRoll` note data updates and the canvas redraws coherently.

---

### User Story 2 - Edit Fields And Properties Alongside The Canvas (Priority: P1)

As a composer shaping more than note position, I need access to the Java Blue field editor, scale settings, ruler config, and note-template properties so the `PianoRoll` object remains practically editable.

**Why this priority**: The Java editor is not just a note grid; it includes field-curve editing and a properties workflow that materially changes how notes are generated.

**Independent Test**: Select notes, edit a supported field curve, change supported properties such as pitch-generation method or note template, and verify the document and canonical object stay synchronized.

**Acceptance Scenarios**:

1. **Given** notes are selected in the canvas, **When** the user edits a supported field view or property panel control, **Then** the auxiliary editor updates the visible state deliberately and preserves canonical note data.
2. **Given** the user changes supported `PianoRoll` properties, **When** the edit commits, **Then** the score object updates through canonical patch handling and remains reload-safe.

---

### User Story 3 - Use Java-Style Editing Shortcuts And Clipboard Flows (Priority: P2)

As a composer iterating quickly in `PianoRoll`, I need copy/paste, undo expectations, and the core Java interaction shortcuts so the editor feels like a real working surface instead of a static canvas.

**Why this priority**: Even with note rendering in place, parity remains shallow if the interaction model stops at direct placement only.

**Independent Test**: Use supported shortcuts or menus to copy, paste, or undo note edits, and verify the canvas plus canonical state remain synchronized.

**Acceptance Scenarios**:

1. **Given** notes are selected, **When** the user invokes copy, paste, cut, or delete from supported shortcuts or menus, **Then** the note set updates predictably and stays aligned to the documented snapping rules.
2. **Given** the user performs supported reversible edits, **When** they invoke undo or redo behavior claimed by this slice, **Then** the canvas state and canonical document remain coherent.

### Edge Cases

- What happens when a `PianoRoll` contains more notes than comfortably fit in the viewport?
- What happens when the selected notes use fields or scale modes that the TypeScript surface can preserve but not yet edit fully?
- What happens when the user starts a drag interaction and the selected `PianoRoll` target is removed or reloaded?
- What happens when copy or paste is invoked with mixed snapped and unsnapped note positions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue `PianoRoll` UI/UX anchors before coding begins, including `PianoRollEditor`, `PianoRollCanvas`, `PianoRollCanvasHeader`, `NoteCanvasMouseListener`, `FieldEditor`, `FieldEditorMouseListener`, `PianoRollPropertiesEditor`, `ScaleSelectionPanel`, and `PianoRollRulerConfigDialog`.
- **FR-002**: The score-object editor document contract MUST grow a dedicated `PianoRollEditorSnapshot` that covers note-canvas, field-editor, and property surfaces instead of reusing the current metadata-only structured payload.
- **FR-003**: The renderer MUST provide a real `PianoRoll` note canvas with time ruler, pitch context, note rendering, and supported mouse interaction states.
- **FR-004**: The implementation MUST define canonical patch boundaries for note edits, batch note operations, and supported property changes so save or reload parity stays intact.
- **FR-005**: The editor MUST expose supported field editing and properties workflows, including the note template and pitch-generation controls that materially affect generated output.
- **FR-006**: The implementation MUST document the Java shortcut, clipboard, and undo model before deciding which interaction subset this slice claims.
- **FR-007**: Unsupported `PianoRoll` subfeatures MUST be surfaced explicitly rather than silently discarded from the parity claim.
- **FR-008**: The implementation MUST add tests covering `PianoRoll` document creation, note-canvas rendering, supported mouse interactions, property mutations, removed-target fallback behavior, and any clipboard or undo claims this slice makes.

### Key Entities *(include if feature involves data)*

- **PianoRollEditorSnapshot**: The typed auxiliary-editor payload for `PianoRoll`, including note-canvas data, property state, field metadata, and declared editing capabilities.
- **PianoRollNoteSnapshot**: The renderer-facing description of one note in the canvas, including start time, duration, pitch data, field values, and selection metadata.
- **PianoRollInteractionBatch**: The canonical mutation payload for one committed note-edit batch such as add, move, resize, delete, paste, or field-value change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can select a `PianoRoll` object and edit notes from a dedicated canvas rather than from metadata fields only.
- **SC-002**: A reviewer can use supported field-editor or property workflows and observe coherent canonical updates.
- **SC-003**: A reviewer can exercise the clipboard or undo behaviors explicitly claimed by this slice without desynchronizing the canvas from the canonical document.
- **SC-004**: Automated tests cover the `PianoRoll` payload, note-canvas routing, supported interaction flows, property mutations, removed-target fallback behavior, and any shortcut-based behavior claimed by this slice.

## Assumptions

- Spec `038-score-object-editor-tier1-parity` is already closed, so this slice can focus on the heavyweight `PianoRoll` editor gap only.
- Existing score-canvas infrastructure from Spec 036 is a reuse source for ruler, selection, drag, and snapping behavior, but the `PianoRoll` canvas still needs its own dedicated parity work.
- The `Sound` and `JMask` follow-up work will live in Specs `039-sound-score-object-editor` and `041-jmask-score-object-editor`, not in this slice.
