# Feature Specification: MIDI Input Panel And Virtual Keyboard Parity

**Feature Branch**: `033-midi-input-virtual-keyboard-parity`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "Use spec-kit to create a new branch and spec to implement the MIDI Input panel and Virtual Keyboard.  Both should follow general UI design and must implement behavior of Java Blue versions for parity. For manual test, I should be able to load a project, adjust MIDI input panel settings, turn on blueLive, and trigger instruments using the Virtual Keyboard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure MIDI Input Processing Like Java Blue (Priority: P1)

As a composer preparing live input behavior, I need a real MIDI Input panel instead of a placeholder so I can inspect and edit the project MIDI processing settings using Java Blue-compatible controls.

**Why this priority**: The project already preserves `MidiInputProcessor` data in `@blue/data`, but the renderer still exposes only a deferred toolbar button and placeholder panel. Without an editable panel, the project cannot reach parity for live MIDI preparation.

**Independent Test**: Load a project, open the MIDI Input panel, change key mapping, scale, pitch constant, velocity mapping, and amp constant, save/reopen the project, and confirm the same values are restored.

**Acceptance Scenarios**:

1. **Given** a project is loaded with MIDI input processor data, **When** the user opens `MidiInputPanelTopComponent`, **Then** the panel shows a Java Blue-style Realtime tab with controls for key mapping, scale, pitch constant, velocity mapping, and amp constant initialized from the project.
2. **Given** the MIDI Input panel is open, **When** the user edits any supported MIDI input control, **Then** the project snapshot and canonical `BlueData` document update without losing existing `.blue` MIDI input data.
3. **Given** the top toolbar is visible, **When** the user clicks `MIDI Input`, **Then** the MIDI Input panel opens or focuses instead of remaining a disabled placeholder control.

---

### User Story 2 - Trigger Blue Live Instruments From A Virtual Keyboard (Priority: P1)

As a composer using Blue Live, I need the Virtual Keyboard panel to mirror Java Blue behavior so I can trigger project instruments from the computer keyboard or mouse without attaching external MIDI hardware.

**Why this priority**: This is the end-to-end manual workflow the user explicitly requested. The feature has no practical value unless a running Blue Live session can be played from the Virtual Keyboard.

**Independent Test**: Load a project, start Blue Live, open `VirtualKeyboardTopComponent`, play notes with the mouse and computer keyboard, change channel/octave/velocity controls, and verify note-on, note-off, and All Notes Off affect the running Blue Live session.

**Acceptance Scenarios**:

1. **Given** a project is loaded and Blue Live is running, **When** the user presses or clicks a Virtual Keyboard key, **Then** the app sends a Java-compatible note-on event to the Blue Live engine and the targeted instrument sounds.
2. **Given** a key is currently active on the Virtual Keyboard, **When** the user releases the key or triggers `All Notes Off`, **Then** the app sends the corresponding note-off behavior and active notes are silenced.
3. **Given** the user changes channel, octave, or velocity override controls, **When** they trigger the next note, **Then** the resulting Blue Live event uses the updated control state with Java-compatible behavior.

---

### User Story 3 - Integrate Both Panels Into The Existing Workbench Design (Priority: P2)

As a composer working in the Electron workbench, I need the MIDI Input panel and Virtual Keyboard to follow the current app’s UI design and panel model while preserving Java Blue labels, grouping, and window behavior, so the new surfaces feel native instead of bolted on.

**Why this priority**: The repo already has placeholder registrations and window IDs for both panels. Replacing those placeholders with parity-aligned UI is necessary to make the feature coherent with the rest of the workbench.

**Independent Test**: Open both panels through the existing workbench/window flows, confirm they render non-placeholder content, and verify they behave correctly with the current docking, focus, and panel-opening model.

**Acceptance Scenarios**:

1. **Given** the workbench is open, **When** the user opens `MidiInputPanelTopComponent` or `VirtualKeyboardTopComponent`, **Then** each panel renders a dedicated UI surface that follows the current blue-app visual language instead of `PlaceholderPanel`.
2. **Given** the panels are reopened through toolbar or workbench commands, **When** the user interacts with them across normal focus/dock flows, **Then** they preserve their Java Blue names, control grouping, and panel identity within the current workbench model.

### Edge Cases

