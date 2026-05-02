# Contract: Mixer Editor Surfaces

## Purpose

Define the boundaries between canonical project state, the effects-library session, the workbench Mixer panel, and dedicated effect editor windows.

## 1. Project Document Contract

The existing project document bridge is extended with a mixer payload.

### Snapshot

```ts
interface ProjectEditorSnapshot {
  // existing fields
  mixer?: MixerSnapshot;
}
```

### Patch

```ts
interface ProjectDocumentPatch {
  // existing fields
  mixer?: MixerPatch;
}
```

### Ownership

- Electron main remains the only place that mutates canonical `BlueData`.
- The renderer applies optimistic mixer patches to snapshot state, then relies on the authoritative project-loaded/project-document response path to reconcile.
- Arrangement-triggered mixer reconciliation occurs in shared/main code, not in the Mixer panel itself.

## 2. Effects Library Session IPC

The effects library is a separate session-owned surface, not part of `ProjectEditorSnapshot`.

### Main-to-Renderer Queries

```ts
window.blueAPI.getEffectsLibrary(): Promise<EffectsLibrarySnapshot>
window.blueAPI.reloadEffectsLibrary(): Promise<EffectsLibrarySnapshot>
```

### Renderer-to-Main Mutations

```ts
window.blueAPI.updateEffectsLibrary(patch: EffectsLibraryPatch): Promise<EffectsLibrarySnapshot>
```

`EffectsLibraryPatch` covers category creation, rename, reorder, effect rename, effect duplication, and effect removal within the in-memory session only.

### Safety Rules

- `reloadEffectsLibrary()` reparses the source XML from disk and discards unsaved session mutations.
- `updateEffectsLibrary(...)` never writes to disk.
- Error payloads are explicit so the renderer can show a safe empty state when the source file is missing or malformed.

## 3. Effect Editor Window Contract

Effect editing is owned by Electron main and rendered in dedicated non-modal windows.

### Open/Focus API

```ts
window.blueAPI.openProjectEffectEditor(ref: ProjectEffectRef): Promise<void>
window.blueAPI.openLibraryEffectEditor(ref: LibraryEffectRef): Promise<void>
```

### Window Lifecycle Rules

- Main process maintains a one-window-per-owner-reference registry.
- Opening the same effect again focuses the existing window.
- Removing the backing effect closes the corresponding window or transitions it to a read-only unavailable state.

### Editor Mutation API

Project-owned effect edits flow back through `ProjectDocumentPatch { mixer: ... }`.

Library-owned effect edits flow through `updateEffectsLibrary(...)`.

## 4. Workbench And Menu Integration

### Workbench Panel Route

- `MixerTopComponent` in `WORKBENCH_PANEL_REGISTRY` is routed to a real `MixerPanel` component.
- The panel continues to participate in the current output/auxiliary group flows managed by Dockview and the workbench store.

### Native Menu Command

The native menu command surface gains an effects-library action that the renderer handles by opening the modal management surface.

```ts
type NativeMenuCommand =
  | { type: 'focus-panel'; panelId: string }
  | { type: 'reset-layout' }
  | { type: 'open-effects-library' };
```

The effects-library management UI itself can live in the main window renderer as a modal dialog because only effect-instance editing requires separate non-modal windows.

## 5. Reused Editor Surfaces

The effect editor composes existing renderer surfaces:

- `BSBInterfaceEditor` for effect interface/widget editing
- `BSBUDOPanel` or related embedded-UDO helpers for opcode-list editing
- `SelectedCodeEditor` for effect ORC and comments/code tabs

This contract assumes the editor shell adapts these components through effect-specific snapshot and patch adapters rather than by copying their implementations.