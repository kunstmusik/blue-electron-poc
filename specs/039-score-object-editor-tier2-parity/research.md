# Research: Score Object Editor Tier 2 Parity

## Decision: Isolate the heavyweight remaining editors in their own planning slice

**Rationale**: `Sound`, `PianoRoll`, and `JMask` each need a substantially richer editor than the Tier 1 follow-up. Grouping them into the dedicated Tier 2 plan keeps the management/navigation follow-up from being blocked on editor parity and makes the remaining score-object backlog explicit.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/REMAINING_SOBJ_EDITORS.md`
- `/Users/stevenyi/work/blue-electron/STATUS.md`

## Decision: Reuse prior BSB and automation work for Sound instead of inventing a parallel Sound editor stack

**Rationale**: The `Sound` editor gap is largely an integration gap. Specs 022 and 023 already introduced BSB-oriented renderer infrastructure that should be reused inside the score-object auxiliary editor surface.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/spec.md`

## Decision: Treat PianoRoll as a dedicated canvas editor, not a form expansion

**Rationale**: The existing `PianoRoll` fields are nowhere near the Java editing surface. Real parity requires a note canvas with view state, interaction state, and ruler context, so this editor deserves its own payload family and renderer component.

**Sources Reviewed**:

- Java Blue `PianoRollEditor` references
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/piano-roll.ts`

## Decision: Keep JMask generator support explicit and incremental

**Rationale**: `JMask` has many generator families and parameters. The right parity approach is to introduce a deliberate typed generator-parameter surface that can preserve unsupported or still-thin cases rather than pretending the whole Java editor can be cloned immediately.

**Sources Reviewed**:

- Java Blue `JMaskEditor` references
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/j-mask.ts`

## Decision: Keep score-management/navigation in the later follow-up spec

**Rationale**: The purpose of the reprioritization is to schedule the remaining score-object editors first. The later management/navigation spec should therefore assume Tier 2 editor planning already exists.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/STATUS.md`