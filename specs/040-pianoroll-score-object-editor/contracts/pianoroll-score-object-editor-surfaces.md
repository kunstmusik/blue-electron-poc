# Contract: PianoRoll Score Object Editor Surfaces

## Editor Document Payload

`TypeSpecificScoreObjectEditorSnapshot` gains a dedicated `PianoRoll` variant:

```ts
interface PianoRollEditorSnapshot {
  kind: 'structured';
  editorFamily: 'PianoRoll';
  payload: {
    noteCanvas: PianoRollCanvasSnapshot;
    properties: PianoRollPropertiesSnapshot;
    capabilities: {
      fieldEditor: boolean;
      clipboard: boolean;
      undo: boolean;
      noteTemplateOverride: boolean;
    };
    deferredCapabilities: string[];
  };
}
```

## Canonical Patch Surface

`ProjectDocumentPatch.score.updateTypeSpecificEditor.patch` for `PianoRoll` supports the following shapes:

```ts
type PianoRollTypeSpecificPatch =
  | {
      pianoRollPatch: {
        kind: 'note-batch';
        operations: PianoRollInteractionBatch[];
      };
    }
  | {
      pianoRollPatch: {
        kind: 'field-edit';
        noteIds: string[];
        fieldName: string;
        values: number[];
      };
    }
  | {
      pianoRollPatch: {
        kind: 'properties';
        instrumentId?: string;
        noteTemplate?: string;
        pchGenerationMethod?: number;
        transposition?: number;
      };
    };
```

Notes:

- Canvas selection, viewport position, and in-progress drag state are renderer-local and are not canonical patches.
- Clipboard and undo state are local helpers unless this slice explicitly promotes part of them to canonical behavior.
- Unsupported property or field features must be declared in the document payload rather than implied silently.
