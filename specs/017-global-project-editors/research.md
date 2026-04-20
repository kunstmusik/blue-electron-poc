# Research Notes: Global And Project Editors

## Scope

Planning-phase research baseline for feature `017-global-project-editors`. This slice implements three existing editor-area tabs in the Electron workbench:

- `GlobalOrchestraTopComponent`
- `GlobalScoreTopComponent`
- `ProjectPropertiesTopComponent`

The slice is intentionally limited to basic working editor and form behavior. Monaco integration, grammar-aware code editing, and tree-sitter-backed Csound tooling are explicitly deferred.

## Inputs

- Spec 017 definition in `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/spec.md`
- Current Electron workbench implementation:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/PlaceholderPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- TypeScript data model:
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/global-orc-sco.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.ts`
- Java reference implementation:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalOrchestraTopComponent.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalScoreTopComponent.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/ProjectPropertiesTopComponent.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/ProjectInformationPanel.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/RealtimeRenderSettingsPanel.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/DiskRenderSettingsPanel.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/MediaPanel.java`

## Current Baseline

The three target panels already exist in the Electron panel registry, but they are still routed to a generic placeholder in `DockviewPanel.tsx`. The current project-loading path also exposes only summary metadata to the renderer:

- `project-loaded` currently sends `title`, `author`, `sampleRate`, `version`, and `filePath`
- `get-project-info` returns only summary fields
- `currentData` in the main process is already the canonical loaded `BlueData` document used for save and playback

That means the visible gap is not just missing UI panels. The missing bridge is a project-editor data path between `currentData` and the renderer.

## Java Source Signals

### Global Orchestra

`GlobalOrchestraTopComponent` is a project-bound text editor backed by `GlobalOrcSco.getGlobalOrc()`. It refreshes when the current project changes and disables editing when no project is present.

### Global Score

`GlobalScoreTopComponent` mirrors the same pattern for `GlobalOrcSco.getGlobalSco()`: project-bound text content, refresh-on-project-switch, and disabled state when no project is loaded.

### Project Properties

`ProjectPropertiesTopComponent` is a built-in tabbed surface with four core tabs:

- project information
- realtime render settings
- disk render settings
- media

It also loads plugin-provided `ProjectPluginEditor` tabs dynamically. Those plugin tabs are an extension mechanism rather than part of the minimum built-in surface.

## TypeScript Data Model Signals

### Already Present

- `GlobalOrcSco` already exposes `globalOrc` and `globalSco` with XML serialization in `@blue/data`
- `ProjectProperties` already includes:
  - `title`, `author`, `notes`
  - `sampleRate`, `ksmps`, `nchnls`
  - selected realtime settings such as `useZeroDbFS`, `zeroDbFS`, `advancedSettings`, and `completeOverride`

### Still Missing Compared To Java

The TypeScript `ProjectProperties` model currently lacks many Java fields used by the built-in `ProjectPropertiesTopComponent`, including:

- disk render fields such as `diskSampleRate`, `diskKsmps`, `diskChannels`, `fileName`, and related booleans
- media settings such as `mediaFolder` and `copyToMediaFileOnImport`
- several realtime booleans such as audio/midi toggles and warning/benchmark flags

That makes full built-in tab parity impossible without expanding the shared data model first.

## Decision 1: Main-process `currentData` remains canonical

**Decision**: The main process remains the canonical owner of the mutable current project document for this slice.

**Rationale**:

- Save already serializes `currentData`, so making the renderer authoritative would introduce a second source of truth.
- Playback already reads from `currentData`.
- The preload boundary is already the approved renderer access pattern.

**Alternatives considered**:

- Move the full project document into renderer state and push it back only on save: rejected because it complicates save/playback coherence and weakens the current Electron boundary.

## Decision 2: Add a narrow project-editor IPC surface

**Decision**: Add a bounded preload/main IPC surface for project-editor snapshot loading and patch updates.

**Rationale**:

