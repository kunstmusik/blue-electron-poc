# Quickstart: Csound Editor Java Blue Parity

## Goal

Validate that the CodeMirror-backed Global Orchestra editor behaves more like Java Blue for clipboard actions, editor context menus, and completion/hint basics.

## Implementation Order

1. Confirm the Java source anchors in `research.md`.
2. Add reusable editor action helpers for text insertion and clipboard commands.
3. Add the Java Blue-style context-menu model and renderer integration.
4. Wire the context menu into `SelectedCodeEditor`.
5. Verify/fix keyboard Cut/Copy/Paste behavior, including Electron main-menu roles if needed.
6. Add Blue Variables and Blue Opcodes insertion items.
7. Add or defer Opcodes, Custom, and Add to Code Repository based on available metadata and repository support.
8. Add the first Java Blue-derived completion/hint provider.
9. Add tests and update parity-gap documentation.

## Manual Validation

### Clipboard

1. Run `pnpm --filter @blue/app test`.
2. Start the app in development mode.
3. Open a project.
4. Open `Global Orchestra`.
5. Type text, select part of it, and invoke Cut from the keyboard.
6. Confirm selection is removed and can be pasted back.
7. Select text and invoke Copy from the keyboard and context menu.
8. Confirm Paste inserts copied text in the editor.
9. Press Space in the editor and confirm it inserts a space rather than starting playback.

### Context Menu

1. Right-click inside the Global Orchestra editor.
2. Confirm the context menu includes Blue Variables, Opcodes, Blue Opcodes, Custom, Add to Code Repository, Cut, Copy, and Paste.
3. Open Blue Variables and insert each required token.
4. Open Blue Opcodes and insert each required mixer opcode signature.
5. Confirm disabled or incomplete categories explain why they are not yet active.

### Completion And Hints

1. Type a Csound variable prefix that already appears earlier in the document.
2. Trigger completion and confirm document-local variable matches appear.
3. Trigger completion for Blue opcode or Java-derived entries.
4. Confirm entries do not duplicate obvious CodeMirror package completions.

### Persistence

1. Use menu insertions and completions to edit Global Orchestra text.
2. Save the project.
3. Reopen the project.
4. Confirm the edited Global Orchestra text persists.

## Expected Outcome

- Cut, Copy, and Paste work predictably inside the editor.
- The context menu matches the required Java Blue categories and implements the high-confidence insertion items.
- Completion/hint behavior has one concrete Java-derived parity pass and clear documentation for anything deferred.
- Editor parity helpers are reusable for future Global Score and other Csound text editors.
