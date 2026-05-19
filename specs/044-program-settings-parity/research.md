# Research: Program Settings Parity

## Decision: Active Panel Set Comes From Java `layer.xml`

Java `blue-settings/src/main/resources/blue/settings/layer.xml` registers six active advanced options under `BlueOptionsCategory`: General, Project Defaults, Playback, Utility, Realtime Render, and Disk Render. These are the panels this feature must implement.

**Rationale**: Resource bundle strings also mention Text Settings, but no active Text Settings controller or panel is registered in `blue-settings`. Implementing Text Settings from stale bundle strings would create a panel Java Blue does not currently expose through this package.

**Alternatives considered**:
- Implement every bundle string, including Text Settings: rejected because it would overstate parity and invent source behavior.
- Treat current TS MIDI/OSC placeholders as Java settings panels: rejected because they came from Blue Live planning, not Java `blue-settings`.

## Decision: Main Process Owns Java-Compatible Program Settings

Store Java-compatible program settings in a main-process settings store loaded at app startup and persisted as app-wide JSON. The renderer Settings window edits snapshots through preload/IPC.

**Rationale**: Program settings affect workflows owned by the main process: new project creation, realtime command construction, disk CSD/render behavior, settings window lifecycle, and future utility commands. The current renderer-only persisted Zustand store is not available early enough or safely enough for those workflows.

**Alternatives considered**:
- Keep all settings in renderer localStorage: rejected because main process workflows would keep using hard-coded defaults unless every operation round-tripped through the renderer.
- Store settings in `.blue` files: rejected because Java Blue program settings are app-wide and only seed project-owned fields on new project creation.
- Add settings to `@blue/data`: rejected because settings persistence is app/runtime state, not portable project data, and should not introduce Node file I/O into `@blue/data`.

## Decision: Preserve Current-App Settings Through Classification And Migration

Classify existing saved values as Java-compatible program settings or app-specific preferences. Engine path is app-specific unless explicitly mapped to a Csound executable field; recent files and window bounds remain app-specific; MIDI/OSC placeholders remain Blue Live/app-specific unless a later spec maps them to concrete Java workflows.

**Rationale**: The current `blue-settings` persisted store already contains user values. Silently dropping it would be a regression, while blindly merging it into Java settings would create ambiguous active values.

**Alternatives considered**:
- Delete the old renderer settings store: rejected because it can lose recent files, bounds, and placeholder values.
- Treat engine path as Java Csound executable: rejected because the current field points at `blue-engine`, while Java settings point at `csound`.

## Decision: Apply Java Project Defaults In `newFile()`

When creating a new project, apply saved Project Defaults, Realtime Render defaults, and Disk Render defaults to the newly created `BlueData` before sending the project snapshot to the renderer.

**Rationale**: Java `BlueProjectManager.createNewProject()` applies these settings immediately after constructing `BlueData`. Existing TypeScript `newFile()` currently constructs `BlueData` and sends hard-coded summary values, so new project parity belongs in this creation path.

**Alternatives considered**:
- Change `BlueData` constructor defaults to program settings: rejected because `@blue/data` cannot read app settings and tests instantiate `BlueData` for pure data behavior.
- Apply defaults after the renderer receives the project: rejected because the main process is canonical for project data.

## Decision: Realtime Settings Must Feed Existing Engine Option Construction

Program realtime settings should be consumed by existing realtime option construction instead of creating a parallel render path. This includes message colors, display disabling, audio/MIDI driver/device flags, buffer flags, command/executable selection where compatible with blue-engine, advanced settings, and render-method limitations.

**Rationale**: Existing playback already calls `BlueData.toRealtimePlaybackCSD()` and feeds options into `EngineBridge`. Java parity requires changing the option source, not replacing the engine architecture.

**Alternatives considered**:
- Spawn Csound directly for realtime playback: rejected because the app constitution requires engine-as-external-process via blue-engine.
- Only seed project realtime settings and ignore program runtime settings: rejected because Java Blue uses both program-level realtime command settings and project-level flags.

## Decision: Usage Parity Matrix Is A First-Class Deliverable

Add a usage parity matrix artifact/source module that lists each Java setting, Java usage, current implementation status, and missing-feature dependency when applicable. Expose it in tests and optionally in the Settings UI for blocked settings.

**Rationale**: The user explicitly requested that settings be checked for actual use and that major missing features be reported. A matrix gives implementers and reviewers a concrete completeness checklist.

**Alternatives considered**:
- Leave missing-feature notes only in this spec: rejected because implementation can drift without executable or reviewable status.
- Hide blocked settings: rejected because users still need to see configured defaults, and maintainers need explicit follow-up scope.

## Decision: Disk Render Execution May Need A Follow-Up Spec

This feature should connect settings to existing disk CSD generation where possible and report any missing Java-style disk render execution, render-and-play, and render-and-open workflow as a follow-up dependency.

**Rationale**: The repository has disk CSD generation and export helpers, but Java Blue disk render settings include executing Csound, output format flags, render service selection, and external open/play commands. If those execution flows are not complete, settings parity cannot honestly mark them "used".

**Alternatives considered**:
- Implement full disk render execution inside this settings feature: rejected if it expands beyond settings/default usage and deserves its own feature spec.
- Mark disk settings complete once editable: rejected because the user asked that settings be used as in Java Blue.

## Decision: Utility Settings Are Editable But Dependency-Tracked Until Utility Workflows Exist

Implement Utility settings persistence and UI, then wire them only to available workflows. SoundObject freeze/unfreeze and SoundFont utility consumption must be reported as missing dependencies if not implemented.

**Rationale**: Java Utility settings drive executable and freeze flags. Editable settings without consumers are useful as defaults but incomplete unless their workflow status is visible.

**Alternatives considered**:
- Defer the Utility panel entirely: rejected because the spec requests all active Java panels.
- Implement SoundObject freeze inside this settings slice: rejected if it requires broader score/render object workflows beyond settings parity.
