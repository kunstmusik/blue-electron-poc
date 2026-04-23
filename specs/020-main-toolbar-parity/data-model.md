# Data Model: Java Main Toolbar Parity

## ToolbarProjectTransportSnapshot

Represents the project-derived timing and transport state the renderer needs for the Java-style toolbar.

Fields:

- `filePath`: absolute `.blue` path or `null`
- `renderStartTime`: number in Blue/Csound beats
- `renderEndTime`: number in Blue/Csound beats, with `< 0` meaning no active selection range
- `loopRendering`: boolean
- `tempoMap`: serialized tempo-map snapshot for beat/time conversion

Relationships:

- Produced in the main process from `BlueData`
- Consumed by the renderer toolbar and project store

Validation:

- `renderEndTime < 0` must produce selection placeholders, not numeric display values.
- `tempoMap` must be sufficient for beat/time conversion without requiring direct `BlueData` access in the renderer.

## TempoMapSnapshot

Renderer-safe representation of the project tempo map needed for playhead/selection formatting.

Fields:

- `enabled`: boolean
- `points`: ordered array of `TempoPointSnapshot`

Validation:

- Points must remain sorted by beat.
- The snapshot must preserve enough information to reproduce `beatsToSeconds` and `secondsToBeats` conversions.

## TempoPointSnapshot

Represents one tempo-map point.

Fields:

- `beat`: numeric beat position
- `tempo`: BPM value
- `curveType`: `constant` or `linear`

Validation:

- `tempo` must be positive.
- `curveType` must match the enum semantics used by `@blue/data`.

## MainToolbarState

Aggregates all renderer-visible toolbar state.

Fields:

- `transport`: `TransportControlState`
- `playhead`: `PlayheadDisplayState`
- `selection`: `SelectionDisplayState`
- `blueLive`: `BlueLiveToolbarState`
- `hasProject`: boolean

Relationships:

- Derived from project store, playback store, and any toolbar-local preferences

Validation:

- State must not duplicate file-menu or window-menu ownership.
- Controls that lack backing behavior must expose `enabled=false` plus an explanatory affordance.

## PlaybackClockAuthorityState

Represents the authoritative playback clock metadata cached for the active performance.

Fields:

- `sessionId`: monotonically increasing playback session identifier
- `sampleRate`: fixed samples-per-second value for the active performance, or `null`
- `ksmps`: optional fixed control-block size for the active performance
- `lastSampleFrames`: latest authoritative engine sample counter
- `lastSequence`: latest accepted engine-state sequence
- `receivedAtMs`: wall-clock receive timestamp for interpolation

Validation:

- The first authoritative running snapshot for a playback session must provide `sampleRate`.
- `sampleRate` and `ksmps` must be treated as fixed for the lifetime of that playback session.
- Snapshots with stale `sequence` values must be ignored.
- A new `sessionId` must reset cached authority state instead of interpolating across sessions.

## TransportControlState

Represents the state of the transport button group.

Fields:

- `status`: `idle | starting | playing | stopping | stopped | error`
- `canNavigateMarkers`: boolean
- `canRewind`: boolean
- `canPlay`: boolean
- `canStop`: boolean
- `followPlayback`: boolean
- `loopRendering`: boolean

Validation:

- Play and stop affordances must not both present as active primary actions simultaneously.
- `loopRendering` must persist through project edits/save cycles because it comes from `BlueData`.

## PlayheadDisplayState

Represents the visible playhead panel.

Fields:

- `primaryText`: formatted beat-oriented string
- `secondaryText`: formatted clock-time string
- `displayBeat`: numeric beat position for deterministic tests
- `displaySeconds`: numeric seconds position for deterministic tests
- `source`: `idle-anchor | engine-authority | interpolated`

Validation:

- When idle, `displayBeat` must fall back to `renderStartTime`.
- While playing, display values must be derived from authoritative engine sample position plus renderer interpolation, not a free-running wall-clock estimate.
- Start/stop/locate/loop discontinuities must snap to the new authority state instead of smoothing across incorrect intermediate positions.

## SelectionDisplayState

Represents the visible selection panel.

Fields:

- `startText`
- `endText`
- `durationText`
- `hasSelection`: boolean

Validation:

- Placeholder text must be shown consistently when no valid selection range exists.
- Duration must only show a positive value when `renderEndTime > renderStartTime`.

## BlueLiveToolbarState

Represents the Blue Live button group.

Fields:

- `runEnabled`
- `recompileEnabled`
- `allNotesOffEnabled`
- `midiInputEnabled`
- `runActive`
- `availabilityReason`: optional string

Validation:

- Controls without backing behavior must expose a non-empty `availabilityReason`.
- The group must still render even when all actions are disabled.

## NativeMenuCommand

Represents a main-process menu action forwarded into the renderer.

Fields:

- `type`: `focus-panel | reset-layout`
- `panelId`: optional panel identifier

Relationships:

- Created by native `Window` menu click handlers
- Consumed by renderer IPC listeners and `useWorkbenchStore`

Validation:

- `focus-panel` commands must reference known shared panel descriptors.
- Commands must be idempotent and safe when no project is loaded.

## WindowTitleState

Represents the BrowserWindow title.

Fields:

- `appName`: fixed `Blue`
- `fileName`: basename of the current `.blue` file or `null`
- `displayTitle`: either `Blue` or `Blue - [fileName]`

Validation:

- The title must update after open and save-as flows.
- Renderer toolbar content must not reintroduce the same identity text redundantly.
