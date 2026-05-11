# Research: Score Editor Management and Navigation

## Decision: Re-scope the old interaction follow-up away from already-landed direct manipulation

**Rationale**: Spec 036 already delivered marquee selection, move, resize, clipboard actions, align, follow-the-leader, reverse, and several layer-management affordances. The old interaction draft therefore overstated what was still missing.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/STATUS.md`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`

## Decision: Center the slice on the non-functional Manage affordance and missing manager dialogs

**Rationale**: The shell already shows a `Manage` button, but it does not yet route to a real score-manager or layer-group-manager workflow. That is a clearer remaining gap than direct manipulation.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- Java Blue `ScoreManagerDialog` and `LayerGroupManagerDialog` references

## Decision: Treat marker/navigation workflows and score-adjacent panels as part of the same later shell slice

**Rationale**: Markers are already rendered in the shell, and a `MarkersTopComponent` is registered in the workbench, but the broader navigation workflow is still incomplete. This is the right place to connect marker navigation, score navigator behavior, and any remaining score-related placeholder panels.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`

## Decision: Keep playback-follow and time-pointer polish in the shell slice, not in the score-object editor specs

**Rationale**: Playback-follow is a shell/view concern. It depends on transport and score viewport behavior rather than on any particular score-object editor.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarTransport.tsx`

## Decision: Keep this slice after the remaining score-object editor planning

**Rationale**: The reprioritization exists to make the remaining score-object editors explicit first. This spec should therefore assume the Tier 1 and Tier 2 editor plans already exist.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/REMAINING_SOBJ_EDITORS.md`
- `/Users/stevenyi/work/blue-electron/STATUS.md`