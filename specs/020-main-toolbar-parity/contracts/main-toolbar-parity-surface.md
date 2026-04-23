# Contract: Main Toolbar Parity Surface

## Purpose

Define the shared renderer/main-process surface for the Java Blue-style toolbar, native File/Window menu ownership, and BrowserWindow title updates.

## Shared Project Snapshot Additions

`ProjectEditorSnapshot` / `ProjectLoadedPayload` must expose enough toolbar data for the renderer to format playhead and selection displays without direct `BlueData` access.

Required additions:

```ts
interface TempoPointSnapshot {
  beat: number;
  tempo: number;
  curveType: 'constant' | 'linear';
}

interface TempoMapSnapshot {
  enabled: boolean;
  points: TempoPointSnapshot[];
}

interface ToolbarProjectTransportSnapshot {
  renderStartTime: number;
  renderEndTime: number;
  loopRendering: boolean;
  tempoMap: TempoMapSnapshot;
}
```

Contract rules:

- `renderEndTime < 0` means no active selection range.
- `tempoMap.points` must be ordered and sufficient for `beatsToSeconds` / `secondsToBeats` conversions in the renderer.
- These fields are renderer-facing projections only; they do not alter `.blue` serialization.

## Native File Menu Ownership

The native `File` menu owns the following actions for this slice:

- `Open`
- `Save`
- `Save As`

Renderer contract:

- The toolbar no longer renders in-app buttons for these commands.
- Existing renderer file actions may still be called from other app flows, but the top toolbar must not duplicate them.

## Native Window Menu Command Bridge

The native `Window` menu forwards typed commands into the renderer.

Command shape:

```ts
type NativeMenuCommand =
  | { type: 'focus-panel'; panelId: string }
  | { type: 'reset-layout' };
```

Command behavior:

- `focus-panel` opens or focuses the requested panel using the existing workbench-store semantics.
- `reset-layout` restores the default workbench layout.
- Unknown `panelId` values must be ignored safely.

Menu data source:

- Panel descriptors used by the native `Window` menu must come from shared metadata, not a duplicated hardcoded list in the main process.

## Toolbar Group Contract

The renderer toolbar must provide these groups in one horizontal bar:

1. `transport`
2. `playhead`
3. `selection`
4. `blue-live`

Group behavior:

- `transport` contains previous marker, next marker, rewind, play, stop, follow-playback toggle, and loop toggle.
- `playhead` shows primary beat text and secondary time text.
- `selection` shows start, end, and duration or placeholders.
- `blue-live` shows `blueLive`, `Recompile`, `All Notes Off`, and `MIDI Input`, even when currently unavailable.

## Playback Clock Authority Contract

The main/preload boundary must expose authoritative playback clock snapshots to the renderer while playback is active.

Snapshot shape:

```ts
interface PlaybackClockSnapshot {
  sessionId: number;
  sampleFrames: number;
  sequence: number;
  sampleRate?: number;
  ksmps?: number;
}
```

Rules:

- The first running snapshot for a `sessionId` must include `sampleRate`.
- Subsequent snapshots for the same `sessionId` may omit `sampleRate` and `ksmps` when unchanged.
- `sampleFrames` is the authoritative position source for the toolbar while playback is active.
- The renderer must ignore stale `sequence` values.

## Playhead Update Contract

The renderer computes display animation locally from authoritative engine snapshots.

Rules:

- No per-frame main-to-renderer playhead IPC is required for this slice.
- The renderer starts from the latest authoritative `sampleFrames` snapshot when playback begins.
- While playing, the renderer may interpolate between authoritative snapshots for visual smoothness.
- Beat/time formatting still comes from the serialized tempo map in `ToolbarProjectTransportSnapshot`.
- When playback stops, relocates, loops, or otherwise discontinuously changes anchor, the display must snap to the new authority state rather than smoothing across the jump.

## Window Title Contract

The main process is the single owner of BrowserWindow title text.

Rules:

- With no open project, the title is `Blue`.
- After open and save-as, the title becomes `Blue - [basename].blue`.
- The renderer toolbar must not render duplicate app/file title text in its left-hand group.

## Blue Live Availability Contract

Because full Blue Live backend support does not yet exist in the Electron port:

- controls may render disabled
- disabled controls must communicate an availability reason via tooltip, aria description, or equivalent visible affordance
- the toolbar layout must remain stable whether controls are enabled or disabled
