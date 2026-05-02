# Data Model: Mixer Editor Core

## Overview

Spec 034 adds renderer-facing mixer snapshots, a mutable session model for the user effects library, and window-session tracking for effect editors. Project-owned mixer state remains part of the canonical `BlueData` document, while user-library state stays outside the project document and is owned by Electron main.

## Project Snapshot Extension

```ts
interface ProjectEditorSnapshot {
  // existing fields
  mixer?: MixerSnapshot;
}

interface MixerSnapshot {
  enabled: boolean;
  extraRenderTime: number;
  channels: MixerChannelSnapshot[];
  subChannels: MixerChannelSnapshot[];
  master: MixerChannelSnapshot;
}

interface MixerChannelSnapshot {
  id: string;
  name: string;
  channelKind: 'instrument' | 'subChannel' | 'master';
  association?: string;
  outChannel: string;
  muted: boolean;
  solo: boolean;
  level: number;
  volume: number;
  pan: number;
  preChain: MixerChainEntrySnapshot[];
  postChain: MixerChainEntrySnapshot[];
}

type MixerChainEntrySnapshot = MixerEffectEntrySnapshot | MixerSendEntrySnapshot;

interface MixerEffectEntrySnapshot {
  entryId: string;
  kind: 'effect';
  name: string;
  enabled: boolean;
  numIns: number;
  numOuts: number;
  style: 'CLASSIC' | 'MODERN';
}

interface MixerSendEntrySnapshot {
  entryId: string;
  kind: 'send';
  sendChannel: string;
  level: number;
}
```

## Mixer Patch Surface

```ts
type MixerPatch =
  | { type: 'setMixerEnabled'; value: boolean }
  | { type: 'updateExtraRenderTime'; value: number }
  | { type: 'updateChannel'; channelId: string; patch: Partial<MixerChannelEditableFields> }
  | { type: 'addSubChannel'; name?: string; insertIndex?: number }
  | { type: 'removeSubChannel'; channelId: string }
  | { type: 'addEffectFromLibrary'; channelId: string; chain: 'pre' | 'post'; libraryEffectId: string; insertIndex?: number }
  | { type: 'addSend'; channelId: string; chain: 'pre' | 'post'; sendChannel?: string; insertIndex?: number }
  | { type: 'updateSend'; channelId: string; chain: 'pre' | 'post'; entryId: string; patch: { sendChannel?: string; level?: number } }
  | { type: 'updateEffect'; channelId: string; chain: 'pre' | 'post'; entryId: string; patch: EffectEditablePatch }
  | { type: 'removeChainEntry'; channelId: string; chain: 'pre' | 'post'; entryId: string }
  | { type: 'reorderChainEntry'; channelId: string; chain: 'pre' | 'post'; from: number; to: number };
```

`MixerChannelEditableFields` includes only renderer-editable values for this slice: `name`, `outChannel`, `muted`, `solo`, `level`, `volume`, and `pan`.

`EffectEditablePatch` includes fields reused by the effect editor: `name`, `enabled`, `numIns`, `numOuts`, `style`, `code`, optional `comments`, interface-widget state, and embedded opcode-list state. If the current TypeScript `Effect` model lacks any of these fields after the initial audit, the spec allows narrow `@blue/data` parity additions.

## Effects Library Session Model

The effects library is not part of `ProjectEditorSnapshot`. It is loaded and mutated through dedicated main-process IPC.

```ts
interface EffectsLibrarySnapshot {
  loaded: boolean;
  sourcePath: string | null;
  loadError?: string;
  root: EffectsLibraryCategorySnapshot;
}

interface EffectsLibraryCategorySnapshot {
  categoryId: string;
  name: string;
  categories: EffectsLibraryCategorySnapshot[];
  effects: LibraryEffectSnapshot[];
}

interface LibraryEffectSnapshot {
  libraryEffectId: string;
  name: string;
  enabled: boolean;
  numIns: number;
  numOuts: number;
  style: 'CLASSIC' | 'MODERN';
}
```

The main process owns a mutable `EffectsLibrarySession` containing the parsed tree plus deep-copy helpers for:

- returning lightweight snapshots to the renderer
- cloning a library effect into a project mixer chain
- tracking open editor windows for library-owned effects

## Effect Editor Session Model

```ts
interface EffectEditorSession {
  sessionId: string;
  ownerType: 'project' | 'library';
  ownerRef: ProjectEffectRef | LibraryEffectRef;
  windowId: number;
}

interface ProjectEffectRef {
  channelId: string;
  chain: 'pre' | 'post';
  entryId: string;
}

interface LibraryEffectRef {
  libraryEffectId: string;
}
```

This session model gives Electron main one place to implement Java-style window reuse. Reopening the same owner reference focuses the existing window rather than creating a duplicate.

## Synchronization Rules

### Arrangement To Mixer

- Instrument-backed mixer channels must retain stable association metadata.
- Arrangement add/remove/rename/replace operations must reconcile associated mixer channels before the updated snapshot is sent back to the renderer.
- Subchannels and master remain explicit mixer-owned state and must not be discarded during arrangement reconciliation.

### Library To Project

- Adding an effect from the library always deep-copies the library definition into the project mixer.
- Editing a project effect never mutates the library session unless the library effect itself is the thing being edited.
- The library session remains mutable within the current app session but is discarded on restart or explicit reload.

## Validation Focus

- Snapshot tests must prove that arrangement changes produce stable, correctly associated strip snapshots.
- Library tests must prove the source XML path is read once into session state and never written during mutations.
- Window tests must prove that identical `ProjectEffectRef` or `LibraryEffectRef` values reuse the same non-modal window.