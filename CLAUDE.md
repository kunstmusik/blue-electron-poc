# blue-electron Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-24

## Active Technologies
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data` + Existing `@blue/data` BlueSynthBuilder model and BSB widget classes, existing `@blue/app` Orchestra/BSB editor shell from Spec 021, Zustand 5.x project store, CodeMirror 6 BSB code editors, current renderer styling/utilities, and Java Blue BSB reference sources under `/Users/stevenyi/work/nbprojects/blue` (021-orchestra-editor)
- Main-process in-memory `BlueData` remains canonical; renderer consumes serializable BSB interface/preset snapshots and dispatches explicit patch intents through the existing project document IPC bridge; `.blue` XML remains the persistence forma (021-orchestra-editor)

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
- 021-orchestra-editor: Added TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data` + Existing `@blue/data` BlueSynthBuilder model and BSB widget classes, existing `@blue/app` Orchestra/BSB editor shell from Spec 021, Zustand 5.x project store, CodeMirror 6 BSB code editors, current renderer styling/utilities, and Java Blue BSB reference sources under `/Users/stevenyi/work/nbprojects/blue`
