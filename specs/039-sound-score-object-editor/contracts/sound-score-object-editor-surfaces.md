# Contract: Sound Score Object Editor Surfaces

## Editor Document Payload

`TypeSpecificScoreObjectEditorSnapshot` gains a dedicated `Sound` variant:

```ts
interface SoundEditorSnapshot {
  kind: 'structured';
  editorFamily: 'Sound';
  payload: {
    availableTabs: Array<'interface' | 'automation' | 'comments'>;
    defaultTab: 'interface' | 'automation' | 'comments';
    interfaceSnapshot: SoundInterfaceSnapshot;
    automationSnapshot: SoundAutomationSnapshot;
    commentText: string;
    testAvailable: boolean;
    deferredCapabilities: string[];
  };
}
```

## Canonical Patch Surface

`ProjectDocumentPatch.score.updateTypeSpecificEditor.patch` for `Sound` supports the following shapes:

```ts
type SoundTypeSpecificPatch =
  | { comment: string }
  | { bsbInterfacePatch: BsbInterfacePatch }
  | {
      automationParameterId: string;
      automationPatch: {
        lineData?: LineDataSnapshot;
        automationEnabled?: boolean;
      };
    };
```

Notes:

- Selected-tab changes are renderer-local and are not canonical patches.
- `bsbInterfacePatch` reuses the existing BSB patch surface from earlier specs.
- Unsupported automation capabilities must be declared in the document payload instead of being silently patched.

## Test Preview Surface

The editor-side test action returns a scoped preview result:

```ts
interface SoundTestPreviewResult {
  generatedScoreText?: string;
  errorMessage?: string;
  targetLabel: string;
}
```

The test action is read-only with respect to canonical score data.
