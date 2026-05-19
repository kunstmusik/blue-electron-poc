# Contract: Program Settings Surface

## Settings Window

Main-process behavior:
- `settings:open` opens or focuses the single modal Settings BrowserWindow.
- The Settings window can load and edit program settings without a loaded project.
- Closing the Settings window does not apply unsaved draft changes.

Renderer behavior:
- The left category list contains General, Project Defaults, Playback, Utility, Realtime Render, and Disk Render.
- Each category edits a draft copy of the full settings snapshot.
- Apply validates and persists the full snapshot.
- Cancel discards the draft and closes or reloads the last saved snapshot.
- Blocked settings remain visible with a non-blocking dependency note when their Java workflow is unavailable.

## Preload API

Add typed methods under `window.blueAPI`:

```ts
getProgramSettings(): Promise<ProgramSettingsSnapshot>;
saveProgramSettings(
  snapshot: ProgramSettingsSnapshot,
): Promise<ProgramSettingsSaveResult>;
resetProgramSettingsPanel(
  panel: ProgramSettingsPanelId,
): Promise<ProgramSettingsSnapshot>;
getProgramSettingsUsageMatrix(): Promise<UsageParityMatrixEntry[]>;
syncLegacyRendererSettings?(
  snapshot: CurrentAppSettingsSnapshot,
): Promise<ProgramSettingsSnapshot>;
```

Result shapes:

```ts
type ProgramSettingsPanelId =
  | 'general'
  | 'projectDefaults'
  | 'playback'
  | 'utility'
  | 'realtimeRender'
  | 'diskRender';

interface ProgramSettingsSaveResult {
  ok: boolean;
  snapshot?: ProgramSettingsSnapshot;
  validationIssues?: SettingsValidationIssue[];
}

interface SettingsValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}
```

## Main IPC Channels

- `program-settings:get`
  - Input: none.
  - Output: full ProgramSettingsSnapshot.
- `program-settings:save`
  - Input: full ProgramSettingsSnapshot.
  - Output: ProgramSettingsSaveResult.
- `program-settings:reset-panel`
  - Input: ProgramSettingsPanelId.
  - Output: full ProgramSettingsSnapshot after resetting that panel to Java-compatible defaults.
- `program-settings:usage-matrix`
  - Input: none.
  - Output: UsageParityMatrixEntry array.
- `program-settings:sync-legacy-renderer-settings`
  - Input: CurrentAppSettingsSnapshot.
  - Output: full ProgramSettingsSnapshot.

## Persistence Contract

- Main process loads settings before any project creation or playback operation.
- Missing settings file creates defaults.
- Unknown saved fields are ignored for active behavior and may be preserved only if the migration strategy explicitly supports it.
- Invalid saved values are replaced with defaults and recorded as warnings.
- Save is atomic enough that a failed write leaves the last valid in-memory snapshot active.

## New Project Application Contract

Function-level contract:

```ts
applyProgramSettingsToNewProject(
  data: BlueData,
  settings: ProgramSettingsSnapshot,
): void;
```

Required effects:
- Set project author from Project Defaults.
- Set mixer enabled state from Project Defaults.
- Set root score layer-group default height behavior from Project Defaults.
- Set score time-state primary/secondary ruler, snap, and SMPTE defaults.
- Set realtime project properties from Realtime Render defaults.
- Set disk project properties from Disk Render defaults.
- Do not persist app settings into project XML.

## Runtime Settings Usage Contract

Realtime option contract:

```ts
buildRealtimeEngineOptions(
  data: BlueData,
  projectDirectory: string | null,
  settings: ProgramSettingsSnapshot,
): string[];
```

Required behavior:
- Use General message color setting for `-+msg_color=false` behavior.
- Use Realtime Render display, driver, device, buffer, and advanced settings where compatible with the current engine path.
- Continue to include project-owned realtime message-level and audio/MIDI enablement flags.
- Return deterministic option ordering for tests.

Playback store contract:
- Initial `followPlayback` and `followPlaybackOnStart` come from saved ProgramSettingsSnapshot.
- Toggling native menu or toolbar follow states updates the saved Playback settings or an explicitly documented runtime preference field.
- Latency correction is applied when converting engine time to score/playhead position.

Disk render contract:
- Existing disk CSD export continues to generate CSD from project state.
- Any disk render execution helper uses Disk Render program settings for executable/format/sample/header/display/external command behavior.
- If full disk render execution is not implemented, usage matrix rows for those settings are marked `blocked-by-missing-feature`.

## Usage Matrix Contract

Every active Java setting must produce one UsageParityMatrixEntry.

Accepted statuses:
- `used-by-workflow`: a runtime/editor workflow consumes the setting.
- `used-as-new-project-default`: the setting seeds a new project or future project-owned item.
- `app-specific-retained`: a current app preference is retained but is not a Java setting.
- `resource-only-stale`: a Java resource string exists without an active panel/controller.
- `blocked-by-missing-feature`: Java workflow is not currently implemented and needs a follow-up spec.

The final matrix must include entries for stale Text Settings resources even though no active Settings panel is implemented for them.
