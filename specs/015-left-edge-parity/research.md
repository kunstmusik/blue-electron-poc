# Research Notes: Left Edge Parity

## Scope

Planning-phase research baseline for feature `015-left-edge-parity`. This slice extends the implemented spec 014 auxiliary parity behavior so the left edge works for user-driven workspace customization without changing the default Java-aligned seeded layout.

## Inputs

- Spec 015 feature definition in `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/spec.md`
- The implemented spec 014 workbench shell and auxiliary state model in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
- Java Blue window registrations and mode references under:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/target/classes/blue/ui/core/layer.xml`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/library/SoundObjectLibraryTopComponent.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/MarkersTopComponent.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager/src/main/java/blue/ui/filemanager/BlueFileManagerTopComponent.java`
- Installed `dockview` / `dockview-core` 5.2.0 type definitions under `/Users/stevenyi/work/blue-electron/node_modules/.pnpm`

## Current Baseline

Spec 014 already proved the left edge is structurally available in the shell:

- `AuxiliaryEdge` already includes `left`, `right`, and `bottom`
- the shell already renders left-edge rails and left-edge slide-outs
- the persisted auxiliary layout already tracks per-group `edge` state at runtime

However, the current implementation is still functionally right/bottom-biased:

- the seeded group definitions still hard-code `properties-main` to `right` and `output-main` to `bottom`
- normalization currently restores those seeded edges, so custom left-edge moves do not persist
- the current model only supports two fixed auxiliary groups and cannot represent a single tool moving away from its siblings without breaking identity
- there is no explicit move-to-edge affordance in the auxiliary header or slide-out chrome

That makes the left-edge gap a state-model and behavior gap, not a shell-layout gap.

## Java Baseline

### Decision 1: Keep zero default left-edge tools

**Decision**: Fresh and reset layouts continue to seed no left-edge tools by default.

**Rationale**:

- The Java artifacts inspected so far prove logical modes such as `properties` and `output`, but they do not prove a default left-edge placement.
- The user explicitly asked not to place components on the left by default unless the Java reference proves that behavior exists.
- Preserving the existing right/bottom seeded defaults avoids redefining the baseline workspace while still allowing user customization.

**Alternatives considered**:

- Seed a browser-style tool such as `SoundObjectLibraryTopComponent` on the left edge by default: rejected because current Java evidence does not justify it.
- Leave left-edge behavior unsupported until a default Java left placement is found: rejected because the user wants left-edge capability even without left-edge defaults.

### Decision 2: Separate seeded defaults from current edge placement

**Decision**: Store default seeded placement in the static definition layer and current edge placement in persisted runtime group instances.

**Rationale**:

- The current spec 014 normalization logic effectively snaps sessions back to the static definition edge, which prevents saved left-edge placements from surviving restore.
- The feature requires both truths to exist at once:
  - what the app seeds on a fresh/reset layout
  - where the user last moved a tool or group
- Keeping those two concerns separate allows reset to remain Java-aligned while saved custom layouts remain user-aligned.

**Alternatives considered**:

- Reuse the current fixed-group model and simply allow `edge` edits in place: rejected because the model still assumes only two durable groups and does not solve single-tool moves.
- Make the definition edge mutable and treat the latest user move as the new default: rejected because reset/default behavior would stop being Java-aligned.

### Decision 3: Represent single-tool moves as derived singleton groups

**Decision**: When a user moves one tool out of a multi-tool seeded group, create a derived singleton auxiliary group instance for that tool.

**Rationale**:

- The spec explicitly covers moving a single tool while siblings remain on another edge.
- The current fixed-group design cannot express this without duplicating the panel or losing the original sibling group.
- A derived singleton group preserves the canonical panel ID, gives the tool its own minimize/slide-out/restore behavior, and keeps the remaining seeded group intact.

**Alternatives considered**:

- Only allow whole-group moves: rejected because it does not satisfy the spec edge case or the user’s “move windows” direction.
- Duplicate a panel so it can appear in two groups: rejected because it violates the stable-ID invariant already established in specs 013 and 014.

### Decision 4: Merge singleton groups back into their seeded group when returning to the same edge

**Decision**: If a derived singleton group is moved back onto the edge of its compatible seeded sibling group, merge it back into that seeded group in definition order.

