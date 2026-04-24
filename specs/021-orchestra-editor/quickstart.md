# Quickstart: Orchestra Editor Implementation

## Prerequisites

- Work on branch `021-orchestra-editor`.
- Keep Java reference sources nearby:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/`
  - `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/`
- If TanStack Table is used as planned, add `@tanstack/react-table` to `@blue/app`.

## Development Order

1. Add/complete `@blue/data` instrument models and XML tests for comments, JavaScriptInstrument, PythonInstrument preservation, BlueX7, and BlueSynthBuilder gaps.
2. Extend `ProjectEditorSnapshot` and `ProjectDocumentPatch` with orchestra snapshots and patch intents.
3. Add renderer project-store selectors/actions for orchestra data.
4. Replace the `OrchestraTopComponent` placeholder in `DockviewPanel` with `OrchestraPanel`.
5. Implement `ArrangementPanel` using the chosen table approach and wire row selection to `InstrumentEditorPanel`.
6. Implement `Instrument Editor` and `Comments` tabs.
6. Implement GenericInstrument and JavaScriptInstrument editors using reusable code editor surfaces plus explicit UDO placeholders.
7. Implement `Instrument Editor` and `Comments` tabs.
8. Implement BlueX7 editor baseline and tests for preservation-focused metadata editing.
9. Implement BlueSynthBuilder editor in staged pieces: code editor, baseline interface shell, widget/object-name editing for loaded widgets, object-name completions, generation tests, and explicit follow-on placeholders where parity remains deferred.

## Manual Verification

1. Start the app with `pnpm --filter @blue/app dev`.
2. Open a `.blue` project that contains arrangement instruments.
3. Open the `Orchestra` tab.
4. Confirm the left side contains the arrangement panel and temporary library area.
5. Drag the splitter between the arrangement panel and library, then drag the splitter between the left stack and instrument editor.
6. Select each supported instrument type and verify the correct editor appears.
7. Edit a GenericInstrument text field and comments, save, reopen, and confirm edits persist.
8. Convert a GenericInstrument to BlueSynthBuilder and verify generated text uses BSB instrument text semantics.
9. Open a PythonInstrument if available and confirm the dummy panel preserves data without claiming Python support.

## Implementation Notes

- The arrangement table uses `@tanstack/react-table` as a headless model only; styling and markup remain app-owned for Java Blue visual parity.
- Arrangement rows support controlled selection, enabled-state toggling, inline instrument-id editing, and row context-menu actions.
- Instrument editor routing covers GenericInstrument, JavaScriptInstrument, BlueX7 baseline preservation UI, BlueSynthBuilder baseline editing, PythonInstrument dummy state, and unknown instrument fallback.
- GenericInstrument and JavaScriptInstrument include explicit UDO placeholder tabs; embedded opcode-list editing is deferred.
- BlueSynthBuilder support is a baseline implementation: code tabs, interface shell, object-name completion, currently loaded widget value editing, and XML preservation are present; deeper Java BSB layout/widget/preset parity remains follow-on.

## Automated Verification

Run these from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```

## Expected Follow-On Work

- Program-wide orchestra library implementation.
- Full import/export of `.binstr` instruments if not completed in this slice.
- Embedded opcode-list editing for GenericInstrument and JavaScriptInstrument.
- Detailed BlueX7 parameter/operator editor parity.
- Advanced BSB parity beyond the baseline interface/code/widget editing implemented here, including Java-style layout editing, rich widget-specific controls, presets, and embedded opcode-list editing.
- PythonInstrument execution/editor parity.
