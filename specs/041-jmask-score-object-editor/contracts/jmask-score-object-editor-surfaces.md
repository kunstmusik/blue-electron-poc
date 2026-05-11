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
    parameters: JMaskParameterSnapshot[];
    capabilities: {
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
type JMaskTypeSpecificPatch =
  | { seedUsed: boolean }
  | { seed: number }
  | {
      jmaskPatch: {
        kind: 'parameter-list';
        operations: JMaskParameterMutation[];
      };
    }
  | {
      jmaskPatch: {
        kind: 'nested-update';
        parameterId: string;
        section: 'generator' | 'mask' | 'quantizer' | 'accumulator' | 'probability' | 'table';
        payload: Record<string, unknown>;
      };
    };
```

Notes:

- Expanded rows, scroll position, and temporary focus state are renderer-local and are not canonical patches.
- Unsupported nested sections must be declared in the document payload and preserved by the canonical model.
- If a preview flow is claimed, it is read-only with respect to canonical `JMask` data.
