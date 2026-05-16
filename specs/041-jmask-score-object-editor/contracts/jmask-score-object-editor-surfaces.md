# Contract: JMask Score Object Editor Surfaces

## Editor Document Payload

The shipped `JMask` editor remains a `structured` `TypeSpecificScoreObjectEditorSnapshot`, with a dedicated `JMaskEditorPayload` inside `payload`:

```ts
interface JMaskEditorSnapshot {
  kind: 'structured';
  editorFamily: 'JMask';
  payloadSummary: string;
  payload: JMaskEditorPayload;
}

interface JMaskEditorPayload extends Record<string, unknown> {
  seedUsed: boolean;
  seed: number;
  field: JMaskFieldSnapshot;
}

interface JMaskFieldSnapshot {
  kind: 'Field';
  parameters: JMaskParameterSnapshot[];
}

interface JMaskParameterSnapshot {
  kind: 'Parameter';
  visible: boolean;
  name: string;
  generator: JMaskGeneratorSnapshot;
  mask: JMaskMaskSnapshot | null;
  quantizer: JMaskQuantizerSnapshot | null;
  accumulator: JMaskAccumulatorSnapshot | null;
}
```

The renderer derives these Java-style surfaces from `field`:

- top-bar visibility popup from `field.parameters[*].visible` and `name`
- protected first-three-row removal state from parameter index
- row labels from `p{index + 1}` plus `name`
- generator sub-editors from `generator.kind`
- modifier availability from the Java marker-interface mapping mirrored in TypeScript
- probability and table editors from nested generator/modifier snapshots
- generated-score preview from rebuilding a temporary `JMask` with `loadFieldFromSnapshot()`

## Generator And Section Payloads

Supported generator families match Java `GeneratorRegistry` order:

```ts
type JMaskGeneratorKind =
  | 'Constant'
  | 'ItemList'
  | 'Segment'
  | 'Random'
  | 'Probability'
  | 'Oscillator';
```

Supported probability subtype order matches Java `Probability`:

```ts
type JMaskProbabilityKind =
  | 'Uniform'
  | 'Linear'
  | 'Triangle'
  | 'Exponential'
  | 'Gaussian'
  | 'Cauchy'
  | 'Beta'
  | 'Weibull';
```

All generator, modifier, probability, and table payloads preserve the Java-backed field names used by `@blue/data` (`value`, `min`, `max`, `table`, `listType`, `listItems`, `selectedIndex`, `generators`, `highTable`, `gridSizeTable`, etc.). Snapshot objects include a `kind` field so canonical patches can rebuild live `@blue/data` instances.

## Canonical Patch Surface

`ProjectDocumentPatch.score.updateTypeSpecificEditor.patch` for `JMask` supports this final shape:

```ts
type JMaskTypeSpecificPatch = Partial<{
  seedUsed: boolean;
  seed: number;
  field: Partial<JMaskFieldSnapshot>;
}>;
```

Renderer interactions currently commit the changed `field` snapshot path rather than separate normalized operations. This applies to:

- parameter add before/after
- protected-row-aware removal
- push up/down
- change generator type
- double-click rename
- visibility toggle
- generator field update
- mask/quantizer/accumulator toggle and value update
- probability subtype selection and nested value update
- table point insert, drag, removal, interpolation, and min/max edits

## Local State Boundaries

Expanded rows, active popup state, selected table point, hover state, in-progress table drag, generated-score modal visibility, and focused rename input are renderer-local.

## Preservation And Preview Rules

- `applyJMaskPatchToPayload()` handles optimistic renderer document updates.
- Canonical application merges a field patch with the current payload and rebuilds a live `Field` through `loadFieldFromSnapshot()`.
- Unsupported or not-yet-specialized nested fields are preserved through the field snapshot rather than dropped.
- Preview is read-only: the renderer creates a temporary `JMask`, applies the payload seed and field, sets the selected object duration, and displays generated score text in a modal.
