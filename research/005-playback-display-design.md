# Playback Display Design Research

## Purpose

Capture the current playback-display timing research so future toolbar, status-bar, or timeline specs can reuse it without repeating the same investigation.

## Current Electron Baseline

- The Electron app does not yet have a live playhead pipeline.
- The main process only sends coarse playback lifecycle status in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/engine-bridge.ts`.
- Current state polling is every 250ms and is used for terminal-state reconciliation, not for realtime display.

## Existing blue-engine Timing Surface

- `blue-engine` already tracks authoritative playback time through `sampleFrames`.
- The engine-state snapshot exposed through `/Users/stevenyi/work/blue-electron/packages/blue-engine-client/src/protocol.ts` includes:
  - `sampleFrames`
  - `sampleRate`
  - `ksmps`
  - `sequence`
- `sampleFrames` is incremented once per `csoundPerformKsmps()` cycle, so playback timing resolution is already at control-block granularity.

## Shared Memory Findings

- The current shared-memory layout in `/Users/stevenyi/work/csound/blue-engine/src/ipc/SharedMemory.h` is channel-only.
- Electron currently has no shared-memory reader for `blue-engine`; the client can only request the shm name.
- Conclusion: shared memory is viable later for broader realtime telemetry, but is not the cheapest next step for the toolbar playhead.

## Java Blue Findings

- Java Blue uses a hybrid approach.
- `ProcessConsole` parses engine-emitted time pointers and forwards them into `RenderTimeManager`.
- `RenderTimeManagerImpl` drives UI updates on a timer and applies correction/latency handling there.
- Conclusion: Java Blue already favors authoritative engine correction plus smooth UI-side updates.

## Ardour Findings

- Ardour updates UI clocks from authoritative engine/session sample position, not a pure UI wall clock.
- The UI clock path is timer-driven.
- The displayed position uses `audible_sample()` for user-facing clocks, which accounts for what the user hears rather than just raw transport position.
- Ardour does contain a DLL-style transport-master chasing loop, but that is for external transport synchronization, not for ordinary screen playhead animation.

## PLL / DLL Applicability

A PLL-style or DLL-style smoothing layer can help if authoritative transport snapshots arrive at a modest cadence and the UI needs smooth motion between them.

Recommended use:

- Treat engine timing as the source of truth.
- Keep a local estimate of position and rate in the renderer.
- Correct that estimate toward each incoming authoritative snapshot.
- Snap instead of smoothing when playback starts, stops, loops, or relocates.

Not recommended:

- Using a PLL/DLL as the primary transport authority.
- Smoothing across discontinuities that users expect to appear as immediate jumps.

## Recommended Design

1. Use engine-authored `sampleFrames` as the authoritative playhead source while playback is active.
2. Feed the renderer low-rate authoritative snapshots rather than per-frame IPC.
3. Convert to seconds via cached `sampleRate`, then to beats/time text via the serialized project tempo map.
4. Interpolate locally in the renderer for smooth display.
5. Account for output-latency correction in a later slice if parity requires the display to match audible output exactly.

## Sample Rate / KSMPS Guidance

- `sampleRate` is effectively fixed for an active performance and can be cached after the first running snapshot for that playback session.
- `ksmps` is also fixed for the active performance and is optional in repeated UI updates unless block-size-aware behavior or diagnostics need it.
- For robustness, stateless reads such as `GET_ENGINE_STATE` can still expose the full snapshot shape even if repeated push-style updates only carry `sampleFrames` and `sequence`.

## Deferred Work

- Shared-memory transport telemetry for broader realtime UI features
- Audible-latency correction in the Electron toolbar/timeline
- Transport-display reuse in timeline rulers, status bars, or detached transport windows
