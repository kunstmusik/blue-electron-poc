# Contract: Project Editor IPC

## Purpose

Define the preload/main-process contract that exposes the current project's global orchestra, global score, and built-in project-properties data to the renderer workbench panels.

## Scope

This contract is internal to the Electron app. It covers only the data needed by:

- `GlobalOrchestraTopComponent`
- `GlobalScoreTopComponent`
- `ProjectPropertiesTopComponent`

## Renderer Reads

### `getProjectDocument()`

Returns the current editor snapshot for the active project.

#### Response

- `null` when no project is loaded
- otherwise:

```ts
{
  filePath: string | null;
  version: string;
  globalOrc: string;
  globalSco: string;
  projectProperties: {
    title: string;
    author: string;
    notes: string;
    sampleRate: string;
    ksmps: string;
    nchnls: string;
    useZeroDbFS: boolean;
    zeroDbFS: string;
    advancedSettings: string;
    completeOverride: boolean;
    // plus any supported disk/media built-in fields for this slice
  };
}
```

## Renderer Events

### `project-loaded`

The existing project-loaded event is extended or complemented so the renderer can hydrate both summary metadata and the editor snapshot when a project is opened or replaced.

#### Required behavior

- include enough data to hydrate the three target panels
- preserve the current summary fields already used by the menu bar and load flow

## Renderer Writes

### `updateProjectDocument(patch)`

Applies a narrow patch to the canonical current project document in the main process.

#### Request

```ts
{
  globalOrc?: string;
  globalSco?: string;
  projectProperties?: Partial<{
    title: string;
    author: string;
    notes: string;
    sampleRate: string;
    ksmps: string;
    nchnls: string;
    useZeroDbFS: boolean;
    zeroDbFS: string;
    advancedSettings: string;
    completeOverride: boolean;
    // plus any supported disk/media built-in fields for this slice
  }>;
}
```

#### Required behavior

- reject empty patches
- ignore unsupported keys
- mutate canonical `currentData` only when a project is loaded
- allow frequent small updates from text fields and form controls

## Non-Goals

- exposing raw `BlueData` or `ProjectProperties` objects directly to the renderer
- implementing plugin-provided `ProjectProperties` tabs
- introducing Monaco, syntax-aware parsing, or editor diagnostics
