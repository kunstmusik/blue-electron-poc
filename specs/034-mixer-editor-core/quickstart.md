# Quickstart: Mixer Editor Core

## Purpose

Manual verification flow for the first usable mixer editor slice.

## Preconditions

1. Open a project that already contains arrangement rows and mixer data.
2. Ensure the app can read the real user library file at `~/.blue/effectsLibrary.xml`, or use a fixture override if the implementation provides one for tests.
3. Confirm the workbench opens `MixerTopComponent` from the current layout or menu path.

## Manual Verification Flow

### 1. Mixer panel replaces the placeholder

1. Open `MixerTopComponent`.
2. Verify the panel shows instrument channels, subchannels, and master rather than `PlaceholderPanel`.
3. Verify the panel has safe empty-state messaging if no project is loaded.

### 2. Arrangement changes stay synchronized

1. Add a new instrument row in the arrangement.
2. Confirm a corresponding mixer strip appears or an associated channel is updated according to the Java association rules.
3. Remove or replace an existing arrangement row.
4. Confirm the mixer strips update without reopening the panel.
5. Rename an instrument or change its assignment name.
6. Confirm the associated channel name updates or reconciles as expected.

### 3. Effects library is loaded but not saved

1. Open the effects-library management command from the native menu.
2. Confirm the dialog shows categories and effects parsed from the user's real library file.
3. Rename a category or duplicate an effect inside the dialog.
4. Close and reopen the dialog in the same app session and confirm the session mutation is still visible.
5. Restart the app or use reload if implemented.
6. Confirm the original on-disk library remains unchanged unless a future spec explicitly adds persistence.

### 4. Mixer chain authoring works

1. In the Mixer panel, add an effect from the library to a channel.
2. Add a send to the same channel.
3. Reorder the chain entries.
4. Toggle effect enabled state, adjust send target/level, and remove an entry.
5. Confirm every change updates the visible chain immediately and persists in the project document.

### 5. Effect editor window reuse works

1. Open an effect editor from a channel chain.
2. Reopen the same effect.
3. Confirm the original non-modal window is focused instead of a duplicate window being created.
4. Edit interface/code/UDO content.
5. Confirm the backing project effect updates.
6. Repeat for a library-owned effect and confirm the library session updates instead of the project mixer.

## Suggested Validation Commands

```bash
./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks
git diff --check
pnpm --filter @blue/app test
pnpm --filter @blue/app build
```

Run `pnpm --filter @blue/data test` as well if the implementation touches `packages/blue-data/src/mixer/` during the initial audit.

## Implementation Notes

- The Mixer panel now opens the effects library with the active channel and chain preselected when you choose `Add Effect`.
- The effects library is session-local only; rename, duplicate, remove, and chain insertion actions update memory state and should not change `~/.blue/effectsLibrary.xml`.
- Effect editor windows are non-modal and are reused for the same effect id and owner type instead of spawning duplicates.
