# Quickstart: PianoRoll Score Object Editor Parity

## Goal

Validate that the `PianoRoll` score-object editor now behaves like a real note-entry canvas with supporting field and property workflows, rather than a metadata form only.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Prepare a project containing at least one `PianoRoll` score object with multiple notes and non-default properties.
3. Keep at least one example where clipboard or undo behavior is expected if this slice claims it.

## Implementation Notes

- Supported shortcuts in the notes surface: `Cmd/Ctrl+C`, `Cmd/Ctrl+X`, `Cmd/Ctrl+V`, `Delete`/`Backspace`, `Cmd/Ctrl+A`, `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, `Alt+S`, `Cmd/Ctrl+=`, `Cmd/Ctrl+-`, `Cmd/Ctrl+ArrowUp`, and `Cmd/Ctrl+ArrowDown`.
- Scale edits, field-definition edits, note-template overrides, ruler settings, and note-batch mutations are canonical and reload-safe.
- Manual `PianoRoll` quickstart validation was signed off on 2026-05-14.

## Validation Steps

1. Load the project and open `ScoreObjectEditorTopComponent` for a `PianoRoll` object.
2. Confirm the auxiliary editor renders a time ruler, pitch context, and note canvas instead of metadata fields only.
3. Add one note from the supported canvas interaction.
4. Move and resize an existing note, then confirm the note geometry updates coherently.
5. Multi-select notes and verify the selected-note highlighting is visible.
6. Open or activate the supported field-editing workflow and change one supported field value.
7. Confirm the field change persists after the editor document refreshes.
8. Edit supported properties such as pitch-generation method, transposition, or note template.
9. Confirm the canonical `PianoRoll` object updates and the editor survives save or reload.
10. If clipboard or undo behavior is claimed, exercise the supported shortcuts or menus.
11. Confirm the canvas and canonical state remain synchronized.
12. Remove the selected `PianoRoll` target while the editor is open.
13. Confirm the editor falls back to the removed-target state instead of showing stale canvas content.

## Expected Results

- `PianoRoll` opens in a real auxiliary canvas editor.
- Note edits commit through canonical batch mutations rather than ad hoc form writes.
- Supported field and property workflows mutate canonical state coherently.
- The claimed shortcut, clipboard, and undo subset stays synchronized with the canonical document.
