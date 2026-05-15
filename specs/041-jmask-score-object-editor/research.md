# Research: JMask Score Object Editor Parity

## Decision: Treat Spec 041 as both a model-port and editor-parity slice

**Rationale**: The current TypeScript `JMask` only preserves `seedUsed` and `seed`; `generateForCSD()` is a stub and the nested `Field` or `Parameter` subsystem has not been ported yet. Honest editor parity requires the model layer before the renderer can represent or mutate the Java structure safely.

**Sources Reviewed**:

- Current TypeScript `packages/blue-data/src/sound-objects/j-mask.ts`
- Current TypeScript `packages/blue-app/src/shared/project-editor.ts`
- Java Blue `blue-core/src/main/java/blue/soundObject/jmask/Field.java`
- Java Blue `blue-core/src/main/java/blue/soundObject/jmask/Parameter.java`
- Java Blue generator, modifier, table, and probability model classes under `blue-core/src/main/java/blue/soundObject/jmask/`

## Decision: Mirror Java Blue's top bar plus scrollable parameter-editor stack instead of extending the current seed form

**Rationale**: Java Blue `JMaskEditor` is fundamentally a two-part surface: a top bar with title, visibility popup, seed controls, and test entry point, plus a scrollable `EditorListPanel` of full-width `ParameterEditor` rows. The current TypeScript seed controls do not meaningfully represent that UX.

**Sources Reviewed**:

- Java Blue `blue-ui-core/src/main/java/blue/soundObject/editor/JMaskEditor.java`
- Java Blue `EditorListPanel.java`
- Java Blue `JMaskEditorLayout.java`
- Java Blue `ParameterEditor.java`
- Current TypeScript `packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/JMaskEditor.tsx`

## Decision: Preserve Java row interactions explicitly, including menu actions and protected-row behavior

**Rationale**: Java Blue relies on parameter-row interactions that are easy to miss in a shallow task list: right-click row menus for add before or after, remove, change type, push up or down, and section toggles; double-click label rename; top-bar visibility toggles; protected removal rules for the first three parameters; and `Ctrl/Cmd+T` test preview.

**Sources Reviewed**:

- Java Blue `JMaskEditor.java`
- Java Blue `ParameterEditor.java`
- Java Blue `EditorListPanel.java`

## Decision: Break generator work down by the real Java registry order and nested probability families

**Rationale**: The grouped Tier 2 draft was too shallow because it hid the Java generator hierarchy behind one implementation task. The split spec needs explicit tasks for the six generator families from `GeneratorRegistry` plus the probability subtype handling in `ProbabilityEditor` and `ProbabilityEditorFactory`.

**Sources Reviewed**:

- Java Blue `GeneratorRegistry.java`
- Java Blue `ParameterEditor.java`
- Java Blue `GeneratorEditorFactory.java`
- Java Blue `ProbabilityEditor.java`
- Java Blue `ProbabilityEditorFactory.java`
- Java probability model classes under `blue-core/src/main/java/blue/soundObject/jmask/probability/`

## Decision: Treat mask, quantizer, accumulator, and table-driven editing as first-class parity surfaces

**Rationale**: Java Blue does not treat optional sections as incidental extras. `MaskEditor`, `QuantizerEditor`, and `AccumulatorEditor` are stacked inline under the generator editor, and `TableCanvas` has concrete interaction rules for hover selection, insert, drag, alt-insert-on-line, and right-click removal of non-endpoints. These behaviors need either direct parity work or explicit deferral.

**Sources Reviewed**:

- Java Blue `MaskEditor.java`
- Java Blue `QuantizerEditor.java`
- Java Blue `AccumulatorEditor.java`
- Java Blue `TableCanvas.java`
- Java Blue `OscillatorEditor.java`
- Java Blue `SegmentEditor.java`
- Java Blue probability distribution editors and related classes

## Decision: Propagate duration into all duration-sensitive sub-editors

**Rationale**: `EditorListPanel` listens for `JMask` duration changes and pushes the current subjective duration into every open `ParameterEditor`, which then forwards it to the generator and enabled modifier editors through `DurationSettable`. This is part of the Java behavior for tables and probability sub-editors and cannot be omitted silently.

**Sources Reviewed**:

- Java Blue `EditorListPanel.java`
- Java Blue `ParameterEditor.java`
- Java Blue generator, probability, and modifier editors implementing `DurationSettable`

## Decision: Preserve unsupported nested data explicitly and keep preview claims honest

**Rationale**: `JMask` is structurally rich. If the TypeScript surface cannot edit a nested generator, probability form, or table interaction yet, the editor must still preserve the data and tell the user what is deferred. The preview or test flow should only be claimed once the `@blue/data` field subsystem can actually generate notes; otherwise the top bar should surface a deliberate deferred state.

**Sources Reviewed**:

- `packages/blue-app/src/shared/project-editor.ts`
- `packages/blue-data/src/sound-objects/j-mask.ts`
- Existing unsupported-editor messaging patterns from Spec 037
- Java XML-backed `JMask` model behavior in blue-core
