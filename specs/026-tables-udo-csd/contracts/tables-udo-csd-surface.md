# Contract: Tables, UDO, and CSD Generation Surface

## Workbench Panel Contract

### `TablesTopComponent`

- Must render a real editor when a project is loaded.
- Must render an empty read-only state when no project is loaded.
- Must bind to `ProjectEditorSnapshot.tablesText`.
- Must dispatch `ProjectDocumentPatch.tablesText` updates.
- Must use Java Blue-style Csound editor context menu behavior.

### `UserDefinedOpcodeTopComponent`

- Must render a project UDO list and selected UDO editor when a project is loaded.
- Must render an empty/no-project state when no project is loaded.
- Must bind to `ProjectEditorSnapshot.projectUdos`.
- Must support selected row routing to an editor with:
  - name field
  - style selector
  - classic out/in types
  - modern input arguments/out types
  - Code tab
  - Comments tab
  - generated opcode preview action
- Must not imply User UDO library support unless that area is explicitly marked deferred.

## Project Document Patch Contract

```ts
interface ProjectDocumentPatch {
  tablesText?: string;
  projectUdo?: ProjectUdoPatch;
}

type ProjectUdoPatch =
  | { type: 'add'; index?: number; definition?: ProjectUdoSnapshot }
  | { type: 'remove'; index: number }
  | { type: 'update'; index: number; patch: Partial<ProjectUdoSnapshot> }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'convertStyle'; index: number; style: 'CLASSIC' | 'MODERN' };
```

Implementation may choose equivalent names, but the contract must preserve these capabilities and keep root project UDO mutations separate from BSB embedded UDO mutations.

## Native Menu Contract

Menu order must place `Project` before `Window`.

Project menu must include:

- `Generate CSD to Screen`
- `Generate CSD to Disk`
- existing playback/render actions currently under `Playback`, renamed/grouped close to Java Blue where practical

Project-dependent actions must be disabled or safely rejected when no project is loaded.

## Generated CSD Contract

### Screen

- Input: current main-process project document.
- Output: generated CSD text displayed in a read-only modal editor.
- Editor requirements:
  - line numbers visible
  - Csound syntax highlighting
  - selection and copy support
  - close action
  - no mutation of project data

### Disk

- Input: current main-process project document plus user-selected output path.
- Output: `.csd` file containing generated CSD text.
- Path rules:
  - append `.csd` if omitted
  - preserve explicit `.csd`
  - handle cancellation without mutation
  - report write errors

## Test Contract

- Data tests must cover Tables and UDO XML round-trips before renderer tests are considered complete.
- Renderer tests must cover no-project states, editor hydration, mutation dispatch, context menu availability, modal display, and menu placement.
- Build validation must include `pnpm --filter @blue/app build` because native menu/preload typing failures often appear at build time.
