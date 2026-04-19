# Research Notes: Collapsed Sidebar Group Research

## Scope

Planning-phase research baseline for feature `013-collapsed-sidebar-research`. These notes narrow the next implementation prototype for collapsed auxiliary groups before broader workbench hardening resumes.

## Inputs

- Java Blue screenshots supplied with the spec: right-side properties group open with a second collapsed vertical handle, plus the alternate state with `MIDI Input Panel` revealed
- Existing dockview workbench baseline in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
- Prior window-system recommendation in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research`
- Installed dockview `5.2.0` API/type definitions under `/Users/stevenyi/work/blue-electron/node_modules/.pnpm`

## Current Workbench Baseline

### Observed Shell Behavior In `blue-electron`

The current shell is a useful dockview proof of concept, but it is materially simpler than the Java auxiliary-group behavior:

- `WorkbenchShell.tsx` opens all startup editor tabs, then adds only the first `properties` panel to the right of the first editor panel and only the first `output` panel below it.
- `workbench-store.ts` opens a panel by stable ID and focuses it if already present, but new panels are added without explicit edge placement or auxiliary-group routing.
- `WindowMenu.tsx` exposes every panel by stable ID and therefore defines a programmatic reveal contract that the collapsed-group design must preserve.
- Layout persistence currently serializes only raw dockview JSON to `localStorage` under `blue-workbench-layout`; there is no supplemental metadata for collapsed-edge state, group ordering, or last active auxiliary panel.

### Gap Between Current Shell And Java Reference

The Java screenshots show edge behavior that the current shell does not yet model:

- The right edge can show one expanded auxiliary group while another remains available as a vertical collapsed handle on the same edge.
- The edge rail remains visible even when a group is collapsed, so discoverability is preserved.
- Revealed auxiliary content appears to reuse the same edge region instead of spawning arbitrarily placed new groups.
- The bottom workspace also presents multiple auxiliary tools as a durable grouped area rather than just a single appended panel.

## Target Behavior Baseline

| ID | Behavior | Required Level | Why It Matters |
|---|---|---|---|
| B01 | One auxiliary group per edge may be expanded while sibling groups remain available as collapsed handles | Mandatory | Matches the Java right-edge interaction model and keeps edges predictable |
| B02 | Collapsed handles remain visible with stable labels and ordering on the owning edge | Mandatory | Preserves discoverability and avoids hidden functionality |
| B03 | Reveal can be triggered both by direct handle interaction and by programmatic open/focus using stable panel IDs | Mandatory | Preserves the existing Window-menu and future selection-sync workflows |
| B04 | Each auxiliary group remembers last active panel and expanded size when re-opened | Mandatory | Avoids jarring resets and supports repeated panel workflows |
| B05 | Right and bottom edges manage collapsed state independently | Mandatory | Properties and output workflows should not fight over a single global state |
| B06 | Layout restore persists both dockview placement and collapsed-edge metadata | Mandatory | Raw dockview JSON alone does not capture the intended Java-style rail behavior |
| B07 | The design works for grouped right-edge and grouped bottom-edge auxiliary tools using one abstraction | Mandatory | Prevents separate one-off solutions for properties and output |
| B08 | Keyboard/group cycling between collapsed groups is possible without redesigning the model | Preferred | Useful follow-on, but not needed to validate the next prototype |
| B09 | Drag-reorder of collapsed handles is supported | Deferred | Valuable later, but not required for the first validating slice |

## Shared Evaluation Checklist

Every candidate approach is scored against the same questions:

1. Does the approach preserve a single source of truth for panel and group identity?
2. Can it express a visible collapsed rail on the right and bottom edges?
3. Can it reveal/focus a target panel by stable ID without bypassing the main workbench model?
4. Can it remember the last active panel and size for an auxiliary group?
5. Can it persist enough state to restore both dockview layout and collapsed-edge behavior?
6. Does it keep the prototype implementation bounded to the existing workbench shell?
7. Does it avoid introducing a second parallel layout system unless that tradeoff is clearly justified?

## Decision 1: Treat collapsed auxiliary groups as durable workspace groups, not ad hoc hidden panels

**Decision**: Model the Java behavior as group-level collapsed state with stable identity, ordering, and reveal behavior.

**Rationale**: The screenshots show a visible right-edge properties group and a second collapsed vertical handle for `MIDI Input Panel` on the same edge. That implies more than simple open/close of individual panels: the collapsed item remains discoverable, keeps a stable label, and competes for the same edge region as the expanded group.

**Alternatives considered**:

- Simple panel open/close: rejected because it loses the persistent collapsed affordance and does not explain the side-rail behavior in the Java UI.

## Decision 2: Keep dockview as the single source of truth for panel and group identity

**Decision**: Keep the future properties/output sidebar behavior anchored to dockview-owned panels and groups.

**Rationale**: The current shell already uses `DockviewApi` for `addPanel`, `getPanel`, `toJSON`, and `fromJSON`, and the `WindowMenu` already opens panels by stable ID through the same store. Preserving that model reduces the risk of splitting reveal/focus logic or duplicating persistence across separate layout systems.

**Alternatives considered**:

- Fully custom sidebars outside dockview: rejected for the mainline path because it duplicates panel identity and persistence responsibilities already handled by the existing workbench shell.

## Decision 3: Do not use Paneview as the primary properties/output host

**Decision**: Reject `Paneview` as the primary container for the future collapsed auxiliary groups.

**Rationale**: The installed dockview package exports `Paneview` as a separate component family with its own `PaneviewApi`, its own serialization model, and pane-level `setExpanded()` behavior. That is useful for accordion-style sections, but it is not a `DockviewReact` group mode and it does not naturally preserve tabbed dock groups, shared docking behavior, or the existing Window-menu-to-panel flow without nesting or duplication.

**Alternatives considered**:

- Nest dockview inside paneview: deferred because it creates two persistence models and two focus/reveal layers for the same auxiliary area.
- Use paneview only for the right sidebar: rejected because the bottom output edge would still need a second model or a different abstraction.

## Decision 4: Preferred direction is a custom collapse wrapper backed by dockview groups

**Decision**: Use dockview groups as the canonical host for auxiliary content and add a thin custom collapse controller or wrapper to render Java-style collapsed handles and edge reveal behavior.

**Rationale**: The installed dockview API provides the right foundation: group and panel APIs, `addGroup`, `addPanel`, group header positioning, and unified serialization. What it does not expose as a first-class concept is a Java-like collapsed edge rail with persistent handles competing along the right or bottom edge. A thin app-level wrapper can own collapsed-handle rendering, per-edge reveal policy, and supplemental collapsed-state metadata while leaving docking, focus, and layout serialization inside dockview.

**Alternatives considered**:

- Pure dockview grouping only: kept as the fallback if the wrapper proves unnecessary.

## Decision 5: Fallback direction is dockview-only grouped sidebars

**Decision**: If the prototype shows that dockview group placement and header-position options are sufficient, stay within dockview alone and avoid a separate collapse controller.

**Rationale**: This keeps the architecture simpler and still preserves a unified panel/group model. It is the lowest-custom-work path, but the installed API evidence does not currently prove that dockview alone can reproduce the Java side-rail affordance cleanly.

**Alternatives considered**:

- Paneview fallback: rejected because the fallback should stay aligned with the existing dockview recommendation from spec 011.

## Comparison Summary

| Approach | Unified dockview model | Fit for Java collapsed-handle behavior | Programmatic reveal/focus | Persistence burden | Verdict |
|---|---|---|---|---|---|
| Dockview groups + custom collapse wrapper | Strong | Strong | Strong | Medium | Preferred |
| Dockview-only grouped sidebars | Strong | Partial / unproven | Strong | Low | Fallback |
| Paneview as primary sidebar host | Weak | Partial | Medium | High | Reject for mainline |

## Capability Assessment Matrix

| Behavior | Dockview groups + custom collapse wrapper | Dockview-only grouped sidebars | Paneview as primary sidebar host |
|---|---|---|---|
| B01 One expanded auxiliary group per edge with visible siblings | Direct | Partial | Partial |
| B02 Visible labeled collapsed handles on the edge rail | Direct | Partial | Direct |
| B03 Stable-ID reveal/focus from Window menu or future commands | Direct | Direct | Partial |
| B04 Remember last active panel and size per auxiliary group | Partial | Partial | Partial |
| B05 Independent right/bottom edge state | Direct | Partial | Partial |
| B06 Persist dockview layout plus collapsed-edge metadata | Partial | Partial | Custom-work-required |
| B07 Reuse one abstraction for right and bottom auxiliary groups | Direct | Partial | Partial |

### Notes Per Candidate

- **Dockview groups + custom collapse wrapper**
  - Keeps dockview as the canonical host for panels and groups.
  - Needs app-level metadata and rail UI, but the custom work is localized and aligned with the current shell.
- **Dockview-only grouped sidebars**
  - Preserves one model and lowest persistence surface area.
  - Still needs proof that dockview alone can express the Java-style side rail clearly enough.
- **Paneview as primary sidebar host**
  - Offers native expansion/collapse primitives.
  - Splits the workbench model into dockview plus paneview and weakens the current stable-ID reveal path.

## Prototype Slice

1. Right edge: represent `SoundObjectPropertiesTopComponent` as the expanded auxiliary group and `MidiInputPanelTopComponent` as a collapsed handle that can reveal into the same edge region.
2. Bottom edge: apply the same abstraction to `ScoreObjectEditorTopComponent` and `MixerTopComponent`.
3. Reveal/focus: ensure a `WindowMenu` action or future programmatic command can reveal a target group and focus its active panel by stable ID.
4. Persistence: save dockview layout JSON plus supplemental collapsed-group metadata keyed by auxiliary-group ID and edge.
5. Validation: confirm one-expanded-group-per-edge behavior, handle discoverability, restore-on-reload, and no loss of stable panel IDs.

## Final Recommendation

### Preferred Direction

Use **dockview groups plus a thin custom collapse controller**.

Why this is the preferred path:

- It preserves the existing dockview workbench shell as the only panel/group host.
- It keeps the current stable-ID reveal flow from `WindowMenu` and `workbench-store`.
- It localizes the custom work to edge-handle rendering, auxiliary-group metadata, and restore rules.
- It applies equally to both the right-edge properties area and the bottom-edge output area.

### Fallback Direction

Use **dockview-only grouped sidebars** if the prototype shows that a separate collapse controller is unnecessary and dockview grouping alone can present the rail behavior clearly enough.

### Accepted Gaps

- Drag-reorder of collapsed handles is deferred.
- Advanced keyboard/group cycling is deferred.
- Persisting the rail state in Electron `userData` is follow-on; the first prototype may continue using local storage while validating the state model.

## Remaining Risks

- The prototype needs a clear mapping between dockview group IDs and higher-level auxiliary-group IDs used by collapsed handles.
- The collapsed rail will likely need custom CSS and orientation-specific behavior for right and bottom edges.
- Layout restore may require merging dockview JSON with app-level collapse metadata instead of relying on dockview serialization alone.