**Rationale**:

- This provides a clean return path from temporary workspace customization back to the default grouping concept.
- It prevents long-lived fragmentation where every moved tool becomes a permanent standalone group even after returning to its original edge.
- It keeps reset behavior simple because seeded groups remain the durable defaults.

**Alternatives considered**:

- Never merge moved tools back automatically: rejected because it makes regrouping awkward and would make the long-term state model noisier than needed.

### Decision 5: Use explicit move-to-edge actions for the bounded slice

**Decision**: Add explicit move-to-left, move-to-right, and move-to-bottom actions to the auxiliary header and slide-out chrome instead of unlocking broad drag-and-drop for this slice.

**Rationale**:

- The current docked auxiliary groups are intentionally locked.
- Dockview supports move events and group relocation, but inferring all user intent from unlocked drag/drop would widen the slice and make parity harder to validate.
- Explicit move actions provide deterministic, testable behavior for left-edge support while preserving the current bounded scope.

**Alternatives considered**:

- Unlock all dockview auxiliary groups and rely entirely on drag-and-drop: rejected for this slice because it introduces more surface area than needed.
- Add left-edge support only at the persistence layer and require manual JSON/layout editing: rejected because it is not user-facing workspace customization.

### Decision 6: Keep one slide-out per edge and preserve existing hide/dock/restore semantics

**Decision**: Left-edge groups follow the same rule already used on the right and bottom: one visible slide-out per edge, click-active-tab-again hides it, dock from slide-out docks only the selected tool, and rail restore restores the full minimized group.

**Rationale**:

- This matches the behavior already accepted in the current prototype slice.
- The user explicitly confirmed those semantics earlier in the parity work.
- Consistency across edges is the point of this feature; left should not introduce a new behavior model.

**Alternatives considered**:

- Allow multiple simultaneous left-edge slide-outs: rejected because it conflicts with the current parity model.
- Make left-edge dock from slide-out restore the whole group: rejected because it would diverge from the accepted semantics on the other edges.

### Decision 7: Reset drops derived groups and re-seeds only the Java-aligned defaults

**Decision**: Reset-to-default removes all user-created left-edge placements and any derived singleton groups, then reseeds only the default right/bottom groups.

**Rationale**:

- The default layout must remain separate from saved custom layout.
- Derived groups exist purely because of user customization, so they should not survive reset.
- This makes reset deterministic and keeps the default state easy to reason about and test.

**Alternatives considered**:

- Preserve left-edge derived groups across reset: rejected because reset would stop meaning “return to default layout”.

## Recommended Architecture

Use a layered model with clear ownership:

- **Static definitions own**:
  - seeded group IDs
  - default edge
  - ordered eligible panel IDs
  - default active tool and sizes
- **Persisted group instances own**:
  - current edge
  - current panel membership
  - seeded versus derived identity
  - active tool
  - minimized/docked/slide-out/maximized state
  - current docked and slide-out sizes
- **The shell owns**:
  - left/right/bottom rails
  - one slide-out per edge
  - move-to-edge actions
  - reveal routing

## First Slice Boundaries

This feature remains bounded to the existing four prototype auxiliary panels:

- `SoundObjectPropertiesTopComponent`
- `MidiInputPanelTopComponent`
- `ScoreObjectEditorTopComponent`
- `MixerTopComponent`

Success for this slice means:

1. no left-edge tools appear in fresh/reset layouts
2. a user can move a whole prototype group to the left edge and use normal minimize/slide-out/restore flows there
3. a user can move a single prototype tool to the left edge while leaving its sibling on the original edge
4. saved custom left-edge layouts restore correctly
5. reset removes custom left-edge placements and returns to the right/bottom defaults

## Deferred Follow-On Work

- Unlocking full arbitrary drag-and-drop rearrangement for auxiliary groups
- Extending the move/split/merge model beyond the four prototype auxiliary panels
- Long-term migration of workbench layout persistence away from localStorage
- Any decision to seed a Java-backed left-edge default if stronger Java evidence appears later

## Risks

- The move from fixed groups to instance-based groups is a real layout migration and will need explicit versioning.
- Merge-back behavior must preserve stable panel ordering or the user experience will feel inconsistent after regrouping.
- Header/slide-out move controls need to be discoverable without crowding the existing chrome.
