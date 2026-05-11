# Contract: Score Object Editor Tier 1 Surfaces

## Scope

This contract extends the Spec 037 score-object editor surface for the Tier 1 remaining editors: `External`, `PolyObject`, and `TrackerObject`.

## Type-Specific Editor Payload Extensions

Extend the shared type-specific editor union in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

Representative payloads:

```ts
type TrackerColumnSnapshot = {
  name: string;
  type: number;
  restrictedToInteger: boolean;
  usingRange: boolean;
  rangeMin: number;
  rangeMax: number;
  outputFrequency: boolean;
  scale: MidiScaleSnapshot | null;
  sourceIndex?: number | null;
};

type TypeSpecificScoreObjectEditorSnapshot =
  | {
      kind: 'external';
      target: ScoreObjectEditorTargetSnapshot;
      scoreText: string;
      commandLine: string;
      syntaxType: string;
      canTest: boolean;
      testMessage?: string;
    }
  | {
      kind: 'polyObject';
      target: ScoreObjectEditorTargetSnapshot;
      children: Array<{
        objectId: string;
        name: string;
        objectType: string;
        startBeats: number;
        durationBeats: number;
        layerLabel: string;
      }>;
      generatedScoreText: string;
      canOpenInScore: boolean;
      canTest: boolean;
    }
  | {
      kind: 'tracker';
      target: ScoreObjectEditorTargetSnapshot;
      steps: number;
      stepsPerBeat: number;
      showNoteNames: boolean;
      octave: number;
      tracks: Array<{
        trackId: string;
        trackName: string;
        instrumentId: string;
        noteTemplate: string;
        columns: TrackerColumnSnapshot[];
      }>;
      rows: Array<Record<string, string | number | null>>;
      canTest: boolean;
    };
```

Requirements:

- `External` must no longer be represented as generic `kind: 'code'` only.
- `PolyObject` must no longer be represented as a generic structured placeholder.
- `TrackerObject` must carry enough toolbar/header metadata to render the missing Java-style controls.
- `TrackerObject` row data must distinguish status cells from tracker data cells using `track-{n}-status` and `track-{n}-col-{m}` keys.
- `PolyObject` preview rendering may remain conditional on non-empty `generatedScoreText` in the editor document.

## Canonical Patch Requirements

`ScorePatch.updateTypeSpecificEditor` remains the write channel for all Tier 1 editors.

Representative patch shapes:

```ts
type Tier1EditorPatch =
  | {
      editorKind: 'external';
      scoreText?: string;
      commandLine?: string;
      syntaxType?: string;
    }
  | {
      editorKind: 'tracker';
      steps?: number;
      stepsPerBeat?: number;
      showNoteNames?: boolean;
      octave?: number;
      addTrack?: true;
      duplicateTrack?: number;
      clearTrack?: number;
      removeTrack?: number;
      updateTrackCell?: {
        trackIndex: number;
        columnIndex: number;
        stepIndex: number;
        value: string;
      };
      updateTrackProperties?: {
        trackIndex: number;
        name: string;
        instrumentId: string;
        noteTemplate: string;
        columns?: TrackerColumnSnapshot[];
      };
      trackerAction?: {
        type: string;
        trackIndex: number;
        stepIndex: number;
        columnIndex: number;
        noteBuffer?: Array<Array<{ tied: boolean; off: boolean; fields: string[] }>>;
      };
    };
```

Requirements:

- `PolyObject` inspector actions may remain read-only except for supported open/test actions.
- `External` and `TrackerObject` edits must round-trip through canonical objects and refresh the active document.
- Unsupported preview/test backends must return explicit capability metadata rather than hidden controls.
- Tracker edits must remain on the existing `ScorePatch.updateTypeSpecificEditor` channel; no separate tracker-specific IPC is allowed.

## Renderer Composition

Expected renderer additions under `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/`:

- `ExternalScoreObjectEditor.tsx`
- `PolyObjectScoreObjectEditor.tsx`
- `TrackerScoreObjectEditor.tsx`

Requirements:

- The top-level `ScoreObjectEditorPanel` and registry stay unchanged structurally; only the Tier 1 definitions and editor components are added.
- `PolyObject` open-in-score actions should reuse existing score-path navigation instead of duplicating score-shell logic.

## Tests

Add or extend renderer and contract tests for:

- `External` document payloads and patch handling
- `PolyObject` child-list and preview rendering
- `TrackerObject` toolbar and grid rendering
- removed-target fallback refresh for all Tier 1 editors