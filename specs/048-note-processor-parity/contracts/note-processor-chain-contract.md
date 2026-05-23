# Contract: Note Processor Chain Editing

This contract describes the shared data exchanged between `@blue/data`, the app shared project contract, Electron main/preload, and renderer note-processor UI.

## Processor Catalog Contract

`@blue/data` exposes the in-scope processor catalog as stable metadata.

```ts
interface NoteProcessorDefinitionSnapshot {
  type: string;
  displayName: string;
  position: number;
  parameters: NoteProcessorParameterSnapshot[];
}

interface NoteProcessorParameterSnapshot {
  name: string;
  label: string;
  valueType: 'string' | 'number' | 'integer' | 'boolean' | 'multilineText' | 'scale' | 'readonly';
  defaultValue: string | number | boolean | null;
  required: boolean;
}
```

Contract rules:

- The catalog includes the 16 in-scope non-Python Java plugin processors.
- The catalog excludes `Code`, `ValueTimeMapper`, and PythonProcessor as addable processors for this slice.
- PythonProcessor XML appears only as a deferred preserved chain entry when loaded from a project.

## Chain Snapshot Contract

```ts
interface NoteProcessorEntrySnapshot {
  id: string;
  processorType: string;
  displayName: string;
  supported: boolean;
  deferred: boolean;
  summary: string;
  parameters: Record<string, string | number | boolean>;
  serializedXml: string;
}

interface NoteProcessorChainSnapshot {
  processors: NoteProcessorEntrySnapshot[];
  hasUnsupportedProcessors: boolean;
  hasDeferredProcessors: boolean;
}
```

Contract rules:

- Supported entries must be reifiable into canonical processors.
- Deferred or unsupported entries must retain `serializedXml` and cannot be edited as supported processors.
- Chain snapshots preserve order exactly.

## Scope Target Contract

```ts
type NoteProcessorChainTarget =
  | { kind: 'scoreObject'; target: ScoreObjectEditorTargetSnapshot }
  | { kind: 'soundLayer'; rootGroupIndex: number; containerPath: Array<{ layerIndex: number; objectIndex: number }>; layerIndex: number }
  | { kind: 'layerGroup'; rootGroupIndex?: number; containerPath?: Array<{ layerIndex: number; objectIndex: number }> }
  | { kind: 'rootScore' };
```

Contract rules:

- `scoreObject` targets use the existing score-object editor target resolution.
- `soundLayer` targets address layers that own sound objects and note processor chains.
- `layerGroup` targets address layer groups that own note processor chains.
- `rootScore` targets the project score chain.
- Stale targets fail safely and trigger a snapshot refresh.

## Project Patch Contract

The score patch contract gains scoped note-processor replacement/import/save actions.

```ts
type ScorePatch =
  | ExistingScorePatch
  | {
      type: 'replaceScopedNoteProcessorChain';
      target: NoteProcessorChainTarget;
      chain: NoteProcessorChainSnapshot;
    }
  | {
      type: 'saveNamedNoteProcessorChain';
      name: string;
      chain: NoteProcessorChainSnapshot;
    };
```

Contract rules:

- The main/shared mutation layer reifies supported processor snapshots using `@blue/data` helpers.
- Existing unknown/deferred XML is preserved for unsupported/deferred entries.
- Non-empty replacements must mutate canonical `BlueData` and mark the project dirty.

## Renderer UI Contract

The reusable chain editor receives catalog, chain, target, named-chain list, and commit callbacks.

```ts
interface NoteProcessorChainEditorProps {
  target: NoteProcessorChainTarget;
  chain: NoteProcessorChainSnapshot;
  catalog: NoteProcessorDefinitionSnapshot[];
  namedChains: NamedNoteProcessorChainSnapshot[];
  onCommit(chain: NoteProcessorChainSnapshot): void;
  onSaveNamedChain(name: string, chain: NoteProcessorChainSnapshot): void;
}
```

Contract rules:

- Add menu order follows Java plugin order.
- Remove, reorder, cut, copy, paste, clear, import, and save-as-name are available where valid.
- Deferred and unsupported entries are visible but not editable as supported processors.
