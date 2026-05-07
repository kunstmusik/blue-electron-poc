# Feature Specification: Score Object Editor Tier 2 Parity

**Feature Branch**: `039-score-object-editor-tier2-parity`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "After the Tier 1 score-object editor cleanup, plan the heavier remaining score-object editors before returning to broader score-management/navigation work."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Sound Objects Through Their Real Interface Tabs (Priority: P1)

As a composer using `Sound` score objects, I need the auxiliary score-object editor to expose the BSB interface, automation, and comment workflows that Java Blue provides so the `Sound` object is editable as a real instrument surface instead of as a plain comment field.

**Why this priority**: `Sound` is a major score-object type and the current editor gap blocks parity with one of blue's core composition workflows.

**Independent Test**: Select a `Sound` object, switch among interface, automation, and comment tabs, edit supported content, and verify the canonical object updates while the score selection remains stable.

**Acceptance Scenarios**:

1. **Given** a `Sound` object is selected, **When** the score-object editor opens, **Then** it exposes tabbed or equivalent affordances for the BSB interface, automation, and comment content instead of a comment textarea only.
2. **Given** the user edits supported `Sound` content, **When** the edit is committed, **Then** the canonical score object updates through shared patch plumbing and the auxiliary document refreshes coherently.

---

### User Story 2 - Use A Real PianoRoll Editing Surface (Priority: P1)

As a composer entering notes with `PianoRoll`, I need the auxiliary editor to provide the note canvas, piano-key header, time ruler, and interaction model that Java Blue uses so the existing `PianoRoll` model becomes practically editable.

**Why this priority**: `PianoRoll` is one of the largest remaining parity gaps and requires a dedicated editor experience rather than incremental form fields.

**Independent Test**: Select a `PianoRoll`, add and edit notes through the auxiliary canvas, adjust supported view controls, and verify canonical note data updates without breaking selection or panel state.

**Acceptance Scenarios**:

1. **Given** a `PianoRoll` is selected, **When** the editor loads, **Then** it shows a real note-entry canvas with time and pitch context instead of configuration fields only.
2. **Given** the user edits notes or supported canvas settings, **When** the edits are applied, **Then** the canonical `PianoRoll` data updates and the editor redraws against the updated state.

---

### User Story 3 - Configure JMask Generators From The Auxiliary Editor (Priority: P2)

As a composer using `JMask`, I need the auxiliary editor to expose the generator and parameter-editing workflow from Java Blue so I can build and inspect generative score behavior without dropping into unsupported placeholders.

**Why this priority**: `JMask` is a specialized but still meaningful remaining score-object editor gap, and it requires a dedicated follow-up rather than a generic structured editor.

**Independent Test**: Select a `JMask`, edit supported generator parameters and visibility toggles, and verify the canonical object updates while unsupported parameters remain deliberately surfaced.

**Acceptance Scenarios**:

1. **Given** a `JMask` is selected, **When** the auxiliary editor opens, **Then** it shows generator-specific parameter editing instead of only the seed controls.
2. **Given** the user edits supported generator parameters, **When** the edit is committed, **Then** the canonical `JMask` data updates and the editor remains synchronized with the current object state.

### Edge Cases

- What happens when a `Sound` object references BSB structures or automation content that the renderer can display only partially?
- What happens when a `PianoRoll` contains more notes than comfortably fit in the auxiliary viewport or uses features that still exceed the TypeScript model surface?
- What happens when a `JMask` parameter or generator type is present in XML but not yet implemented as a dedicated typed editor control?
- What happens when any Tier 2 editor target is removed while the auxiliary surface is open?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue `Sound`, `PianoRoll`, and `JMask` editor anchors before coding begins, including related helper classes and any Java-side subpanels they depend on.
- **FR-002**: The score-object editor document contract MUST grow dedicated Tier 2 payloads for `Sound`, `PianoRoll`, and `JMask` instead of reusing the generic structured fallback payload.
- **FR-003**: The `Sound` editor MUST integrate the existing BSB interface and automation work from earlier specs so `Sound` is edited as a real multi-surface object, not as text-only content.
- **FR-004**: The `PianoRoll` editor MUST provide a dedicated note-entry canvas with enough time and pitch context to make note editing practical.
- **FR-005**: The `JMask` editor MUST expose generator and parameter editing beyond the existing seed controls while preserving unsupported generator data deliberately where full parity is still unavailable.
- **FR-006**: Tier 2 editor writes MUST continue to flow through canonical `ScorePatch.updateTypeSpecificEditor` handling and refresh the active editor document after successful mutation.
- **FR-007**: The implementation MUST explicitly document any remaining model or UI limits discovered during Tier 2 work instead of silently falling back to partial parity.
- **FR-008**: The implementation MUST add tests covering Tier 2 editor-document creation, renderer routing, canonical mutation, and removed-target fallback behavior for `Sound`, `PianoRoll`, and `JMask`.

### Key Entities *(include if feature involves data)*

- **SoundEditorSnapshot**: The typed auxiliary-editor payload for `Sound`, including interface, automation, and comment-tab state.
- **PianoRollEditorSnapshot**: The typed auxiliary-editor payload for `PianoRoll`, including note-canvas data, ruler state, and supported view controls.
- **JMaskEditorSnapshot**: The typed auxiliary-editor payload for `JMask`, including generator descriptors, supported parameter controls, and unsupported-generator preservation metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can select a `Sound` score object and use more than a plain text comment editor, including interface and automation-related workflows.
- **SC-002**: A reviewer can select a `PianoRoll` and edit notes from a dedicated auxiliary canvas rather than from bare config fields.
- **SC-003**: A reviewer can select a `JMask` and edit more than the seed fields from a deliberate generator-parameter surface.
- **SC-004**: Automated tests cover Tier 2 document payloads, renderer routing, mutation flows, and removed-target fallback behavior claimed by this slice.

## Assumptions

- Spec `038-score-object-editor-tier1-parity` has already closed the moderate-gap editors so this slice can focus only on the heavyweight remaining editors.
- The Tier 2 slice may need incremental reuse work from Specs 022 and 023 for `Sound` rather than brand-new renderer infrastructure.
- Broader score-management/navigation work remains intentionally deferred to the later management/navigation spec.