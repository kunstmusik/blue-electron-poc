# Data Model: Csound Editor Tooling

## Overview

This slice does not introduce a new persisted project schema. It introduces a selected richer renderer-side editing surface for the existing `globalOrc` project field and a decision record for CodeMirror vs Monaco language/completion support.

## Entity: EditorCandidateEvaluation

- **Purpose**: Captures the comparison between CodeMirror and Monaco before implementation.
- **Fields**:
  - `candidate`: `codemirror` or `monaco`
  - `csoundLanguageSupport`: summary of available Csound syntax/language support
  - `dynamicCompletionSupport`: how completions can be supplied dynamically
  - `packagingRisk`: Electron/Vite dependency and build risk
  - `testability`: how renderer tests can cover the integration
  - `futureReuse`: expected reuse path for Global Score and other code surfaces
  - `recommendation`: `preferred`, `fallback`, or `rejected-for-018`
- **Validation**:
  - both candidates must be represented
  - dynamic completion support must be explicitly assessed for both candidates

## Entity: GlobalOrchestraEditorState

- **Purpose**: Renderer-visible editing state for the selected Global Orchestra editor.
- **Fields**:
  - `loaded`: whether a project is currently loaded
  - `value`: current `globalOrc` text from the project store
  - `dirty`: whether the current project is dirty according to the store
  - `readOnly`: whether editing is disabled because no project is loaded
  - `editorMode`: selected editor mode, such as `codemirror-csound` or `monaco-csound`
  - `completionMode`: selected completion mode, such as `static-catalog`, `document-local`, `project-dynamic`, or `runtime-dynamic`
- **Validation**:
  - when `loaded` is `false`, the panel must not allow editing
  - `value` must remain sourced from the project store, not local editor-only state

## Entity: SelectedEditorConfiguration

- **Purpose**: Defines the bounded setup for the selected editor surface.
- **Fields**:
  - `editorKind`: `codemirror` or `monaco`
  - `languageId`: language identifier used by the selected editor
  - `themeId`: editor theme identifier used by the workbench
  - `editorOptions`: bounded option set for font, wrapping, tab size, and read-only behavior
  - `dependencyPlan`: package/dependency set required by the selected editor
- **Validation**:
  - configuration must not rely on CDN loading
  - configuration must be compatible with packaged Electron builds

## Entity: DynamicCompletionStrategy

- **Purpose**: Defines how the selected editor can receive completions now or later.
- **Completion Inputs**:
  - built-in opcode catalog
  - document-local UDOs
  - project-local instruments or score context
  - runtime/discovered opcode metadata
- **Validation**:
  - the selected editor must expose an adapter point for future dynamic completion sources
  - the 018 implementation may ship a narrower completion set if the extension point is documented

## Entity: GlobalOrchestraEditorAdapter

- **Purpose**: Local boundary between the selected editor implementation and project-store state.
- **Responsibilities**:
  - create/dispose selected editor instance
  - sync project-store text into the editor
  - emit text changes back through `updateGlobalOrc`
  - register selected language support and completion source hooks
- **Validation**:
  - adapter must tolerate project switches
  - adapter must clean up runtime editor resources on unmount

## Relationships

- Two `EditorCandidateEvaluation` records feed one selected `SelectedEditorConfiguration`.
- One `GlobalOrchestraEditorState` reads from one project-store snapshot.
- One `SelectedEditorConfiguration` drives one `GlobalOrchestraEditorAdapter`.
- One `DynamicCompletionStrategy` documents how completions attach to the selected adapter.
- `GlobalOrchestraPanel` owns view composition, but not canonical document state.

## State Transitions

### Evaluation Flow

1. Compare CodeMirror and Monaco candidate capabilities.
2. Record dynamic completion strategy for both.
3. Select preferred 018 editor path.
4. Update implementation tasks according to the chosen editor.

### Project Load Flow

1. No project loaded
2. Project store hydrates `globalOrc`
3. `GlobalOrchestraPanel` switches from empty-disabled to selected-editor-visible
4. Editor adapter receives initial `value`
5. Editor renders editable Global Orchestra surface

### Edit Flow

1. User edits text in the selected editor
2. Editor adapter receives content change
3. Adapter dispatches `updateGlobalOrc`
4. Project store marks project dirty and mirrors updated text
5. Editor remains synchronized with store state

### Save/Reopen Flow

1. User saves through the existing project flow
2. Main process persists canonical project document
3. Reopened project rehydrates `globalOrc`
4. Selected editor surface shows the saved content with no panel-specific migration step

### Project Switch Flow

1. Different project loads
2. Project store replaces `globalOrc`
3. Editor adapter updates or replaces editor document content
4. Panel reflects the new project without stale editor state leaking across projects

## Non-Persisted Notes

- Editor view state persistence is not a requirement for 018.
- Completion catalogs, syntax state, and parse state are runtime-only and should not be serialized into `.blue` files.
