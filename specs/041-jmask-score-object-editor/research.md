# Research: JMask Score Object Editor Parity

## Decision: Mirror Java Blue's scrollable parameter-editor stack instead of extending the current seed form

**Rationale**: Java Blue `JMaskEditor` is fundamentally a parameter-list workflow composed from multiple nested editors. The current TypeScript seed controls do not meaningfully represent that UX.

**Sources Reviewed**:

- Java Blue `blue-ui-core/src/main/java/blue/soundObject/editor/jmask/JMaskEditor.java`
- Java Blue `EditorListPanel.java`
- Java Blue `JMaskEditorLayout.java`
- Current TypeScript `packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/JMaskEditor.tsx`

## Decision: Keep generator selection and optional sub-editors as explicit planning work

**Rationale**: The grouped Tier 2 draft was too shallow because it hid the Java generator and optional-section hierarchy behind one implementation task. The split spec needs explicit tasks for the factory pattern and nested editors.

**Sources Reviewed**:

- Java Blue `ParameterEditor.java`
- Java Blue `GeneratorEditorFactory.java`
- Java Blue mask, quantizer, and accumulator editor classes used by `JMask`

## Decision: Catalog probability and table-driven editors before claiming parity

**Rationale**: Java Blue supports multiple probability distributions and table-driven editors. These are meaningful parity surfaces, but they should be claimed only after the supported subset is documented clearly.

**Sources Reviewed**:

- Java Blue `ProbabilityEditor.java`
- Java Blue probability distribution editors and related classes
- Java Blue `TableCanvas.java`

## Decision: Preserve unsupported nested data explicitly

**Rationale**: `JMask` is structurally rich. If the TypeScript surface cannot edit a nested generator or probability form yet, the editor must still preserve the data and tell the user what is deferred.

**Sources Reviewed**:

- `packages/blue-app/src/shared/project-editor.ts`
- Existing unsupported-editor messaging patterns from Spec 037
- Java XML-backed `JMask` model behavior in blue-core

## Decision: Keep test and preview work scoped to the selected `JMask` target

**Rationale**: Any test or preview behavior claimed by this slice must stay tied to the selected score-object target and reuse existing editor-side modal patterns where practical.

**Sources Reviewed**:

- Java Blue `JMaskEditor` top-bar workflow
- Existing editor-side preview patterns in blue-electron
- Current score-object editor shell and removed-target fallback behavior
