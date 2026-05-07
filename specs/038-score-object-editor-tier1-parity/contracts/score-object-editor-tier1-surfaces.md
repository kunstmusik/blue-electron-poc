# Contract: Score Object Editor Tier 1 Surfaces

## Scope

This contract extends the Spec 037 score-object editor surface for the Tier 1 remaining editors: `External`, `PolyObject`, and `TrackerObject`.

## Type-Specific Editor Payload Extensions

Extend the shared type-specific editor union in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

Representative payloads:

```ts
type TypeSpecificScoreObjectEditorSnapshot =
  | {
      kind: 'external';
      targetId: string;
      scoreText: string;
      commandLine: string;
      syntaxType: string;
      canTest: boolean;
      testMessage?: string;
    }
  | {
      kind: 'polyObject';
      targetId: string;
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
      targetId: string;
      showNoteNames: boolean;
      octave: number;
      tracks: Array<{
        trackId: string;
        trackName: string;
        instrumentName?: string;
        columnCount: number;
      }>;
      rows: Array<Record<string, string | number | null>>;
      canTest: boolean;
    };
```

Requirements:

- `External` must no longer be represented as generic `kind: 'code'` only.
- `PolyObject` must no longer be represented as a generic structured placeholder.
- `TrackerObject` must carry enough toolbar/header metadata to render the missing Java-style controls.

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
      showNoteNames?: boolean;
      octave?: number;
      cellChanges?: Array<{ trackId: string; rowIndex: number; columnId: string; value: string | number | null }>;
    };
```

Requirements:

- `PolyObject` inspector actions may remain read-only except for supported open/test actions.
- `External` and `TrackerObject` edits must round-trip through canonical objects and refresh the active document.
- Unsupported preview/test backends must return explicit capability metadata rather than hidden controls.

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