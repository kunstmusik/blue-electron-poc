# Research: Blue Data Note Parsing and Note Processor Parity

## Java Blue Source Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/Note.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/utility/ScoreUtilities.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/noteProcessor/NoteProcessorChain.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/noteProcessor/NoteProcessorChainMap.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/noteProcessor/`

## Current TypeScript Source Anchors

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/note.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`

## Decision: Use Java Score Parsing As The Ground Truth

The compatibility report identified multiple musical differences that come from parser semantics, not only processor math.

**Decision**: Treat Java score parsing behavior as the ground truth and validate TypeScript against representative parser fixtures before optimizing or refactoring.

**Rationale**: Parser differences compound downstream processor and render differences and are hard to detect without direct parity tests.

## Decision: Unify Parsing Rather Than Leaving GenericScore Special Cases

Current TypeScript `GenericScore` uses a separate simplified parser path.

**Decision**: Align `GenericScore` with the shared parser contract rather than preserving a bespoke interpretation.

**Rationale**: Divergent parser entry points would keep note behavior inconsistent even after core parser fixes.

## Decision: Restore Processor Semantics In Priority Order

Not every processor is equally risky. Pitch, time, random, subset, and line-based processors materially affect output.

**Decision**: Prioritize the incompatible processors identified in the report and validate each one with fixture-based comparisons to Java behavior.

**Rationale**: This creates an implementable task order and avoids treating all processors as equally urgent.

## Decision: XML Preservation Comes Before Optional Execution Deferrals

Some processor support may require special handling, such as `PythonProcessor`.

**Decision**: If a processor cannot yet execute safely, its XML must still be preserved losslessly until full execution support arrives.

**Rationale**: Compatibility failure from data loss is worse than a documented deferred execution path.
