# Research: Sound Score Object Editor Parity

## Decision: Mirror Java Blue's top-level Interface, Automation, and Comments tabs

**Rationale**: Java Blue `SoundEditor` is organized around a tabbed editor shell. Treating `Sound` as a plain text editor or collapsing those surfaces into one panel would flatten the core workflow that composers expect.

**Sources Reviewed**:

- Java Blue `blue-ui-core/src/main/java/blue/soundObject/editor/SoundEditor.java`
- Current TypeScript `packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/SoundEditor.tsx`

## Decision: Reuse the existing BSB interface editor work instead of building a second widget stack

**Rationale**: The highest-value `Sound` UI reuse is the BSB interface infrastructure already delivered for orchestra and BSB editing. Reusing that work reduces risk and keeps widget behavior consistent across the app.

**Sources Reviewed**:

- `packages/blue-app/src/renderer/components/workbench/panels/orchestra/BlueSynthBuilderEditor.tsx`
- `packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/`
- Java Blue BSB integration inside `SoundEditor`

## Decision: Keep automation editing inside the `Sound` spec rather than pushing it to the shell-management slice

**Rationale**: Java Blue treats automation as a child workflow of `SoundEditor`, not as a shell-level navigation surface. The grouped Tier 2 draft was too shallow here; the replacement spec needs explicit automation analysis and tasking.

**Sources Reviewed**:

- Java Blue `blue-ui-core/src/main/java/blue/soundObject/editor/pianoRoll/AutomationPanel.java`
- Java Blue `blue-ui-core/src/main/java/blue/soundObject/editor/TimeBar.java`
- Java Blue line-selector and line-canvas helpers used by `SoundEditor`
- Current TypeScript automation models in `@blue/data` and engine-side automation support

## Decision: Use a scoped renderer modal for the test-preview workflow

**Rationale**: Java Blue exposes a test action from the editor. blue-electron already has a safe pattern for this in the dedicated `External` editor test flow, so `Sound` should follow the same preview model rather than inventing a transport-heavy workflow.

**Sources Reviewed**:

- Java Blue `SoundEditor` test button behavior
- `packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/ExternalScoreObjectEditor.tsx`
- Existing main/preload test-preview IPC seams

## Decision: Keep tab selection local, but keep BSB, automation, and comment edits canonical

**Rationale**: The selected tab is purely editor-shell state. Interface, automation, and comment content must still mutate the canonical `Sound` model through shared score patch plumbing so save or reload behavior stays correct.

**Sources Reviewed**:

- `packages/blue-app/src/shared/project-editor.ts`
- `packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx`
- Existing score-object patch flows from Specs 037 and 038
