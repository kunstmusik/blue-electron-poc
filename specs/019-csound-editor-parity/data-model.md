# Data Model: Csound Editor Java Blue Parity

## CsoundEditorCommand

Represents an editor action that can be invoked from keyboard shortcuts, context menus, or tests.

Fields:

- `id`: stable command identifier, for example `cut`, `copy`, `paste`, `insert-blue-variable-total-dur`
- `label`: user-facing label
- `enabled`: whether the command can run in the current editor state
- `run`: command handler that receives the current editor view/state

Validation:

- Commands that mutate text must no-op when the editor is read-only.
- Clipboard commands must not trigger playback or workbench shortcuts while the editor has focus.

## CsoundEditorMenuItem

Represents one entry in the Java Blue-style editor context menu.

Fields:

- `type`: `item`, `submenu`, or `separator`
- `id`: stable item identifier
- `label`: user-facing label
- `commandId`: optional command to run
- `insertText`: optional text inserted by the item
- `children`: submenu items
- `disabledReason`: optional reason for a disabled item

Relationships:

- Submenus contain nested `CsoundEditorMenuItem` entries.
- Items may run a `CsoundEditorCommand`.

Validation:

- Blue Variables must include `<TOTAL_DUR>`, `<RENDER_START>`, `<PROCESSING_START>`, `<INSTR_ID>`, and `<INSTR_NAME>`.
- Blue Opcodes must include the three Java-derived mixer opcode insertions.
- Disabled Custom or Add to Code Repository items must expose a reason for tests and user-facing affordance.

## InsertionItem

Represents a Java `NameValueTextAction`-style insertion where label and inserted value may differ.

Fields:

- `label`: menu/completion label
- `value`: text to insert
- `category`: `blue-variable`, `opcode`, `blue-opcode`, `custom`, or `other`
- `detail`: optional short description or signature

Validation:

- Inserting with a selection replaces the selection.
- Inserting without a selection inserts at the cursor.
- Inserting should keep focus in the editor after the action completes.

## JavaBlueCompletionSource

Represents a provider that contributes Java Blue-derived completion or hint entries into the selected CodeMirror editor.

Fields:

- `id`: provider identifier
- `priority`: ordering or de-duplication hint
- `entries`: static entries or a function that derives entries from editor/project context
- `dedupeKey`: label/value key used to avoid duplicate completion entries

Relationships:

- Completion sources feed `createDynamicCsoundCompletionSource`.
- Completion sources may read project data, current editor text, and cursor position.

Validation:

- Providers must return quickly or asynchronously without blocking editor input.
- Providers must handle missing project state.
- Providers must avoid duplicating equivalent entries from the CodeMirror Csound package where possible.

## ParityGapRecord

Documents Java Blue behavior that is researched but not fully implemented.

Fields:

- `javaSource`: absolute Java source path or resource path
- `behavior`: behavior description
- `status`: `implemented`, `partial`, or `deferred`
- `reason`: why the behavior is complete or deferred
- `followOn`: optional recommended future spec

Validation:

- Any disabled menu category must have a corresponding `ParityGapRecord`.
- Any completion/hint category identified in Java but not shipped in 019 must have a `ParityGapRecord`.
