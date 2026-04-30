# Contract: MIDI Input, Virtual Keyboard, And Blue Live Note Trigger Surfaces

## Scope

This contract describes the TypeScript surface expected between `@blue/data`, Electron main/preload, renderer stores, and the two new workbench panels for Spec 033. Names may be refined during implementation, but the ownership boundaries and behavior should remain stable.

## Project Document Contract Extension

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

```ts
export interface MidiScaleSnapshot {
  scaleName: string;
  baseFrequency: number;
  octave: number;
  ratios: number[];
}

export interface MidiInputProcessorSnapshot {
  keyMapping: string;
  velocityMapping: string;
  pitchConstant: string;
  ampConstant: string;
  scale: MidiScaleSnapshot | null;
}

export type MidiInputPatch =
  | { type: 'updateKeyMapping'; value: string }
  | { type: 'updateVelocityMapping'; value: string }
  | { type: 'updatePitchConstant'; value: string }
  | { type: 'updateAmpConstant'; value: string }
  | { type: 'updateScale'; scale: MidiScaleSnapshot | null };

export interface ProjectEditorSnapshot {
  midiInput?: MidiInputProcessorSnapshot;
}

export interface ProjectDocumentPatch {
  midiInput?: MidiInputPatch;
}
```

Requirements:

- Snapshot creation must read canonical `BlueData.getMidiInputProcessor()`.
- Patch application must update canonical project data in the main process.
- Save/reopen must preserve the same snapshot values.

## `@blue/data` Contract Additions

Extend `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts` and export any new helpers from `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`.

```ts
export interface MidiTriggerMappingInput {
  midiNote: number;
  velocity: number;
  channel: number;
}

export interface MidiTriggerMappingResult {
  originalMidiNote: number;
  originalVelocity: number;
  channel: number;
  mappedPitchValue: string;
  mappedAmplitudeValue: string;
}

class MidiInputProcessor {
  getScale(): Scale | null;
  setScale(scale: Scale | null): void;
}

export function mapMidiTrigger(
  processor: MidiInputProcessor,
  input: MidiTriggerMappingInput,
): MidiTriggerMappingResult;
```

Requirements:

- `mapMidiTrigger(...)` must stay pure and must not depend on Node, Electron, or engine-process APIs.
- Mapping must follow the active `keyMapping`, `velocityMapping`, constants, and scale.
- Unknown mapping strings must degrade safely instead of corrupting project data.

## Renderer API Additions

Extend `window.blueAPI` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`.

```ts
export interface BlueLiveNoteTriggerRequest {
  type: 'noteOn' | 'noteOff';
  midiNote: number;
  velocity: number;
  channel: number;
  source: 'mouse' | 'computer';
}

export interface BlueLiveNoteTriggerResult {
  ok: boolean;
  message?: string;
  submittedScoreText?: string;
}

interface BlueAPI {
  triggerBlueLiveNote(
    request: BlueLiveNoteTriggerRequest,
  ): Promise<BlueLiveNoteTriggerResult>;
}
```

No preload API is required to open the MIDI Input panel. The renderer should keep using the existing workbench store and panel ids for open/focus behavior.

## Main Process IPC Channels

All project-dependent handlers must safely reject or return a disabled result when no project is loaded.

- `blue-live:trigger-note`
  - Accepts `BlueLiveNoteTriggerRequest`.
  - Reads canonical project MIDI input settings.
  - Applies `mapMidiTrigger(...)`.
  - Formats and submits a Blue Live score event.
  - Returns `BlueLiveNoteTriggerResult`.
- `blue-live:all-notes-off`
  - Existing handler reused by the Virtual Keyboard All Notes Off action.

Validation:

- `blue-live:trigger-note` must reject when Blue Live is not running.
- Note-off requests must be safe even if the matching note is not active.
- `blue-live:all-notes-off` remains the canonical engine-wide silence action.

## Blue Live Engine Contract

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`.

```ts
interface BlueLiveEngineSession {
  triggerNote(request: BlueLiveNoteTriggerRequest): Promise<BlueLiveNoteTriggerResult>;
  sendAllNotesOff(): Promise<{ ok: boolean; message?: string }>;
}
```

Requirements:

- `triggerNote(...)` must read the active project's canonical MIDI input processor.
- `triggerNote(...)` must use the pure `@blue/data` mapping helper before formatting score text.
- Note submission must go through the existing Blue Live engine client/session path.
- Engine state remains authoritative in main process, not the renderer.

## Workbench Panel Contract

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`.

- `MidiInputPanelTopComponent` must render a dedicated `MidiInputPanel` surface.
- `VirtualKeyboardTopComponent` must render a dedicated `VirtualKeyboardPanel` surface.
- Neither panel may fall through to `PlaceholderPanel` after this feature lands.

Toolbar behavior:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
  - `MIDI Input` must open or focus `MidiInputPanelTopComponent`.
  - It must no longer remain permanently disabled.

## Virtual Keyboard Behavior Contract

Renderer panel behavior:

- Support mouse-driven note on/off.
- Support Java-compatible computer-key note mappings.
- Expose channel, octave, velocity, velocity override, and All Notes Off controls.
- Capture computer-key note events only while the panel is intentionally active.
- Clear local pressed-note state on blur, All Notes Off, or Blue Live stop.

Enablement rules:

- When no project is loaded, the panel must not submit note events.
- When Blue Live is not running, the panel must present a clear disabled or no-op state.
- Out-of-range notes must be clamped or rejected safely.