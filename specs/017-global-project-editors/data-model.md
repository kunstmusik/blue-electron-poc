# Data Model: Global And Project Editors

## Overview

This slice introduces a renderer-visible project-editor snapshot backed by the canonical current project document in the Electron main process. It also expands the shared `ProjectProperties` data model where built-in Java tabs require fields that are not yet present in TypeScript.

## Entity: ProjectEditorSnapshot

- **Purpose**: Renderer-side snapshot of the current project fields needed by `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, and `ProjectPropertiesTopComponent`.
- **Fields**:
  - `filePath`: current file path or `null`
  - `version`: loaded project version
  - `globalOrc`: current global orchestra text
  - `globalSco`: current global score text
  - `projectProperties`: current editable `ProjectPropertiesSnapshot`
  - `loaded`: whether a project is currently loaded
- **Validation**:
  - when `loaded` is `false`, all editor surfaces must render a non-editable empty state
  - when `loaded` is `true`, `projectProperties` must be present

## Entity: ProjectPropertiesSnapshot

- **Purpose**: Renderer-editable representation of the built-in `ProjectPropertiesTopComponent` fields supported in this slice.
- **Groups**:
  - `projectInformation`
    - `title`
    - `author`
    - `notes`
  - `realtimeRender`
    - `sampleRate`
    - `ksmps`
    - `nchnls`
    - `useZeroDbFS`
    - `zeroDbFS`
    - `advancedSettings`
    - `completeOverride`
    - any Java-backed booleans included for the built-in realtime section
  - `diskRender`
    - Java-backed disk render fields required for the built-in disk tab
  - `media`
    - `mediaFolder`
    - `copyToMediaFileOnImport`
- **Validation**:
  - field names must map to `@blue/data` `ProjectProperties` fields
  - serialized XML names must remain Java-compatible

## Entity: ProjectDocumentPatch

- **Purpose**: Narrow update payload sent from renderer to main process when one of the three editor surfaces changes.
- **Fields**:
  - optional `globalOrc`
  - optional `globalSco`
  - optional `projectProperties` partial update
- **Validation**:
  - at least one field must be present
  - partial `projectProperties` updates must only include supported keys

## Entity: ProjectPanelMode

- **Purpose**: Represents the visible state of each target panel relative to current project availability.
- **States**:
  - `empty-disabled`
  - `loaded-clean`
  - `loaded-dirty`
- **Validation**:
  - `empty-disabled` is required whenever no project is open
  - renderer dirty state must transition to `loaded-dirty` after a successful local edit

## Relationships

- One `ProjectEditorSnapshot` contains one `ProjectPropertiesSnapshot`.
- One `ProjectDocumentPatch` mutates one canonical main-process current project document.
- The renderer `project-store` mirrors one `ProjectEditorSnapshot` at a time.
- `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, and `ProjectPropertiesTopComponent` all read from the same snapshot and dispatch patches against the same current project.

## State Transitions

### Load Flow

1. No project loaded
2. Main process opens `.blue` file into canonical `currentData`
3. Main process derives `ProjectEditorSnapshot`
4. Renderer hydrates `project-store`
5. Panels move from `empty-disabled` to `loaded-clean`

### Edit Flow

1. User edits one panel
2. Renderer updates local `project-store`
3. Renderer sends `ProjectDocumentPatch`
4. Main process mutates canonical `currentData`
5. Renderer marks project state dirty

### Save Flow

1. Renderer invokes existing save flow
2. Main process serializes canonical `currentData`
3. Save completes without needing panel-specific export logic
4. Renderer marks project state clean

### Project Switch Flow

1. New project is opened
2. Main process replaces canonical `currentData`
3. Main process emits fresh snapshot
4. Renderer replaces panel state wholesale
5. All three panels reflect the newly opened project

## Serialization Notes

- `GlobalOrcSco` is already serialized and only needs panel access, not schema changes.
- `ProjectProperties` is the likely serialization delta for this feature.
- Any added TypeScript fields must use Java-compatible XML field names and round-trip coverage in `@blue/data` tests.
