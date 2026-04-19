# Contract: Auxiliary Edge Behavior

## Purpose

This contract defines the required user-visible behavior for left-edge parity in the workbench shell. It is a UI behavior contract, not a network or file format contract.

## Scope

- Prototype auxiliary panels only:
  - `SoundObjectPropertiesTopComponent`
  - `MidiInputPanelTopComponent`
  - `ScoreObjectEditorTopComponent`
  - `MixerTopComponent`
- Supported edges:
  - `left`
  - `right`
  - `bottom`

## Operations

| Operation | Preconditions | Required Result |
|-----------|---------------|-----------------|
| Move group to edge | A seeded or derived auxiliary group is visible | The same logical group appears on the target edge with the same stable panel IDs, active tool, and no duplicates |
| Move single tool to edge | A panel belongs to a multi-tool auxiliary group | The selected panel moves to the target edge as its own derived singleton group and the remaining sibling group stays intact |
| Minimize group | A group is docked on any supported edge | The group collapses into visible minimized tabs on that same edge |
| Toggle minimized tab | A minimized tab exists on an edge | The selected tool opens as the only visible slide-out for that edge; clicking the same active tab again hides it |
| Dock selected tool | A slide-out is open for an undocked tool | Only the selected tool returns to docked presentation; other minimized siblings remain minimized |
| Restore minimized group | A minimized group exists on an edge | All tools in that group return to docked presentation on the same edge |
| Reveal tool | The tool is docked, minimized, in a slide-out, or maximized | The existing presentation is focused or transitioned; no duplicate tool window is created |
| Reset layout | The user requests default layout reset | All derived singleton groups and all left-edge custom placements are removed; only default right/bottom seeded groups remain |

## Edge Rules

- At most one slide-out may be visible per edge.
- Left-edge behavior must match the accepted right-edge and bottom-edge parity semantics.
- Fresh and reset layouts must show zero left-edge tools by default.

## Split And Merge Rules

- Moving one tool out of a multi-tool seeded group creates a derived singleton group.
- Moving that singleton back onto the edge of its compatible seeded sibling group merges it back into the seeded group in seeded panel order.
- No panel may belong to more than one group at once.

## Persistence Rules

- Saved layouts restore user-customized left-edge placements.
- Reset layout discards those custom left-edge placements and reseeds the default right/bottom layout.
- Layout restore must preserve active tool identity and minimized state in the normal case.
