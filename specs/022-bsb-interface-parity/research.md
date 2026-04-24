# Research: BlueSynthBuilder Interface Parity

## Decision: Model Spec 022 on Java `BlueSynthBuilderEditor` and `BSBInterfaceEditor`

**Rationale**: Spec 021 already matched the high-level BSB tab layout, but Java Blue's real parity surface lives inside `BSBInterfaceEditor`: a split interface editor with a scrollable canvas, property-sheet tabs, grid settings, an edit toggle, and preset controls. Spec 022 should target that editor directly instead of continuing to grow the baseline placeholder.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/editor/BlueSynthBuilderEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBInterfaceEditor.java`

**Alternatives considered**:

- Keep the Spec 021 value-list placeholder and only expand widget numeric editing: rejected because it still would not provide the Java interface-editing workflow.
- Re-scope all remaining BSB work into a larger Orchestra-wide slice: rejected because Spec 021 intentionally closed Orchestra-wide scope and the remaining gap is concentrated in BSB.

## Decision: Keep Spec 021 code-tab behavior intact and extend only the missing BSB surfaces

**Rationale**: The code-editor stability fixes completed during Spec 021 were high-value and regression-prone. Spec 022 should preserve the shipped BSB outer-tab and inner-code-tab behavior while extending the Interface and UDO surfaces, not re-open the stable code path unnecessarily.

**Alternatives considered**:

- Rebuild the whole BSB editor from scratch: rejected because it would risk regressions in the already-stable code editors and completion flow.

## Decision: Expand the snapshot/patch contract to hierarchical BSB interface and preset data

**Rationale**: Spec 021's flat `objectNames` and `widgets` snapshot is enough for code completion and simple numeric value editing, but not enough for widget selection, group navigation, property editing, grid settings, or preset application. Spec 022 needs richer serializable BSB state that still flows through the existing project snapshot/patch architecture.

**Implications**:

- `BlueSynthBuilderInstrumentSnapshot` should grow beyond flat widget summaries.
- Widget identities, hierarchy, edit-enabled state, grid settings, and preset metadata must be represented explicitly.
- Renderer actions should remain patch-intent based rather than mutating class instances directly.

**Alternatives considered**:

- Instantiate `@blue/data` BSB model objects directly in the renderer: rejected because it breaks the established main-process canonical document pattern.
- Add a separate BSB-only IPC channel: deferred unless the shared project patch contract becomes too awkward after design.

## Decision: Replace the BSB UDO placeholder with EmbeddedOpcodeList-style editing in this slice

**Rationale**: Java Blue wires `EmbeddedOpcodeListPanel` directly into `BlueSynthBuilderEditor`. The current placeholder is acceptable only as a bridge from Spec 021. Embedded opcode editing is still local to the BSB instrument and stays within the bounded BSB parity scope.

**Source Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/udo/EmbeddedOpcodeListPanel.java`

**Alternatives considered**:

- Keep the placeholder and push embedded UDO editing to a later generic UDO slice: rejected because the Java BSB editor treats this as part of the core BSB workflow.

## Decision: Port and preserve preset groups before attempting deeper preset authoring UI

**Rationale**: Java `BlueSynthBuilderEditor` loads a `PresetGroup` into the interface editor immediately. Existing preset data must survive round-trip and users need to be able to apply existing presets for parity with real projects. Full preset-authoring scope can remain negotiable during task generation if the UI turns out to be larger than preset application/preservation.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/blueSynthBuilder/PresetGroup.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBInterfaceEditor.java`

**Alternatives considered**:

- Ignore preset data and treat it as unsupported: rejected because preset state is part of Java BSB compatibility.
- Attempt full preset-management parity immediately without first defining a preservation path: rejected as too risky; data compatibility must land before deeper UI.

## Decision: Preserve unsupported widget and preset structures with a hybrid editable/preserved strategy

**Rationale**: The current TypeScript port already preserves more BSB XML than it fully edits. Spec 022 should keep that posture: offer first-class editing for the currently ported widget classes, but preserve unsupported widget or preset content instead of dropping or flattening it.

**Alternatives considered**:

- Block loading unsupported widgets until the full Java widget set is ported: rejected because it would make real BSB-heavy projects unusable.
- Silently omit unsupported structures from saved XML: rejected because it violates the constitution's backwards-compatible serialization rule.