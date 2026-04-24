# Contract: Orchestra Editor Surface

This contract describes the renderer/main/shared boundary for Spec 021. It is an internal UI/data contract, not a public HTTP API.

## Project Snapshot Extension

`ProjectEditorSnapshot` should include:

```ts
interface ProjectEditorSnapshot {
  filePath: string | null;
  version: string;
  globalOrc: string;
  globalSco: string;
  projectProperties: ProjectPropertiesSnapshot;
  transport: ToolbarProjectTransportSnapshot;
  orchestra: OrchestraSnapshot;
  loaded: boolean;
}
```

## Orchestra Snapshot

```ts
interface OrchestraSnapshot {
  loaded: boolean;
  arrangement: ArrangementSnapshot;
  selectedAssignmentId?: string;
  temporaryLibrary: TemporaryInstrumentLibrarySnapshot;
}

interface ArrangementSnapshot {
  rows: ArrangementRowSnapshot[];
}

interface ArrangementRowSnapshot {
  assignmentId: string;
  enabled: boolean;
  instrumentName: string;
  instrumentType: string;
  instrumentSummary?: string;
  editable: boolean;
}

interface TemporaryInstrumentLibrarySnapshot {
  status: 'deferred';
  message: string;
}
```

## Instrument Snapshot

```ts
type InstrumentSnapshot =
  | GenericInstrumentSnapshot
  | JavaScriptInstrumentSnapshot
  | PythonInstrumentSnapshot
  | BlueX7InstrumentSnapshot
  | BlueSynthBuilderInstrumentSnapshot
  | UnknownInstrumentSnapshot;

interface InstrumentSnapshotBase {
  assignmentId: string;
  type: string;
  name: string;
  enabled: boolean;
  comment: string;
}
```

Instrument-specific snapshots should carry only serializable data. Renderer components must not depend on class instances crossing IPC.

## Project Document Patch Extension

`ProjectDocumentPatch` should gain an optional orchestra branch:

```ts
interface ProjectDocumentPatch {
  globalOrc?: string;
  globalSco?: string;
  projectProperties?: Partial<ProjectPropertiesSnapshot>;
  transport?: Partial<Pick<ToolbarProjectTransportSnapshot, 'renderStartTime' | 'renderEndTime' | 'loopRendering'>>;
  orchestra?: OrchestraPatch;
}
```

## Orchestra Patch Variants

```ts
type OrchestraPatch =
  | { type: 'addInstrument'; instrumentType: SupportedNewInstrumentType; insertAfterAssignmentId?: string }
  | { type: 'removeAssignment'; assignmentId: string }
  | { type: 'updateAssignment'; assignmentId: string; enabled?: boolean; nextAssignmentId?: string }
  | { type: 'replaceInstrument'; assignmentId: string; instrument: InstrumentSnapshot }
  | { type: 'pasteInstrument'; insertAfterAssignmentId?: string }
  | { type: 'convertGenericToBsb'; assignmentId: string }
  | { type: 'updateInstrument'; assignmentId: string; patch: InstrumentPatch }
  | { type: 'updateInstrumentComment'; assignmentId: string; comment: string };

type SupportedNewInstrumentType =
  | 'generic'
  | 'javascript'
  | 'blueX7'
  | 'blueSynthBuilder';
```

Clipboard actions may be renderer-local initially for copy/paste payloads, but paste must still become a canonical `BlueData` mutation before save.

## Editor Routing Contract

- `OrchestraPanel` owns selected assignment id.
- `OrchestraPanel` uses nested draggable splitters to mirror Java Blue's JSplitPane layout: arrangement/editor on the outer split and arrangement/library on the inner split.
- `ArrangementPanel` emits assignment selection and row action intents.
- `InstrumentEditorPanel` receives the selected `InstrumentSnapshot`.
- `InstrumentEditorPanel` shows `Instrument Editor` and `Comments` tabs.
- Editor components emit `InstrumentPatch` objects and do not mutate class instances directly.
- PythonInstrument routes to `PythonInstrumentDummyPanel`.
- Unknown instruments route to an unsupported editor panel that preserves data.

## Arrangement Table Contract

- Row identity is `assignmentId`.
- Selection is single-row.
- Inline editing commits through `updateAssignment` or `updateInstrument`.
- Context menu actions must be enabled/disabled from current row selection and clipboard state.
- Visual rendering remains app-owned; TanStack Table provides state/row/cell helpers only.

## BSB Editor Contract

- BSB code editors use current Csound editor helpers.
- Object-name completion reads from current BSB interface widget snapshots.
- Interface edits emit BSB-specific `InstrumentPatch` variants.
- Generated text preview/test actions call data-layer generation paths, not renderer string replacement logic.
