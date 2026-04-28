# Quickstart: Tables, UDO, and CSD Generation Editors

## Preconditions

1. Check out `026-tables-udo-csd`.
2. Install dependencies if needed with `bun install` or the repository's current package workflow.
3. Build `@blue/data` before app tests if shared generated output changed.

## Implementation Validation

Run from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```

## Manual Tables Scenario

1. Launch the app.
2. Open a `.blue` project.
3. Open `Tables`.
4. Confirm it shows the project's existing table text and is editable.
5. Add or edit an `f` statement.
6. Right-click and confirm Java Blue-style editor context menu actions are available.
7. Save and reopen the project.
8. Confirm the table text persisted.
9. Generate CSD to Screen and confirm table text appears in the score section.

## Manual UDO Scenario

1. Open `UDO`.
2. Confirm project UDOs are listed.
3. Add a UDO.
4. Edit name, style, signature fields, code, and comments.
5. Preview generated opcode text.
6. Push the row up/down if there are multiple UDOs.
7. Use cut/copy/paste from the context menu.
8. Save and reopen the project.
9. Confirm UDO order and fields persisted.
10. Generate CSD to Screen and confirm the project UDO appears in the orchestra section.

## Manual Project Menu Scenario

1. Inspect the native menu.
2. Confirm `Project` appears before `Window`.
3. Confirm the old standalone `Playback` menu actions are now under `Project`.
4. Choose `Generate CSD to Screen`.
5. Confirm a read-only CSD modal opens with line numbers, highlighting, selection, copy support, and close behavior.
6. Choose `Generate CSD to Disk`.
7. Save to a path without `.csd`.
8. Confirm the written file has `.csd` extension and matches the screen-generated output for the same project state.

## Deferred Checks

- User UDO library behavior should be absent or explicitly marked deferred.
- Full Java Project menu parity beyond CSD generation and moved playback/render actions is not required in this spec.
- Realtime CSD-to-screen is optional unless implementation can support it safely without expanding scope.

## Closeout Note

- No additional manual-verification deltas were needed beyond the validation and manual scenarios above; the shipped implementation includes the shared UDO workspace, generated CSD modal, and Project menu closeout described in the spec.
