# Research Notes: Collapsed Sidebar Group Research

## Scope

Planning-phase research baseline for feature `013-collapsed-sidebar-research`. These notes narrow the next implementation prototype for collapsed auxiliary groups before broader workbench hardening resumes.

## Inputs

- Java Blue screenshots supplied with the spec: right-side properties group open with a second collapsed vertical handle, plus the alternate state with `MIDI Input Panel` revealed
- Existing dockview workbench baseline in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
- Prior window-system recommendation in `/Users/stevenyi/work/blue-electron/specs/011-window-system-research`
- Installed dockview `5.2.0` API/type definitions under `/Users/stevenyi/work/blue-electron/node_modules/.pnpm`

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

## Prototype Slice

1. Right edge: represent `SoundObjectPropertiesTopComponent` as the expanded auxiliary group and `MidiInputPanelTopComponent` as a collapsed handle that can reveal into the same edge region.
2. Bottom edge: apply the same abstraction to `ScoreObjectEditorTopComponent` and `MixerTopComponent`.
3. Reveal/focus: ensure a `WindowMenu` action or future programmatic command can reveal a target group and focus its active panel by stable ID.
4. Persistence: save dockview layout JSON plus supplemental collapsed-group metadata keyed by auxiliary-group ID and edge.
5. Validation: confirm one-expanded-group-per-edge behavior, handle discoverability, restore-on-reload, and no loss of stable panel IDs.

## Remaining Risks

- The prototype needs a clear mapping between dockview group IDs and higher-level auxiliary-group IDs used by collapsed handles.
- The collapsed rail will likely need custom CSS and orientation-specific behavior for right and bottom edges.
- Layout restore may require merging dockview JSON with app-level collapse metadata instead of relying on dockview serialization alone.
