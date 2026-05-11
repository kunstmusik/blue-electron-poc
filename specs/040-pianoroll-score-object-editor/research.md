# Research: PianoRoll Score Object Editor Parity

## Decision: Treat `PianoRoll` as a dedicated canvas editor, not as a form-based structured editor

**Rationale**: Java Blue `PianoRollEditor` is built around a note canvas, ruler, pitch labels, and multiple mouse modes. The current TypeScript form is only a placeholder and does not represent the real workflow.

**Sources Reviewed**:

- Java Blue `blue-ui-core/src/main/java/blue/soundObject/editor/PianoRollEditor.java`
- Java Blue `PianoRollCanvas.java` and `PianoRollCanvasHeader.java`
- Current TypeScript `packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/PianoRollEditor.tsx`

## Decision: Split the work explicitly among canvas, field-editor, and properties surfaces

**Rationale**: Java Blue does not treat note editing, field editing, and property configuration as one undifferentiated form. The grouped Tier 2 draft was too shallow because it hid that split behind a single implementation task.

**Sources Reviewed**:

- Java Blue `FieldEditor.java`
- Java Blue `FieldEditorMouseListener.java`
- Java Blue `PianoRollPropertiesEditor.java`
- Java Blue `ScaleSelectionPanel.java`
- Java Blue `PianoRollRulerConfigDialog.java`

## Decision: Reuse score-shell interaction lessons selectively, not wholesale

**Rationale**: Spec 036 already solved snapping, selection, drag, and ruler behavior in the score shell. Those patterns are useful, but `PianoRoll` still needs its own dedicated canvas semantics and patch boundaries.

**Sources Reviewed**:

- `packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`
- Spec 036 closeout notes in `STATUS.md`
- Java Blue `NoteCanvasMouseListener.java`

## Decision: Document clipboard and undo behavior before claiming it

**Rationale**: Java Blue `PianoRoll` includes clipboard and undo-oriented behavior through dedicated helpers. This should be an explicit planning task rather than an implicit promise.

**Sources Reviewed**:

- Java Blue `NoteCopyBuffer.java`
- Java Blue popup-menu and action classes used by `PianoRoll`
- Existing renderer shortcut patterns in blue-electron

## Decision: Keep canonical writes batch-oriented

**Rationale**: Mouse-driven canvas edits can generate large interaction volumes. The TypeScript port should commit canonical changes at deliberate interaction boundaries rather than on every pointer move.

**Sources Reviewed**:

- Spec 038 `moveScoreObjects` canonical-flush pattern
- `packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx`
- `packages/blue-app/src/shared/project-editor.ts`
