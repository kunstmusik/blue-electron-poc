# Contract: Score Object Editor Surfaces

## Scope

This contract describes the shared TypeScript surface for Spec 037 between `@blue/data`, the shared project snapshot and patch layer, Electron main or preload IPC, and the renderer auxiliary score panels. It covers shared ScoreObject properties, type-specific editor routing, and deliberate fallback behavior. Later grouped score-object follow-up work and shell-level management/navigation workflows remain outside this contract.

## Score Shell Snapshot Extension

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

```ts
export interface ScoreObjectLocationRef {
  rootGroupIndex: number;
  containerPath: Array<{ layerIndex: number; objectIndex: number }>;
  layerIndex: number;
  objectIndex: number;
}

export interface ScoreObjectLibraryEntryRef {
  libraryId: string;
  libraryIndex: number;
  objectType: string;
}

export interface ScoreObjectEditorTargetSnapshot {
  selectionId: string;
  selectedObjectType: string;
  editorObjectType: string;
  ownerKind: 'timeline' | 'library';
  displayContext: 'timeline' | 'library' | 'instance';
  location?: ScoreObjectLocationRef;
  sourceInstanceLocation?: ScoreObjectLocationRef;
  library?: ScoreObjectLibraryEntryRef;
  supportsTimeBehavior: boolean;
  supportsRepeatPoint: boolean;
  supportsNoteProcessorChain: boolean;
}

export interface ScoreRowObjectSnapshot {
  objectId: string;
  objectType: string;
  name: string;
  startBeats: number;
  durationBeats: number;
  backgroundColor: number;
  isContainer: boolean;
  editorTarget: ScoreObjectEditorTargetSnapshot;
}
```

Requirements:

- `objectId` should become a stable selection identifier derived from the same canonical location as `editorTarget.selectionId`.
- Row snapshots remain lightweight and do not embed full editor payloads.
- `editorTarget` must carry enough metadata to resolve `Instance` and library-backed objects without consulting renderer-only state.

## On-Demand Editor Document Contract

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`.

```ts
export interface TimeValueSnapshot {
  value: number;
  timeBase: string;
  displayText: string;
}

export interface NoteProcessorEntrySnapshot {
  processorType: string;
  displayName: string;
  supported: boolean;
  summary: string;
  serializedXml: string;
}

export interface NoteProcessorChainSnapshot {
  processors: NoteProcessorEntrySnapshot[];
  hasUnsupportedProcessors: boolean;
}

export interface SharedScoreObjectPropertiesSnapshot {
  target: ScoreObjectEditorTargetSnapshot;
  name: string;
  startTime: TimeValueSnapshot;
  subjectiveDuration: TimeValueSnapshot;
  endTimeDisplay: string;
  backgroundColor: number;
  timeBehavior?: string;
  repeatPoint?: TimeValueSnapshot | null;
  noteProcessorChain?: NoteProcessorChainSnapshot | null;
}

export type TypeSpecificScoreObjectEditorSnapshot =
  | {
      kind: 'code';
      target: ScoreObjectEditorTargetSnapshot;
      syntax: 'text' | 'csound-score' | 'python' | 'javascript';
      text: string;
      auxiliaryFlags?: Record<string, string | number | boolean>;
    }
  | {
      kind: 'audioClip';
      target: ScoreObjectEditorTargetSnapshot;
      audioFile: string;
      numChannels: number;
      audioDuration: number;
      fileStartTime: number;
      fadeIn: number;
      fadeInType: string;
      fadeOut: number;
      fadeOutType: string;
      looping: boolean;
    }
  | {
      kind: 'file';
      target: ScoreObjectEditorTargetSnapshot;
      filePath: string;
      auxiliaryFlags?: Record<string, string | number | boolean>;
    }
  | {
      kind: 'structured';
      target: ScoreObjectEditorTargetSnapshot;
      editorFamily:
        | 'sound'
        | 'polyObject'
        | 'patternObject'
        | 'pianoRoll'
        | 'trackerObject'
        | 'notationObject'
        | 'lineObject'
        | 'jMask'
        | 'frozenSoundObject';
      payloadSummary: string;
      payload: Record<string, unknown>;
    }
  | {
      kind: 'fallback';
      target: ScoreObjectEditorTargetSnapshot;
      reason:
        | 'no-selection'
        | 'multiple-selection'
        | 'unsupported'
        | 'removed-target';
      message: string;
    };

