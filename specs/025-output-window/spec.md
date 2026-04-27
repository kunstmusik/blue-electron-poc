# Feature Specification: Output Window

**Feature Branch**: `025-output-window`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description: "Implement an output window that mirrors the NetBeans Output Window used in Java Blue, providing a tabbed console for Csound engine stdout/stderr during realtime and disk rendering."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Csound Output During Playback (Priority: P1)

A user starts playback of a project. The Output window panel shows Csound compilation and runtime messages (stdout and stderr) in real time as the engine runs. The user can watch performance diagnostics, error messages, and print output scroll by. When playback stops, the accumulated output remains visible for review.

**Why this priority**: This is the core value — without live engine output, users cannot diagnose Csound errors or monitor rendering. This alone is a viable MVP.

**Independent Test**: Start playback on any project and verify Csound messages appear in the Output panel in real time.

**Acceptance Scenarios**:

1. **Given** a project is loaded, **When** the user starts playback, **Then** the Output window displays Csound compilation messages followed by runtime output in real time
2. **Given** playback is running, **When** Csound prints an error to stderr, **Then** the error text appears in the Output window with distinct styling (e.g., different color)
3. **Given** playback has stopped, **When** the user views the Output window, **Then** all accumulated output from that session remains visible and scrollable
4. **Given** the Output panel is not visible, **When** playback starts, **Then** the user can open it via the Window menu without interrupting playback

---

### User Story 2 - Multiple Output Tabs (Priority: P2)

A user performs a disk render. A separate tab labeled "Csound (Disk)" appears in the Output window, keeping the realtime "Csound" tab intact. The user can switch between tabs to review output from different rendering sessions independently.

**Why this priority**: Mirrors Java Blue's two-tab pattern (realtime vs. disk). Enables parallel workflows without output intermixing.

**Independent Test**: Perform a disk render, then start realtime playback, and verify both tabs exist with independent content.

**Acceptance Scenarios**:

1. **Given** the Output window is open, **When** a disk render starts, **Then** a tab labeled "Csound (Disk)" is created (or cleared if it already exists) and output is written there
2. **Given** both a "Csound" and "Csound (Disk)" tab exist, **When** the user clicks a tab, **Then** that tab's content is displayed
3. **Given** a realtime session has output, **When** a new realtime session starts, **Then** the "Csound" tab is cleared and fresh output begins

---

### User Story 3 - Clear and Select Output Tab Programmatically (Priority: P3)

When rendering begins, the system clears the appropriate output tab and brings it to the foreground so the user immediately sees fresh output. The user can also manually clear a tab's content via a context menu or toolbar action.

**Why this priority**: Matches Java Blue's pre-render initialization sequence (clear → select → write header). Provides polish beyond basic output display.

**Independent Test**: Start playback multiple times and verify the tab is cleared and focused each time.

**Acceptance Scenarios**:

1. **Given** the "Csound" tab has previous output, **When** playback starts, **Then** the tab is cleared, a render command header line is written, and the tab is brought to the foreground
2. **Given** any tab is selected, **When** the user triggers "Clear" from context menu, **Then** the tab content is cleared

---

### Edge Cases

- What happens when Csound produces output at very high volume (thousands of lines)? The output panel must remain responsive using virtualized rendering.
- What happens if the engine crashes mid-render? Partial output should remain visible.
- What happens if playback is started while output panel is closed? Output is accumulated in the background; opening the panel later shows the accumulated content.
- What happens with very long lines (no newlines)? Lines should wrap or be horizontally scrollable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Output" entry in the Window menu that opens the Output panel as a dockview panel in the output area
- **FR-002**: System MUST provide a tabbed output panel where each tab represents an independent output stream identified by name
- **FR-003**: System MUST support at least two named tabs: "Csound" (for realtime playback) and "Csound (Disk)" (for disk rendering)
- **FR-004**: System MUST display engine stdout and stderr output in real time during Csound rendering
- **FR-005**: System MUST visually distinguish stderr output from stdout output (e.g., different text color)
- **FR-006**: System MUST clear the appropriate output tab at the start of each new rendering session
- **FR-007**: System MUST write a render command header line at the start of each session (showing the Csound arguments used)
- **FR-008**: System MUST bring the output tab to the foreground when rendering starts
- **FR-009**: System MUST provide an IOProvider-style API (getIO, getOut, getErr, reset, select) that main-process and renderer code can use to interact with output tabs
- **FR-010**: System MUST preserve output content after rendering stops so the user can review it
- **FR-011**: System MUST allow the user to manually clear a tab's content
- **FR-012**: System MUST handle high-volume output (thousands of lines) without UI lag, using virtualized text rendering
- **FR-013**: System MUST forward Csound engine stdout/stderr from the main process to the renderer via IPC

### Key Entities

- **OutputTab**: A named output stream within the output window. Has a display name, an ordered list of output lines, and color settings. Identified by name (e.g., "Csound", "Csound (Disk)").
- **OutputLine**: A single line of text in an output tab. Has text content, a type (stdout/stderr), and optional styling.
- **IOProvider**: A singleton service that creates and manages OutputTabs. Mirrors the NetBeans IOProvider API — `getIO(name, newIO)` returns or creates a tab, supporting reuse by name.
- **OutputWriter**: The writer interface for a tab (stdout or stderr). Supports `write(text)`, `println(text)`, and `reset()` (clear).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can see Csound output appear in the Output window within 1 second of it being produced by the engine
- **SC-002**: The Output window remains interactive and scrollable even when Csound produces 10,000+ lines of output
- **SC-003**: The Output panel opens from the Window menu in under 1 second
- **SC-004**: Each render session's output is isolated to its own tab, with no intermixing between realtime and disk render output
- **SC-005**: The output window API (IOProvider, InputOutput, OutputWriter) matches the NetBeans Output Window API patterns used in Java Blue, enabling straightforward porting of rendering code

## Assumptions

- The Output panel will be a dockview panel registered in the `output-main` auxiliary group (bottom edge), following the existing workbench panel registration pattern
- Engine stdout/stderr will be forwarded from the main process to the renderer via a new IPC channel (`engine-output`)
- Csound input (stdin) is not required for the initial implementation — Java Blue never calls `getIn()` or `setInputVisible()`
- Hyperlink support in output lines (clickable file:line references) is deferred to a future spec
- Folding/collapsible regions in output are not needed — Java Blue does not use IOFolding
- The existing EngineBridge child process stdout/stderr capture points will be extended to forward output rather than just logging to console
- Output tab state is ephemeral (not persisted across app restarts) — matches Java Blue behavior
