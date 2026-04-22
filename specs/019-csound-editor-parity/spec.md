# Feature Specification: Csound Editor Java Blue Parity

**Feature Branch**: `019-csound-editor-parity`
**Created**: 2026-04-22
**Status**: Draft
**Input**: User description: "Close spec 018 and create the next spec for Java Blue Csound editor parity. Cut, Copy, and Paste do not appear to work in the CodeMirror editor. Add planning for Java Blue-style editor context menu options shown in the screenshot, including Blue Variables, Opcodes, Blue Opcodes, Custom, Add to Code Repository, Cut, Copy, and Paste. Add more feature parity with Java Blue code completion and hints."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Clipboard Editing (Priority: P1)

As a composer editing Global Orchestra text, I need Cut, Copy, and Paste to work from keyboard shortcuts and the editor context menu so the editor behaves like a normal code editor and like Java Blue.

**Why this priority**: Basic clipboard editing is a blocker for using the new CodeMirror editor comfortably. It also validates whether renderer-owned actions or native Electron clipboard/menu roles are needed.

**Independent Test**: Can be tested by selecting text in `Global Orchestra`, using keyboard shortcuts and context-menu actions for Cut, Copy, and Paste, and confirming text changes occur in the editor without triggering playback or unrelated workbench shortcuts.

**Acceptance Scenarios**:

1. **Given** text is selected in the Global Orchestra editor, **When** the user invokes Cut from the keyboard or context menu, **Then** the selected text is removed and available for Paste.
2. **Given** text is selected in the Global Orchestra editor, **When** the user invokes Copy from the keyboard or context menu, **Then** the selected text remains and can be pasted elsewhere.
3. **Given** clipboard text is available and the editor has focus, **When** the user invokes Paste from the keyboard or context menu, **Then** the text is inserted at the cursor or replaces the selection.
4. **Given** the editor has focus, **When** the user presses Space, Cmd/Ctrl-X, Cmd/Ctrl-C, Cmd/Ctrl-V, or Escape, **Then** editor-appropriate behavior wins over playback or global workbench shortcuts.

---

### User Story 2 - Java Blue Context Menu Insertions (Priority: P1)

As a composer editing Csound code, I need the editor context menu to offer Java Blue-style insertion options so common Blue variables, opcodes, and repository actions are discoverable without leaving the editor.

**Why this priority**: The screenshot shows an important Java Blue authoring workflow. Matching the menu structure provides immediate parity and creates a natural place to attach completion and hint behavior later.

**Independent Test**: Can be tested by right-clicking the Global Orchestra editor, navigating the same menu categories shown in Java Blue, selecting an insertion item, and confirming the selected text is inserted at the editor cursor.

**Acceptance Scenarios**:

1. **Given** the Global Orchestra editor is focused, **When** the user right-clicks inside the editor, **Then** a Java Blue-style editor context menu appears.
2. **Given** the context menu is open, **When** the user opens Blue Variables, **Then** it offers at least `<TOTAL_DUR>`, `<RENDER_START>`, `<PROCESSING_START>`, `<INSTR_ID>`, and `<INSTR_NAME>`.
3. **Given** a Blue Variable menu item is selected, **When** the editor has a cursor or selection, **Then** the variable text is inserted at the cursor or replaces the selection.
4. **Given** the context menu is open, **When** the user views Opcodes, Blue Opcodes, Custom, and Add to Code Repository, **Then** each item behaves according to the Java Blue parity research or is explicitly disabled only when its backing feature is out of scope and documented.

---

### User Story 3 - Completion And Hint Parity Baseline (Priority: P2)

As a composer writing Csound code, I need completion and hint behavior to move closer to Java Blue so opcode, Blue opcode, variable, and project-aware suggestions can be discovered while typing.

**Why this priority**: Spec 018 selected CodeMirror and exposed a dynamic completion adapter, but it intentionally deferred concrete project/runtime completion sources. This slice should convert Java Blue research into a usable first parity pass.

**Independent Test**: Can be tested by typing Csound code in Global Orchestra and confirming the editor offers the researched Java Blue completion/hint categories that are in scope for this slice.

**Acceptance Scenarios**:

1. **Given** Java Blue exposes completion or hint data for Csound editing, **When** that behavior is researched, **Then** the source files, categories, and scope decisions are documented in this spec package.
2. **Given** the user types in Global Orchestra, **When** completion is requested manually or automatically according to the selected editor behavior, **Then** in-scope Java Blue categories appear without duplicating or breaking the baseline Csound plugin completions.
3. **Given** a completion has descriptive help or hint text available, **When** the user focuses that completion, **Then** the editor can show the corresponding hint/help text if the backing data is available in this slice.

---

### User Story 4 - Reusable Csound Editor Parity Surface (Priority: P3)

As an implementer, I need the clipboard, context-menu, insertion, completion, and hint work to be reusable beyond Global Orchestra so Global Score and future Csound text surfaces do not fork editor behavior.

