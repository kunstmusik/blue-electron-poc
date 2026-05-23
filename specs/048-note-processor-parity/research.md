# Research: Note Processor Parity

## Decision: Scope PythonProcessor as preservation-only

**Rationale**: PythonProcessor depends on Jython/Python runtime behavior that belongs with a broader Python/Jython parity effort. Implementing it here would mix note-processor UI/render parity with runtime integration and risk an incomplete emulation.

**Alternatives considered**:

- Implement Jython execution now: rejected because it expands the slice beyond note-processor chain parity.
- Drop PythonProcessor data: rejected because Java project compatibility requires lossless XML preservation.
- Treat PythonProcessor as a normal unsupported processor with no user-facing distinction: rejected because users need to understand it is intentionally deferred.

## Decision: Treat the in-scope processor catalog as the 16 non-Python Java plugin processors

**Rationale**: Java Blue exposes note processors through `@NoteProcessorPlugin`. The non-Python catalog is implementable in pure TypeScript and already has partial model coverage. Java `Code` is a helper value object, not an addable processor.

**Alternatives considered**:

- Include every class in `blue.noteProcessor`: rejected because `Code` and `ValueTimeMapper` are helpers rather than processors.
- Keep the current TypeScript `Code` processor: rejected because it creates XML and UI options that Java Blue does not expose.

## Decision: Centralize processor metadata and reification in the data package

**Rationale**: The renderer needs processor names, editable fields, default constructors, XML summaries, and replacement snapshots, but canonical behavior must remain in `@blue/data`. A shared catalog avoids duplicate UI-only definitions and makes tests cover the same metadata used by the app.

**Alternatives considered**:

- Hard-code processor forms in React only: rejected because patches would still need model reification and could drift from serialization.
- Use raw XML text editing: rejected because Java Blue exposes typed property editing and the project already has typed processors.

## Decision: Use a shared chain target contract for score object, layer, layer group, and root chains

**Rationale**: Existing object patches only handle selected score-object chains and cannot address sound-object layers, layer groups, or root score chains. A target union keeps one editor reusable across all scopes and makes patch validation explicit.

**Alternatives considered**:

- Add separate patch types for each scope: acceptable but more repetitive. A discriminated target keeps the contract smaller while still allowing scope-specific resolution.
- Edit layer/group/root chains only in renderer state: rejected because canonical `BlueData` must remain the source of truth.

## Decision: Apply root score chain after layer groups are merged

**Rationale**: Java `Score.generateForCSD()` applies `ScoreUtilities.applyNoteProcessorChain(noteList, this.npc)` after collecting all layer group notes. The TypeScript score model already loads/saves root chains but currently returns merged notes before applying the root chain.

**Alternatives considered**:

- Leave root chains serialization-only: rejected because Java Blue root chains affect generated output.
- Apply root chain before layer groups: rejected because it would not match Java scope order.

## Decision: Build one reusable chain editor surface

**Rationale**: Java Blue uses one `NoteProcessorChainEditor` in both properties and modal dialog contexts. A reusable React editor can be embedded or placed in a dialog for objects, layers, groups, and root without duplicating add/remove/reorder/property/named-chain behavior.

**Alternatives considered**:

- Implement object editor first and defer broader scopes: rejected because the user explicitly asked for layers, layer groups, and root in this parity slice.
- Use separate editors per scope: rejected because behavior must stay identical and tests would multiply without value.

## Decision: Test using both per-processor and per-scope matrices

**Rationale**: Existing coverage only proves basic chain persistence and some object presence. Parity requires proving each in-scope processor works directly and through all owning scopes.

**Alternatives considered**:

- Test only representative processors through scopes: rejected because the user explicitly requested each processor's processing on objects, layers, layer groups, and root.
- Rely on UI tests for processing: rejected because data-layer semantics should be independently verifiable.
