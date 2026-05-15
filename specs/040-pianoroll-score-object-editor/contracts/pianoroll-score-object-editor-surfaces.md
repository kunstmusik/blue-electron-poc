# Contract: PianoRoll Score Object Editor Surfaces

## Editor Document Payload

`TypeSpecificScoreObjectEditorSnapshot` uses the existing `structured` editor family with a dedicated `PianoRoll` payload:

```ts
interface PianoRollPayload {
  instrumentId: string;
  noteTemplate: string;
  pchGenerationMethod: number;
  transposition: number;
  pixelSecond: number;
  noteHeight: number;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  useGlobalRuler: boolean;
  primaryTimeDisplay: string;
  secondaryTimeDisplay: string;
  secondaryRulerEnabled: boolean;
  scale: {
    scaleName: string;
    baseFrequency: number;
    octave: number;
    ratios: number[];
  };
  fieldDefinitions: Array<{
    fieldName: string;
    fieldType: string;
    minValue: number;
    maxValue: number;
    defaultValue: number;
  }>;
  notes: Array<{
    octave: number;
    scaleDegree: number;
    start: number;
    duration: number;
    fieldValues: number[];
    noteTemplate?: string | null;
  }>;
  capabilities: {
    fieldEditor: boolean;
    clipboard: boolean;
    undo: boolean;
    noteTemplateOverride: boolean;
  };
  deferredCapabilities: string[];
}
```

## Canonical Patch Surface

`ProjectDocumentPatch.score.updateTypeSpecificEditor.patch` for `PianoRoll` supports the implemented shapes below. Patches may combine property updates with one `pianoRollNoteBatch` when the interaction boundary needs both.

```ts
type PianoRollTypeSpecificPatch = Partial<{
  instrumentId: string;
  noteTemplate: string;
  pchGenerationMethod: number;
  transposition: number;
  pixelSecond: number;
  noteHeight: number;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  useGlobalRuler: boolean;
  primaryTimeDisplay: string;
  secondaryTimeDisplay: string;
  secondaryRulerEnabled: boolean;
  scale: {
    scaleName: string;
    baseFrequency: number;
    octave: number;
    ratios: number[];
  };
  fieldDefinitions: PianoRollFieldDefinitionSnapshot[];
  addFieldDef: PianoRollFieldDefinitionSnapshot;
  updateFieldDef: { index: number } & Partial<PianoRollFieldDefinitionSnapshot>;
  removeFieldDef: number;
  pianoRollNoteBatch: {
    operations: Array<{
      kind: 'add' | 'addMany' | 'remove' | 'move' | 'resize' | 'update' | 'replace';
      noteIndex?: number;
      noteIndices?: number[];
      note?: PianoRollNoteSnapshot;
      notes?: PianoRollNoteSnapshot[];
      deltaStart?: number;
      deltaDuration?: number;
      deltaOctave?: number;
      deltaScaleDegree?: number;
    }>;
  };
}>;
```

Notes:

- Canvas selection, viewport position, paste target, and in-progress drag state are renderer-local and are not canonical patches.
- Clipboard and undo state remain local helpers; undo and redo replay canonical restore patches built from the flat payload snapshot.
- The completed slice currently advertises `deferredCapabilities: []` for the claimed subset. Any future exclusions should be added there instead of being implied silently.