**Why this priority**: Global Orchestra is the first CodeMirror surface, but the editor behavior should become a reusable Csound editor layer rather than a one-off panel implementation.

**Independent Test**: Can be tested by reviewing the implementation boundary and confirming the parity actions are exposed through reusable editor helpers or adapters rather than hardcoded directly into `GlobalOrchestraPanel`.

**Acceptance Scenarios**:

1. **Given** editor parity actions are implemented, **When** another Csound editor surface is added later, **Then** it can reuse the same menu, insertion, and completion sources without duplicating Global Orchestra-specific code.
2. **Given** a completion or menu category depends on project state, **When** no project is loaded, **Then** the editor handles the missing context gracefully.

### Edge Cases

- What happens when Cut or Copy is invoked without a selection?
- What happens when Paste is invoked and the OS clipboard is empty or unavailable?
- What happens when the context menu is opened while the editor is read-only or no project is loaded?
- What happens when Java Blue exposes a menu category whose backing data or UI does not exist yet in the Electron port?
- What happens when CodeMirror plugin completions and Java Blue-derived completions contain overlapping labels?
- How should menu insertion behave when text is selected across multiple lines?
- How should global playback shortcuts behave when focus is inside a CodeMirror editor, completion popup, or context menu?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The slice MUST inspect the Java Blue editor implementation for context-menu, completion, and hint behavior before changing the Electron editor behavior.
- **FR-002**: The system MUST make Cut, Copy, and Paste work in the Global Orchestra editor from keyboard shortcuts and context-menu actions.
- **FR-003**: Editor-focused keyboard shortcuts MUST not trigger playback or global workbench commands when the same key sequence is intended for text editing.
- **FR-004**: The Global Orchestra editor MUST provide a context menu with Java Blue-style categories for Blue Variables, Opcodes, Blue Opcodes, Custom, Add to Code Repository, Cut, Copy, and Paste.
- **FR-005**: The Blue Variables submenu MUST include `<TOTAL_DUR>`, `<RENDER_START>`, `<PROCESSING_START>`, `<INSTR_ID>`, and `<INSTR_NAME>` as insertion actions.
- **FR-006**: Context-menu insertion actions MUST insert text at the current cursor or replace the current selection without losing editor focus unnecessarily.
- **FR-007**: Opcodes, Blue Opcodes, Custom, and Add to Code Repository MUST either implement the Java Blue-derived behavior in this slice or be explicitly documented as out-of-scope with a disabled or non-destructive user-facing state.
- **FR-008**: The slice MUST add a concrete first pass of Java Blue-derived completion or hint data if the backing Java sources are available and practical to port in this slice.
- **FR-009**: New editor parity behavior MUST preserve existing Global Orchestra project load, edit, save, and reopen behavior.
- **FR-010**: New editor parity behavior MUST be designed for reuse by future Csound text surfaces such as Global Score.
- **FR-011**: The implementation MUST include automated coverage for clipboard shortcut gating, menu insertion behavior, and completion-source behavior where practical.
- **FR-012**: The spec package MUST document any Java Blue parity gaps that remain after this slice.

### Key Entities *(include if feature involves data)*

- **Csound Editor Action**: A command available from keyboard, context menu, or editor UI, such as Cut, Copy, Paste, or Insert Blue Variable.
- **Java Blue Menu Category**: A context-menu grouping from the Java editor, including Blue Variables, Opcodes, Blue Opcodes, Custom, and Add to Code Repository.
- **Insertion Item**: Text or behavior selected from the context menu and applied to the editor selection or cursor.
- **Completion Source**: A static, document-local, project-aware, or Java Blue-derived provider that contributes CodeMirror completion entries or hint text.
- **Parity Gap Record**: A documented Java Blue behavior that is researched but not fully implemented in this slice.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can use keyboard shortcuts and context-menu actions to Cut, Copy, and Paste text in Global Orchestra without triggering playback.
- **SC-002**: A reviewer can right-click Global Orchestra and see the required Java Blue-style context-menu categories.
- **SC-003**: A reviewer can insert each required Blue Variable token from the context menu into the editor.
- **SC-004**: A reviewer can inspect the spec research output and identify the Java source files or behaviors used for context-menu, completion, and hint parity.
- **SC-005**: A reviewer can verify at least one concrete Java Blue-derived completion or hint category is implemented, or see a documented reason why the backing data was not practical for this slice.
- **SC-006**: A reviewer can save and reopen a project after using the editor parity features and observe that Global Orchestra text persists correctly.

## Assumptions

- CodeMirror remains the selected editor stack from spec 018.
- Global Orchestra remains the first implementation surface, with Global Score reuse kept as an explicit design constraint.
- The Java Blue implementation is the source of truth for menu categories, completion data, and hint behavior where the behavior can be identified.
- Electron-native context menus may be considered if required for clipboard parity, but Java Blue visual parity and renderer-owned editor state integration remain important decision factors.
- Add to Code Repository may require a follow-on repository UI if the Java backing feature is larger than this editor parity slice.
