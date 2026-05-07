# Research: Score Object Editor Tier 1 Parity

## Decision: Keep Tier 1 work inside the Spec 037 document-loading model

**Rationale**: `External`, `PolyObject`, and `TrackerObject` all need richer auxiliary payloads, but none justify a second editor-loading architecture. The right extension point is the existing `ScoreObjectEditorDocumentSnapshot` flow introduced in Spec 037.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/contracts/score-object-editor-surfaces.md`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`

**Alternatives considered**:

- Add separate IPC or renderer-local state just for Tier 1 editors: rejected because it would fork the auxiliary editor model for no good reason.

## Decision: Promote External from a generic code family to an augmented code-backed editor

**Rationale**: `External` already fits the code-backed family, but Java Blue exposes important metadata beyond the score text. The right parity move is to preserve the existing code shell while adding `commandLine`, syntax-type, and supported test metadata.

**Sources Reviewed**:

- Java Blue `ExternalEditor` reference sources
- `/Users/stevenyi/work/blue-electron/REMAINING_SOBJ_EDITORS.md`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/external.ts`

## Decision: Treat PolyObject as an inspector-style auxiliary editor, not a second full score shell

**Rationale**: Spec 036 already delivered nested score-path navigation. The auxiliary `PolyObject` editor should complement that shell with a compact child-object browser and generated-score preview rather than duplicating the full score panel.

**Sources Reviewed**:

- Java Blue `PolyObjectEditor` references
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/useScorePathState.ts`

## Decision: Upgrade TrackerObject in place instead of replacing it

**Rationale**: The current `TrackerObject` editor already has basic table editing, so the missing parity is concentrated in layout, toolbar controls, and track headers. This is an incremental upgrade, not a rewrite.

**Sources Reviewed**:

- Java Blue `TrackerEditor` references
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/tracker-object.ts`
- `/Users/stevenyi/work/blue-electron/REMAINING_SOBJ_EDITORS.md`

## Decision: Keep score-management/navigation out of Tier 1

**Rationale**: The point of this spec is to finish the moderate remaining score-object editors before moving on to broader score-management/navigation work. The later management/navigation spec should stay separate so the editor backlog gets resolved first.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/STATUS.md`
- `/Users/stevenyi/work/blue-electron/REMAINING_SOBJ_EDITORS.md`