- The renderer currently cannot read or mutate the fields needed by these panels.
- A narrow contract is safer and easier to test than exposing broad document objects.
- It matches the existing preload architecture.

**Alternatives considered**:

- Expand the current `project-loaded` event only and avoid explicit update handlers: rejected because edits still need a write path.
- Expose raw `BlueData` objects to the renderer: rejected because it breaks the current process boundary and increases mutation ambiguity.

## Decision 3: Use a basic text editor control for global code panels

**Decision**: Implement Global Orchestra and Global Score with a basic multiline code-editing surface in this slice.

**Rationale**:

- The user explicitly wants Monaco and tree-sitter deferred to the next spec.
- Java parity for this slice is about project-bound editing behavior, not advanced editor tooling.
- A simpler control reduces implementation risk while still replacing the placeholder.

**Alternatives considered**:

- Introduce Monaco immediately: rejected because it broadens scope into editor-tooling research and integration before the underlying panel/data path is in place.
- Keep placeholders until the richer editor lands: rejected because it delays useful project editing for no technical gain.

## Decision 4: Bound `ProjectPropertiesTopComponent` to built-in tabs only

**Decision**: Spec 017 should implement the built-in `ProjectProperties` tabs and explicitly defer plugin-provided `ProjectPluginEditor` tabs.

**Rationale**:

- The built-in tabs are part of the core Java surface and provide the main user value.
- Plugin tabs are an extensibility layer that can be added later without blocking the first useful implementation.
- Deferring plugin tabs keeps 017 implementable and reviewable.

**Alternatives considered**:

- Include plugin tabs now: rejected because it would expand scope into plugin discovery and per-plugin UI behavior.
- Implement only a single flat properties form: rejected because it diverges unnecessarily from the Java tabbed structure.

## Decision 5: Expand `@blue/data` where built-in tabs need missing fields

**Decision**: The TypeScript `ProjectProperties` class should be expanded to cover the Java-backed fields required by the chosen built-in tabs.

**Rationale**:

- These are persistent project fields, so the shared data package is the correct home.
- The constitution requires serialization correctness for data-layer changes.
- A UI-only shadow model would create drift and break save/reopen behavior.

**Alternatives considered**:

- Implement reduced tabs that only cover already ported fields: rejected because it would create a visibly partial surface for no architectural benefit when the missing fields are well-defined in Java.

## Decision 6: Extend the existing renderer project store instead of adding a second project-document store

**Decision**: Evolve the existing `project-store` into the renderer-side editable project snapshot used by these three panels.

**Rationale**:

- The existing store already owns project load/save/dirty metadata and is the natural place to hydrate these panels.
- `title`, `author`, and `sampleRate` already live there, so extending it avoids dual-store synchronization for the same project metadata.
- The renderer store remains a projection of main-process state, not a replacement for it.

**Alternatives considered**:

- Add a separate `project-editor-store`: rejected because it would duplicate shared fields immediately and add synchronization work before it delivers value.

## Recommended Panel Scope For 017

### Included

- `GlobalOrchestraTopComponent`
  - project-bound multiline editor
  - disabled empty state when no project is loaded
- `GlobalScoreTopComponent`
  - project-bound multiline editor
  - disabled empty state when no project is loaded
- `ProjectPropertiesTopComponent`
  - tabbed built-in surface
  - project information
  - realtime render settings
  - disk render settings
  - media

### Deferred

- plugin-provided `ProjectPluginEditor` tabs
- Monaco
- syntax highlighting
- diagnostics and parsing
- tree-sitter-backed Csound tooling

## Risks And Assumptions

- Extending `ProjectProperties` touches shared serialization and may expose additional Java fields that deserve follow-on validation beyond the immediate UI slice.
- The current quit/save prompt behavior in Electron is still coarse and is not the target of this spec.
- Immediate patch-based updates from the renderer are acceptable for this slice because the edited surfaces are low-frequency, document-style panels rather than high-throughput realtime controls.
