# Feature Specification: Global And Project Editors

**Feature Branch**: `017-global-project-editors`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Wrap spec 016 and make the next implementation spec focus on basic implementation for GlobalOrchestraTopComponent, GlobalScoreTopComponent, and ProjectPropertiesTopComponent. Leave Monaco and tree-sitter grammar work for the following spec."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Global Orchestra Text (Priority: P1)

As a composer, I need the Global Orchestra editor tab to show and edit the current project's global orchestra text so the Electron port can support real project-level Csound code instead of a placeholder panel.

**Why this priority**: Global orchestra text is a core project-level editing surface and is one of the default startup editor tabs in the Java application.

**Independent Test**: Can be fully tested by opening a project with existing global orchestra text, editing it in the Global Orchestra panel, saving the project, and reopening it to confirm the updated text persists.

**Acceptance Scenarios**:

1. **Given** a project is open and it contains global orchestra text, **When** the user opens or focuses the Global Orchestra panel, **Then** the panel shows the current project's global orchestra text instead of a placeholder.
2. **Given** a project is open, **When** the user edits the Global Orchestra text and saves the project, **Then** the saved project includes the updated global orchestra text.
3. **Given** no project is open, **When** the user views the Global Orchestra panel, **Then** the panel shows an empty disabled state rather than editable stale content from a previous project.

---

### User Story 2 - Edit Global Score Text (Priority: P1)

As a composer, I need the Global Score editor tab to show and edit the current project's global score text so project-level score content can be maintained directly in the Electron port.

**Why this priority**: Global score text is paired with global orchestra text in the Java application and is also a default startup editor surface.

**Independent Test**: Can be fully tested by opening a project with existing global score text, editing it in the Global Score panel, saving the project, and reopening it to confirm the updated text persists.

**Acceptance Scenarios**:

1. **Given** a project is open and it contains global score text, **When** the user opens or focuses the Global Score panel, **Then** the panel shows the current project's global score text instead of a placeholder.
2. **Given** a project is open, **When** the user edits the Global Score text and saves the project, **Then** the saved project includes the updated global score text.
3. **Given** the current project changes, **When** the Global Score panel is already visible, **Then** it refreshes to the newly selected project's content rather than keeping the previous project's text.

---

### User Story 3 - Edit Basic Project Properties (Priority: P2)

As a composer, I need the Project Properties tab to expose the basic built-in project property sections so I can inspect and change common project settings without leaving the Electron workbench.

**Why this priority**: Project Properties is a startup editor surface in Java blue and is required to make the Electron workbench useful for routine project configuration.

**Independent Test**: Can be fully tested by opening a project, editing a bounded set of project property values in the Project Properties panel, saving the project, and reopening it to confirm the values persist.

**Acceptance Scenarios**:

1. **Given** a project is open, **When** the user opens the Project Properties panel, **Then** the panel shows the basic built-in project property sections instead of a placeholder.
2. **Given** a project is open, **When** the user edits supported project property values and saves the project, **Then** those values are retained after reopening the project.
3. **Given** no project is open, **When** the user views Project Properties, **Then** the panel shows a non-editable empty state rather than editable stale project values.

### Edge Cases

- What happens when the current project switches while one or more of these panels already has unsaved local edits in view?
- How does the system behave when a project has empty global orchestra or global score text?
- How should the Project Properties panel behave when plugin-provided project-property sections exist in the Java application but are not included in this basic slice?
- What happens when a saved project is reopened after only one of the three surfaces was changed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST replace the placeholder content for `GlobalOrchestraTopComponent` with a real text-editing surface bound to the current project's global orchestra content.
- **FR-002**: The system MUST replace the placeholder content for `GlobalScoreTopComponent` with a real text-editing surface bound to the current project's global score content.
- **FR-003**: The system MUST replace the placeholder content for `ProjectPropertiesTopComponent` with a real project-properties surface that exposes the built-in project property sections included in this slice.
- **FR-004**: The three surfaces MUST load their visible values from the currently open project and refresh when the current project changes.
- **FR-005**: The three surfaces MUST enter a non-editable empty state when no project is open.
- **FR-006**: Changes made in the Global Orchestra, Global Score, and supported Project Properties sections MUST update the in-memory current project state.
- **FR-007**: Changes made in these surfaces MUST be included in the existing project save flow so they persist after save and reopen.
- **FR-008**: The Project Properties implementation in this slice MUST cover the built-in tabs needed for a basic working surface and MAY defer plugin-provided extension tabs.
- **FR-009**: The feature MUST preserve these panels as workbench editor tabs discoverable from the existing panel registry and window menu.
- **FR-010**: Advanced code-editing features such as language-aware highlighting, richer editor widgets, and grammar-driven parsing MUST remain out of scope for this slice and be deferred to the following spec.

### Key Entities *(include if feature involves data)*

- **Global Orchestra Content**: Project-level orchestra text that applies across the composition.
- **Global Score Content**: Project-level score text that applies across the composition.
- **Project Properties Surface**: The editor-area project-settings surface that exposes built-in project configuration sections.
- **Current Project State**: The currently open project data whose fields are reflected and edited by these three panels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can open a project with preexisting global orchestra and global score content and see both values rendered in their respective editor tabs without placeholder messaging.
- **SC-002**: A reviewer can edit global orchestra text, global score text, and supported project property fields, save the project, reopen it, and observe that the edited values are preserved.
- **SC-003**: A reviewer can switch from one project to another and see all three panels reflect the new project's values without requiring a full application restart.
- **SC-004**: A reviewer can open the three panels with no project loaded and observe a non-editable empty state in each panel rather than stale or invalid editable data.

## Assumptions

- The existing project data model for global orchestra, global score, and project properties remains the source of truth for this slice.
- This slice focuses on a basic, working editor and form experience rather than advanced code-editor tooling.
- Plugin-provided `ProjectProperties` extension tabs are deferred unless they can be added without expanding the scope materially.
- A follow-on spec will evaluate richer code-editor tooling for code-oriented editor surfaces after this basic slice is complete.
