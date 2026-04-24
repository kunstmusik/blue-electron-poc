# blue-electron Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-23

## Active Technologies
- React 19.x, Electron, dockview 5.2.0 + collapsed auxiliary-group planning for the workbench shell (013-collapsed-sidebar-research)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/store code + `dockview` 5.2.0 / `dockview-core` 5.2.0, Zustand 5.x, Vitest 4.x, existing workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench` (014-window-system-parity)
- Renderer-side localStorage layout envelope for the parity slice, combining dockview JSON with supplemental minimized-edge metadata (014-window-system-parity)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/store code + `dockview` 5.2.0 / `dockview-core` 5.2.0, Zustand 5.x, Vitest 4.x, current workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench` (015-left-edge-parity)
- Renderer-side localStorage layout envelope for the parity slice, migrated from version 4 to version 5 instance-based auxiliary state (015-left-edge-parity)
- Markdown planning documents derived from TypeScript 5.8.x renderer code and Java NetBeans sources + Java Blue `TopComponent` registrations and window-manager metadata, current React 19 / Electron 35 / Dockview 5.2.0 renderer implementation, candidate UI approaches under study: Radix primitives, shadcn/ui-style wrappers, and Electron-native menus (016-component-system-research)
- Repository documentation only (`specs/016-component-system-research/`) (016-component-system-research)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages + `@blue/data`, React 19, Zustand 5.x, `dockview` 5.2.0, Vitest 4.x, existing Electron preload/main IPC bridge (017-global-project-editors)
- Main-process in-memory `currentData` plus `.blue` XML serialization through `@blue/data`; renderer mirrors an editable snapshot for the active projec (017-global-project-editors)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages + `@blue/data`, React 19, Zustand 5.x, `dockview` 5.2.0, Vitest 4.x, CodeMirror 6 via `codemirror`, `@codemirror/autocomplete`, `@codemirror/state`, `@codemirror/view`, plus `@kunstmusik/codemirror-lang-csound`; Monaco and `tree-sitter-csound` are deferred fallback/research inputs (018-csound-editor-tooling)
- Main-process in-memory current project document plus existing `.blue` XML serialization through `@blue/data`; renderer edits flow through the existing project snapshot/store bridge (018-csound-editor-tooling)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages + CodeMirror 6 (`codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/autocomplete`), `@kunstmusik/codemirror-lang-csound`, Radix Context Menu already present in `@blue/app`, existing `@blue/data` project model (019-csound-editor-parity)
- Existing project snapshot and `.blue` XML serialization for Global Orchestra; optional code repository data remains read-only or deferred unless the Java-backed format can be safely ported in this slice (019-csound-editor-parity)
- 019-csound-editor-parity now includes a reusable `SelectedCodeEditor` surface with renderer-owned context menus, Java Blue-style completion sources, and deferred project-level UDO support
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages + Electron `Menu`/`BrowserWindow`, Zustand 5.x stores, `@blue/data` time/tempo utilities, `dockview` 5.2.0 workbench state, `lucide-react` transport icons (020-main-toolbar-parity)
- Existing renderer Zustand stores plus project snapshot IPC; optional lightweight renderer preference persistence for toolbar-only toggles via existing local storage patterns (020-main-toolbar-parity)
- Existing renderer Zustand stores plus project snapshot IPC; fixed-per-performance playback clock metadata cached in the renderer playback store; optional lightweight renderer preference persistence for toolbar-only toggles via existing local storage patterns (020-main-toolbar-parity)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data` + `@blue/data`, Zustand 5.x project store, Dockview 5.2.0 workbench panel registry, CodeMirror 6 editor surface from specs 018/019, Radix Context Menu, proposed `@tanstack/react-table` for arrangement table behavior, existing `@tanstack/react-virtual` if large table virtualization becomes necessary (021-orchestra-editor)
- Main-process in-memory `BlueData` remains canonical; renderer consumes serializable project/orchestra snapshots and sends explicit patch intents through the existing project document IPC bridge; `.blue` XML remains the persistence forma (021-orchestra-editor)

- TypeScript 5.x, strict mode + `@rgrove/parse-xml` (XML parsing), `vitest` (testing), `esbuild` (bundling for Electron) 

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x, strict mode: Follow standard conventions

<!-- MANUAL ADDITIONS START -->
## Java-First Debugging Guidance

- For behavior mismatches, render failures, XML-compatibility issues, or formatting/parity bugs in the TypeScript port, consult the Java implementation first before changing TypeScript code.
- Primary reference roots: `~/work/nbprojects/blue/blue-core` and `~/work/nbprojects/blue/blue-ui-core`.
- When applicable, compare against Java-generated artifacts first, especially `~/work/blue/demo2026/01.csd`, and only keep a TypeScript-side divergence if it is intentional and documented.
<!-- MANUAL ADDITIONS END -->

## Recent Changes
- 021-orchestra-editor: Added TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data` + `@blue/data`, Zustand 5.x project store, Dockview 5.2.0 workbench panel registry, CodeMirror 6 editor surface from specs 018/019, Radix Context Menu, proposed `@tanstack/react-table` for arrangement table behavior, existing `@tanstack/react-virtual` if large table virtualization becomes necessary
- 020-main-toolbar-parity: Closed out the main toolbar parity slice after finalizing playhead/selection alignment and the toolbar/editor context-menu styles
- 020-main-toolbar-parity: Added Java Blue-style main toolbar, native File/Window menu handling, engine-authoritative playhead interpolation, and window title parity
