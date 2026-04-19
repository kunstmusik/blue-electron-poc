# blue-electron Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-18

## Active Technologies
- React 19.x, Electron, dockview 5.2.0 + collapsed auxiliary-group planning for the workbench shell (013-collapsed-sidebar-research)
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/store code + `dockview` 5.2.0 / `dockview-core` 5.2.0, Zustand 5.x, Vitest 4.x, existing workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench` (014-window-system-parity)
- Renderer-side localStorage layout envelope for the parity slice, combining dockview JSON with supplemental minimized-edge metadata (014-window-system-parity)

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
- 014-window-system-parity: Added TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/store code + `dockview` 5.2.0 / `dockview-core` 5.2.0, Zustand 5.x, Vitest 4.x, existing workbench shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
- 013-collapsed-sidebar-research: Planned a dockview-backed collapsed auxiliary-group prototype; paneview is not the primary host path
