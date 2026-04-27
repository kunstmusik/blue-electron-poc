# Feature Specification: BlueSynthBuilder Performance and Live Interaction

**Feature Branch**: `024-bsb-performance`
**Created**: 2026-04-27
**Status**: Planned
**Input**: User description: "Plan the next spec to address BlueSynthBuilder performance issues with a root-cause solution rather than workarounds."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep live BSB controls responsive while playing (Priority: P1)

As a composer adjusting BlueSynthBuilder widgets during playback, I need slider, knob, XY, and similar value changes to reach the engine immediately enough to feel live, without routing every interaction through a generic trailing document debounce.

**Why this priority**: If widget interaction is not live, BlueSynthBuilder stops being usable as a performance and audition surface.

**Independent Test**: Load a BSB-heavy project, start playback, drag a slider, knob, XY controller, and slider-bank thumb, and verify that audio responds during the gesture rather than only after the gesture settles.

**Acceptance Scenarios**:

1. **Given** playback is active, **When** a single-value BSB widget is dragged, **Then** the targeted engine channel updates during the gesture without waiting for the current 100 ms trailing document flush.
2. **Given** playback is active, **When** an XY controller is dragged, **Then** only the X and Y channels for that controller update, not unrelated channels.
3. **Given** playback is active, **When** a slider-bank slot is edited, **Then** only the touched slot's channel updates.
4. **Given** playback is inactive, **When** a BSB value widget is edited, **Then** the document still updates correctly without requiring the live engine path.

---

### User Story 2 - Re-render only the affected BSB surface (Priority: P1)

As a composer editing a large BSB interface, I need a single widget change to update only the affected widget path and selection state so the canvas remains smooth even with many widgets.

**Why this priority**: The current optimistic reducer and panel subscriptions recreate far more state than a single-widget edit actually changes.

**Independent Test**: Load an instrument with dozens of BSB widgets, change one slider value, and verify through automated render-count tests and manual profiling that unrelated widgets, arrangement rows, and untouched instrument editors do not re-render.

**Acceptance Scenarios**:

1. **Given** an orchestra with multiple assignments, **When** one BSB widget value changes, **Then** unrelated assignments keep their snapshot identity and do not trigger arrangement-panel rerenders.
2. **Given** a BSB interface with many widgets, **When** one widget value changes, **Then** unchanged widget subtrees keep their object identity.
3. **Given** only a widget value changes, **When** the property sheet remains on the same widget, **Then** whole-tree bookkeeping such as object-name collection is not recomputed unless the edit actually changes structure or object names.
4. **Given** selection state changes, **When** one widget is selected or deselected, **Then** only widgets whose selected state changed are required to re-render.

---

### User Story 3 - Commit document changes without canonical snapshot echo (Priority: P1)

As an implementer, I need local project edits to commit to the main-process canonical document without replacing the renderer snapshot with a fresh full-orchestra copy after every successful patch.

**Why this priority**: The current optimistic update already applies the change locally; rehydrating the full canonical snapshot on success duplicates work and triggers a second render cascade.

**Independent Test**: Trigger BSB edits that enqueue multiple patches, and verify that the main-process commit path acknowledges success without sending a fresh full project snapshot back on every successful local edit.

**Acceptance Scenarios**:

1. **Given** a batch of local project patches succeeds, **When** the commit finishes, **Then** the renderer keeps its optimistic state rather than calling `setProjectInfo()` with a fresh orchestra snapshot.
2. **Given** a local patch batch fails, **When** the failure is surfaced, **Then** the renderer performs an explicit recovery or resync instead of silently diverging.
3. **Given** many drag-generated patches are queued, **When** they flush, **Then** they commit in a batch-oriented IPC path rather than N sequential snapshot-returning calls.
4. **Given** a project is loaded from disk, **When** the load completes, **Then** the full project snapshot path remains available for initial hydration and explicit resync.

---

### User Story 4 - Lock in performance regression coverage (Priority: P2)

As an implementer, I need automated identity/render tests and a documented manual profiling pass so future BSB work does not reintroduce whole-panel rerenders or sluggish interaction.

**Why this priority**: This slice changes behavior across store reducers, transport, and renderer boundaries; regression protection is required.

**Independent Test**: Run the new store identity tests, render-count tests, and the manual quickstart profile against a BSB-heavy project.

**Acceptance Scenarios**:

