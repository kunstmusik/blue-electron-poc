# Contract: JMask Score Object Editor Surfaces

## Editor Document Payload

`TypeSpecificScoreObjectEditorSnapshot` gains a dedicated `JMask` variant:

```ts
interface JMaskEditorSnapshot {
  kind: 'structured';
  editorFamily: 'JMask';
  payload: {
    seedUsed: boolean;
    seed: number;
    visibilityMenu: Array<{
      parameterIndex: number;
      label: string;
      visible: boolean;
    }>;
    parameters: JMaskParameterSnapshot[];
    previewSupport: {
      available: boolean;
      shortcut: 'Mod+T';
      deferredReason?: string;
    };
    capabilities: {
      parameterMenus: boolean;
      rowRename: boolean;
      visibilityPopup: boolean;
      reorder: boolean;
      probabilityEditors: boolean;
      tableEditors: boolean;
      testAvailable: boolean;
    };
    deferredCapabilities: string[];
  };
}
```

## Canonical Patch Surface

`ProjectDocumentPatch.score.updateTypeSpecificEditor.patch` for `JMask` supports the following shapes:

```ts
type JMaskTypeSpecificPatch = Partial<{
  seedUsed: boolean;
  seed: number;
  parameterVisibility: {
    parameterIndex: number;
    visible: boolean;
  };
  parameterRename: {
    parameterIndex: number;
    fieldName: string;
  };
  jmaskParameterList: {
    operations: Array<
      | { kind: 'addBefore'; parameterIndex: number; generatorType: JMaskGeneratorType }
      | { kind: 'addAfter'; parameterIndex: number; generatorType: JMaskGeneratorType }
      | { kind: 'remove'; parameterIndex: number }
      | { kind: 'pushUp'; parameterIndex: number }
      | { kind: 'pushDown'; parameterIndex: number }
      | { kind: 'changeType'; parameterIndex: number; generatorType: JMaskGeneratorType }
    >;
  };
  jmaskSectionToggle: {
    parameterIndex: number;
    section: 'mask' | 'quantizer' | 'accumulator';
    enabled: boolean;
  };
  jmaskGeneratorUpdate: {
    parameterIndex: number;
    generatorPatch: JMaskGeneratorPatch;
  };
  jmaskProbabilitySelection: {
    parameterIndex: number;
    probabilityType: JMaskProbabilityType;
  };
  jmaskProbabilityUpdate: {
    parameterIndex: number;
    probabilityPatch: JMaskProbabilityPatch;
  };
  jmaskMaskUpdate: {
    parameterIndex: number;
    payload: Record<string, unknown>;
  };
  jmaskQuantizerUpdate: {
    parameterIndex: number;
    payload: Record<string, unknown>;
  };
  jmaskAccumulatorUpdate: {
    parameterIndex: number;
    payload: Record<string, unknown>;
  };
  jmaskTableUpdate: {
    parameterIndex: number;
    tableTarget:
      | 'segment'
      | 'oscillatorFrequency'
      | 'maskHigh'
      | 'maskLow'
      | 'quantizer'
      | 'accumulator'
      | 'probability';
    operation:
      | { kind: 'addPoint'; point: { time: number; value: number } }
      | { kind: 'movePoint'; pointIndex: number; point: { time: number; value: number } }
      | { kind: 'removePoint'; pointIndex: number }
      | { kind: 'replacePoints'; points: Array<{ time: number; value: number }> }
      | { kind: 'setInterpolation'; interpolationType: string; interpolation: number };
  };
}>;
```

Notes:

- Expanded rows, scroll position, active popup state, selected table point, and in-progress table drags are renderer-local and are not canonical patches.
- Parameter rows should be patched by `parameterIndex`, matching the Java `Field` list semantics and renumbering behavior.
- Unsupported nested sections must be declared in the document payload and preserved by the canonical model.
- If a preview flow is claimed, it is read-only with respect to canonical `JMask` data and should reuse the existing editor-side modal pattern.