- What happens when the user opens either panel with no project loaded?
- What happens when Blue Live is stopped and the Virtual Keyboard is used?
- What happens when the selected Virtual Keyboard channel does not map to a routable project target for live triggering?
- What happens when the user changes MIDI Input settings while Blue Live is already running?
- How should the Virtual Keyboard behave when octave or keyboard mappings would push notes outside the 88-key Java range?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java `MidiInputProcessor`, `MidiInputPanelTopComponent`, `MidiInputProcessorPanel`, `MidiInputEngine`, `VirtualKeyboardTopComponent`, and `VirtualKeyboardPanel` before coding starts.
- **FR-002**: The renderer MUST replace the current placeholder content for `MidiInputPanelTopComponent` and `VirtualKeyboardTopComponent` with dedicated panel implementations.
- **FR-003**: The MIDI Input panel MUST expose a Java Blue-compatible Realtime tab containing key mapping, scale, pitch constant, velocity mapping, and amp constant controls.
- **FR-004**: The MIDI Input panel MUST bind to the project’s `MidiInputProcessor` data and preserve Java-compatible save/load behavior for all supported MIDI input fields.
- **FR-005**: The existing toolbar `MIDI Input` action MUST open or focus `MidiInputPanelTopComponent` and MUST no longer be a permanently disabled placeholder.
- **FR-006**: The Virtual Keyboard panel MUST expose Java-compatible channel, octave, velocity, velocity-override, and All Notes Off controls.
- **FR-007**: The Virtual Keyboard MUST support both mouse-driven note triggering and Java-compatible computer-key note mappings.
- **FR-008**: When Blue Live is running, Virtual Keyboard note-on, note-off, and All Notes Off actions MUST route to the active Blue Live engine session.
- **FR-009**: Virtual Keyboard note routing MUST honor Java-compatible channel and pitch behavior, including octave offsets, velocity override semantics, and safe handling of out-of-range notes.
- **FR-010**: MIDI input routing behavior MUST remain compatible with the project’s `MidiInputProcessor` semantics so live triggers use the same project-defined key and velocity processing model as Java Blue.
- **FR-011**: The UI for both panels MUST follow the current blue-app workbench design language while preserving Java Blue labels, control groupings, and panel names for parity.
- **FR-012**: The system MUST safely no-op or present a clear disabled state when no project is loaded, when Blue Live is unavailable, or when a live trigger cannot be routed.
- **FR-013**: The implementation MUST add tests covering MIDI input snapshot/persistence behavior, panel rendering and interaction, and Blue Live note-trigger routing for the requested manual workflow.

### Key Entities *(include if feature involves data)*

- **MidiInputProcessor State**: Project-owned MIDI input processing data including key mapping, velocity mapping, pitch constant, amp constant, and scale selection.
- **VirtualKeyboard State**: Renderer and runtime state for channel, octave, velocity, velocity override, pressed keys, and All Notes Off behavior.
- **BlueLive Note Trigger**: A routed live-note event emitted by the Virtual Keyboard into the running Blue Live engine.
- **Workbench MIDI Panels**: The registered `MidiInputPanelTopComponent` and `VirtualKeyboardTopComponent` surfaces as they appear in the current Electron workbench.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can load a project, open the MIDI Input panel, change MIDI input settings, save/reopen the project, and observe the same values restored.
- **SC-002**: A reviewer can load a project, start Blue Live, and trigger instruments from the Virtual Keyboard using both mouse clicks and computer-key input.
- **SC-003**: Channel, octave, velocity override, and All Notes Off controls affect Virtual Keyboard output in manual verification with no stuck-note state after the test flow ends.
- **SC-004**: Neither `MidiInputPanelTopComponent` nor `VirtualKeyboardTopComponent` renders placeholder content after the feature is implemented.
- **SC-005**: Automated tests cover the requested end-to-end flow of loading a project, adjusting MIDI Input settings, starting Blue Live, and triggering notes from the Virtual Keyboard.

## Assumptions

- Existing Blue Live session and project snapshot/patch infrastructure will be reused rather than replaced.
- External MIDI hardware device enumeration and OS-level input-device selection are out of scope for this slice unless they are strictly required to support the Java-compatible Virtual Keyboard and project MIDI processor workflow.
- The feature remains inside the current React/Electron/`@blue/data` architecture and follows the repo’s existing workbench shell rather than introducing a new windowing model.
- General UI design means matching the current blue-app visual language while preserving Java Blue behavior, labels, and control semantics for parity-sensitive interactions.
