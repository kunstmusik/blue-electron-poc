# blue-electron Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-24

## Active Technologies
- TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data` + `PresetGroup`/`Preset` BSB preset model, Zustand 5.x project store with BSB interface/opcode-list patch support, Dockview 5.2.0, CodeMirror 6, `BsbInterfacePatch` union type for structured BSB mutations (022-bsb-interface-parity)
- BSB Interface tab now renders an editable widget canvas with selection, property-sheet editing, grid settings, preset application, and Java-style split-view UDO editor (UDOTable + UDOEditor); snapshot contract extended with `widgetTree`, `gridSettings`, `editEnabled`, `presetGroup`, `opcodeListText`; widget-specific rendering (Slider, Knob, Toggle, etc.) deferred to SPEC 023 (022-bsb-interface-parity)

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
- 022-bsb-interface-parity: Added BSB editing infrastructure including editable interface canvas with selection, property-sheet editing, grid settings panel, preset application bar, Java-style split-view UDO editor (UDOTable + UDOEditor), preset model (PresetGroup/Preset), BSB interface/opcode-list patch support, and snapshot contract extensions; widget-specific rendering (Slider, Knob, Toggle, etc.) deferred to SPEC 023
