# Project Status — blue-electron

**Date**: 2026-04-18
**Branch**: `014-window-system-parity`

## Current Active Work — Spec 014 Window System Parity

Spec `014-window-system-parity` is now the current active work. This spec takes the bounded spec 013 prototype and moves directly into a parity-first design for the workbench auxiliary window system.

## Spec 013 Close-Out

Spec `013-collapsed-sidebar-research` is complete as a bounded prototype and research slice.

- The 013 runtime prototype proved stable panel IDs, auxiliary-edge metadata, and a simplified edge-rail shell in `blue-app`.
- That slice intentionally did **not** claim full NetBeans RCP parity.
- Its main recommendation stands: keep dockview as the canonical panel/group host and localize custom behavior around auxiliary-group presentation state.

## Spec 014 Goal

Spec 014 is the parity slice for the auxiliary window system. The target behavior is explicit:

- Auxiliary groups can be `docked`, `minimized`, `floating`, or `maximized`
- Minimizing a group leaves visible ordered edge tabs on the owning edge
- Clicking a minimized tab reopens the requested content in a floating, resizable tool window
- Maximizing an auxiliary group presents it with top tabs like the main editor area
- Restore returns the group to its home edge without duplicating stable panel IDs
- Layout save/restore and Window-menu reveal must honor the existing presentation state

## Current Planning Direction

- **Canonical runtime host**: dockview groups for docked, floating, and maximized behavior
- **App-owned layer**: minimized edge-tab controller, home-edge restore metadata, and stable-ID reveal routing
- **Prototype scope**:
  - right / `properties`: `SoundObjectPropertiesTopComponent`, `MidiInputPanelTopComponent`
  - bottom / `output`: `ScoreObjectEditorTopComponent`, `MixerTopComponent`

## Why This Is The Direction

- The Java reference is group-oriented and stable-ID-driven.
- Dockview already exposes floating-group and maximize APIs plus serialized floating/maximized layout state.
- The parity gap is specifically the minimized side-tab model and transition orchestration, not basic docked layout.
- Keeping minimized state in app metadata avoids introducing a second layout system while still allowing NetBeans-style visible edge tabs.

## Immediate Follow-On

1. Finish the spec 014 planning package under `specs/014-window-system-parity/`
2. Generate `tasks.md` for the parity implementation slice
3. Replace the simplified 013 rail behavior with the full presentation-state model in the renderer workbench

## Related Specs

- **Spec 011**: closed; dockview was selected as the workbench foundation, with rc-dock as fallback
- **Spec 012**: closed; demo2026 parity work now matches the Java `01.csd` reference byte-for-byte
- **Spec 013**: closed; bounded auxiliary-rail prototype and implementation recommendation completed
