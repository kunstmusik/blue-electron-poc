# Contract: Score Object Editor Tier 2 Surfaces

## Scope

This contract extends the shared score-object editor surface for the heavyweight remaining editors: `Sound`, `PianoRoll`, and `JMask`.

## Type-Specific Editor Payload Extensions

Extend the type-specific editor union in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` with dedicated payload families.

Representative payloads:

```ts
type TypeSpecificScoreObjectEditorSnapshot =
  | {
      kind: 'sound';
      targetId: string;
      activeTab: 'interface' | 'automation' | 'comment';
      widgetTreeRef?: string;
      automationSummary?: Record<string, unknown>;
      commentText: string;
    }
  | {
      kind: 'pianoRoll';
      targetId: string;
      notes: Array<{
        noteId: string;
        startBeats: number;
        durationBeats: number;
        pitch: number;
        velocity?: number;
      }>;
      snapValue: string;
      viewport: { startBeats: number; endBeats: number; lowestPitch: number; highestPitch: number };
    }
  | {
      kind: 'jMask';
      targetId: string;
      seedEnabled: boolean;
      seedValue: number | null;
      generators: Array<{
        generatorId: string;
        generatorType: string;
        label: string;
        supported: boolean;
        visible: boolean;
        parameters: Array<{ parameterId: string; label: string; valueSummary: string; supported: boolean }>;
      }>;
    };
```

Requirements:

- `Sound`, `PianoRoll`, and `JMask` must no longer use the generic structured fallback payload when parity is claimed.
- Payloads must stay scoped to the active selection and avoid inflating the always-on project snapshot.

## Canonical Patch Requirements

All Tier 2 writes continue through `ScorePatch.updateTypeSpecificEditor`.

Representative patch families:

```ts
type Tier2EditorPatch =
  | { editorKind: 'sound'; activeTab?: string; interfacePatch?: Record<string, unknown>; automationPatch?: Record<string, unknown>; commentText?: string }
  | { editorKind: 'pianoRoll'; noteChanges?: Array<Record<string, unknown>>; viewportPatch?: Record<string, unknown> }
  | { editorKind: 'jMask'; seedEnabled?: boolean; seedValue?: number | null; generatorPatch?: Record<string, unknown> };
```

Requirements:

- Unsupported Tier 2 subfeatures must remain explicit in the payload and patch validation path.
- `Sound` should reuse existing BSB and automation mutation helpers where practical.
- `PianoRoll` and `JMask` must validate edits against canonical models before mutation.

## Renderer Composition

Expected dedicated renderer components:

- `SoundScoreObjectEditor.tsx`
- `PianoRollScoreObjectEditor.tsx`
- `JMaskScoreObjectEditor.tsx`

Requirements:

- The registry remains the entry point for all score-object editors.
- Tier 2 editors may own local canvas/view session state, but canonical data must still flow through shared editor documents and score patches.

## Tests

Add or extend coverage for:

- Tier 2 document payload construction
- renderer routing and UI state for `Sound`, `PianoRoll`, and `JMask`
- canonical mutation flows for supported Tier 2 edits
- removed-target and unsupported-subfeature fallback behavior