1. **Given** a single widget value patch, **When** store tests run, **Then** untouched instruments and widget subtrees preserve reference identity.
2. **Given** a single widget value patch, **When** renderer tests run, **Then** unrelated widgets and the arrangement panel do not re-render.
3. **Given** live playback, **When** interaction tests run, **Then** the live-control transport is exercised separately from the batched document commit path.
4. **Given** the feature is implemented, **When** a reviewer follows the quickstart, **Then** they can reproduce the intended profiler and interaction checks.

### Edge Cases

- What happens when a multi-selection move or resize updates several widgets at once?
- How should a save request behave if a live interaction is still in flight?
- How should preset application behave, given that it intentionally touches many widget values?
- What happens when a realtime control update succeeds but the trailing document commit fails?
- How should unknown widget types or preserved Java-only fields behave under structural-sharing reducers?
- How should the renderer recover if the canonical project revision changes because of a non-local event in the future?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST be based on the current renderer/store/main-process code paths in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/OrchestraPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/widgets/WidgetWrapper.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`.
- **FR-002**: The store MUST stop using full-orchestra `structuredClone`-style replacement for ordinary BSB widget edits and instead preserve identity for untouched orchestra assignments, instruments, and widget subtrees.
- **FR-003**: The implementation MUST classify BSB edits by latency needs, separating high-frequency live-control updates from ordinary batched document commits.
- **FR-004**: Single-widget live-control updates MUST target only the affected engine channel or channels; full instrument-wide parameter resync MUST be reserved for explicit operations such as preset application or explicit full sync.
- **FR-005**: The live-control path MUST not be blocked behind the current generic trailing document debounce used for general project patches.
- **FR-006**: Successful local document commits MUST NOT replace renderer state with a fresh full project snapshot; full snapshot hydration MUST remain for project load and explicit recovery.
- **FR-007**: Queued document patches MUST flush through a batch-oriented IPC contract instead of issuing one canonical snapshot-producing request per patch.
- **FR-008**: Widget-tree derived metadata such as object-name lists and widget lookup summaries MUST update only when structure or relevant naming fields change.
- **FR-009**: Renderer subscriptions MUST be narrowed so a BSB widget edit does not force the full Orchestra panel, arrangement table, and unrelated editor surfaces to re-render.
- **FR-010**: Widget memoization MAY be introduced, but only after prop stability or selector boundaries make memoization effective; passing broad unstable props to every widget MUST be avoided.
- **FR-011**: The performance refactor MUST preserve `.blue` XML compatibility, preset behavior, and the current BSB editing feature set from Spec 023.
- **FR-012**: The slice MUST include automated tests for structural sharing, render isolation, batch commit behavior, live-control transport behavior, and failure recovery.
- **FR-013**: The slice MUST include a documented manual profiling pass against a BSB-heavy project.

### Key Entities *(include if feature involves data)*

- **Live-Control Update**: A high-frequency BSB interaction that must reach the engine quickly enough for continuous playback feedback.
- **Document Commit Batch**: A queued set of `ProjectDocumentPatch` entries committed to the main-process canonical project state.
- **Project Revision**: A monotonically increasing identifier used to reason about canonical document state and recovery.
- **Structurally Shared Orchestra Snapshot**: Renderer state where unchanged assignments, instruments, and widget nodes retain identity across optimistic edits.
- **Widget Metadata Cache**: Derived lists such as object names and widget summaries that should update only when relevant inputs change.
- **Selection Boundary**: The renderer mechanism that determines which widgets need to observe selected state without invalidating the whole canvas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Store-level tests show that a single widget value patch preserves reference equality for untouched assignments, untouched instruments, and untouched widget subtrees.
- **SC-002**: Renderer tests show that a single widget value change does not re-render the arrangement panel or unrelated BSB widgets.
- **SC-003**: Live playback tests or instrumentation show that a continuous slider or XY drag is no longer blocked behind the current 100 ms trailing document debounce.
- **SC-004**: Successful local patch commits no longer invoke a full `setProjectInfo()` replacement with a canonical orchestra snapshot.
- **SC-005**: Manual profiling on a BSB-heavy project shows one interaction path instead of the current optimistic-update render plus canonical-echo render cascade.

## Assumptions

- The main process remains the canonical owner of the project document.
- This slice does not introduce multi-window collaborative editing, but the transport should leave room for future revision-based recovery.
- Preset application is allowed to remain a broad update path because it intentionally touches many widget values.
- Spec 023 widget rendering and property-sheet behavior remain the functional baseline; this slice focuses on performance architecture, not new widget features.