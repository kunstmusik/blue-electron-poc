# Research: Blue Data XML Preservation and Root Compatibility

## Java Blue Source Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/BlueData.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/ProjectProperties.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/ScratchPadData.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/MarkersList.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/midi/MidiInputProcessor.java`

## Current TypeScript Source Anchors

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`

## Decision: Root Load Must Be Lossless Before Deeper Parity Work

Current TypeScript root load ignores or drops several Java sections. This makes later model and render parity work unreliable because data is already missing on first load.

**Decision**: Treat root document preservation as the first slice and require every in-scope root section to be fully deserialized or losslessly preserved before later specs depend on it.

**Rationale**: Load/save safety is the constitution-level correctness boundary for `@blue/data`.

**Alternatives considered**:

- Defer preservation until runtime behavior is ported: rejected because it continues silent data loss.
- Preserve only sections currently used by the renderer: rejected because later specs depend on complete input state.

## Decision: Match Java Root Load Ordering

Java loads some root sections in a non-trivial order because arrangement, object references, and library-backed data depend on earlier sections.

**Decision**: Root compatibility work must adopt Java-compatible load ordering instead of treating root sections as independent siblings.

**Rationale**: Compatibility failures caused by load order are harder to detect than missing fields because the XML may appear present while references are broken.

## Decision: Deep Copy Is A Compatibility Primitive

Java render and editing flows rely on a complete copy constructor. Current TypeScript copying is partial.

**Decision**: Bring `BlueData.deepCopy()` to parity as part of this slice rather than leaving it to render work.

**Rationale**: Later CSD render parity depends on copy safety, but copy completeness can be specified and tested at the root model level now.

## Decision: Legacy Migrations Belong In Root Compatibility

Legacy `controlRate`, command-line tags, legacy media-copy aliases, root `timeContext`, and root `udo` handling are compatibility issues rather than optional cleanup.

**Decision**: Include Java legacy root migrations and aliases in this slice.

**Rationale**: If migration is deferred, every older project remains unsafe even if newer XML paths are fixed.