export interface ScoreObjectEditorDocumentSnapshot {
  target: ScoreObjectEditorTargetSnapshot;
  shared: SharedScoreObjectPropertiesSnapshot;
  editor: TypeSpecificScoreObjectEditorSnapshot;
}

export interface ScoreObjectEditorRequest {
  target: ScoreObjectEditorTargetSnapshot;
}
```

Read IPC surface:

```ts
window.blueAPI.getScoreObjectEditorDocument(
  request: ScoreObjectEditorRequest,
): Promise<ScoreObjectEditorDocumentSnapshot | null>;
```

Requirements:

- Editor documents are read on demand for the active selection only.
- The read path must resolve timeline objects, library-owned objects, and `Instance` rerouting in main against canonical `BlueData`.
- Fallback states are returned as typed documents, not `alert(...)` placeholders or stale content.

## Canonical Score Patch Contract

Extend `ScorePatch` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

```ts
export type ScorePatch =
  | { type: 'updateTimeState'; patch: Partial<ScoreTimeStateSnapshot> }
  | {
      type: 'updateSharedProperties';
      target: ScoreObjectEditorTargetSnapshot;
      patch: {
        name?: string;
        backgroundColor?: number;
        startTime?: { value: number; timeBase: string };
        subjectiveDuration?: { value: number; timeBase: string };
      };
    }
  | {
      type: 'updateSoundObjectBehavior';
      target: ScoreObjectEditorTargetSnapshot;
      patch: {
        timeBehavior?: string;
        repeatPoint?: { value: number; timeBase: string } | null;
      };
    }
  | {
      type: 'replaceNoteProcessorChain';
      target: ScoreObjectEditorTargetSnapshot;
      chain: NoteProcessorChainSnapshot | null;
    }
  | {
      type: 'updateTypeSpecificEditor';
      target: ScoreObjectEditorTargetSnapshot;
      patch: Record<string, unknown>;
    };
```

Requirements:

- The renderer continues to use `ProjectDocumentPatch.score` for writes so the score shell and auxiliary panels share one canonical mutation path.
- Shared helpers must validate time values, behavior values, note-processor payloads, and family-specific editor patches before mutating canonical objects.
- Removed or no-longer-resolvable targets must fail gracefully and trigger fallback document refresh instead of corrupting the score.

## `@blue/data` Library Identity Contract

Extend `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`.

Representative helper surface:

```ts
class SoundObjectLibrary {
  getEntries(): Array<{ libraryId: string; object: SoundObject }>;
  getObjectById(id: string): SoundObject | undefined;
  findIdForObject(object: SoundObject): string | null;
  containsObject(object: SoundObject): boolean;
}
```

Requirements:

- Stable library IDs must round-trip through existing XML object reference IDs.
- The library identity helpers must remain data-layer only and introduce no renderer or Node dependencies.
- `Instance.libraryId` resolution should use the same canonical identity source as these helpers.

## Renderer Panel Contract

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`.

- `SoundObjectPropertiesTopComponent` must render a dedicated `ScoreObjectPropertiesPanel` surface.
- `ScoreObjectEditorTopComponent` must render a dedicated `ScoreObjectEditorPanel` surface.
- Both panels consume `useScoreSelectionStore(...)`, the current score shell snapshot, and the on-demand `getScoreObjectEditorDocument(...)` bridge.

Expected renderer composition:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectPropertiesPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/useScoreObjectEditorDocument.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/ScoreObjectPropertiesForm.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editor-registry.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/`

## Registry Contract

The renderer registry should mirror Java's plugin routing without dynamic loading.

```ts
export interface ScoreObjectEditorDefinition {
  objectType: string;
  editorFamily:
    | 'code'
    | 'audioClip'
    | 'file'
    | 'structured'
    | 'fallback';
  component: React.ComponentType<{ document: ScoreObjectEditorDocumentSnapshot }>;
}
```

Requirements:

- Registry lookup must use the resolved `editorObjectType`, not the raw selected type alone.
- Multiple supported types may intentionally share one family editor component.
- Unknown types must resolve to the fallback editor definition.

## Validation Rules

- No selection, multi-selection, unsupported selection, and removed-target states must render a deliberate empty or fallback view in both auxiliary panels.
- `Instance` and library-backed objects must show library-context messaging while editing the underlying canonical target.
- User-facing titles and copy introduced by this slice should prefer `Score Object` wording even though the legacy panel IDs remain `SoundObjectPropertiesTopComponent` and `ScoreObjectEditorTopComponent`.
- The renderer must never hold canonical `@blue/data` object instances directly; all editing continues through typed snapshots and canonical patch helpers.