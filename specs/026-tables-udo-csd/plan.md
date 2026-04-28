# Implementation Plan: Tables, UDO, and CSD Generation Editors

**Branch**: `026-tables-udo-csd` | **Date**: 2026-04-28 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/spec.md](/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/spec.md`

## Summary

Replace the Tables and UDO placeholders with project-backed editors and add Java Blue-style Project menu CSD generation actions. Tables uses the existing selected Csound editor surface for score/F-table text. Project UDO editing reuses and factors the Spec 021 BSB UDO table/editor work into a reusable project-level UDO surface, backed by root `BlueData.opcodeList` snapshots and patches. CSD generation uses `@blue/data` `BlueData.toCSD()` in the main process, exposes native Project menu actions before Window, moves existing Playback menu actions into Project, and shows generated CSD to screen in a read-only line-numbered CodeMirror modal.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data`  
**Primary Dependencies**: `@blue/data` `Tables`/`OpcodeList`/`OpcodeDefinition`/`BlueData.toCSD()`, Zustand 5.x project store, Dockview 5.2.0 panel registry, existing CodeMirror 6 `SelectedCodeEditor`, existing Java Blue-style Csound context menu/completion helpers, Radix Context Menu for renderer menus, Electron `Menu`/`dialog`/`BrowserWindow` for native menu and save/modal flows, Spec 021 BSB UDO components as reuse source  
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer consumes serializable project snapshots and sends explicit project document patches; `.blue` XML remains persistence; generated `.csd` files are user-selected disk outputs only  
**Testing**: Vitest unit/renderer tests, `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, IPC/menu unit coverage where practical, `git diff --check`  
**Target Platform**: Electron desktop renderer on macOS first, with native menu behavior kept cross-platform  
**Project Type**: Desktop application renderer + shared data-model + Electron main/preload feature  
**Performance Goals**: Tables and UDO editors should hydrate instantly for typical project data; generated CSD screen modal should handle normal project-sized output without blocking ongoing UI after generation completes; editor typing should remain responsive with debounced/batched project patches where needed  
**Constraints**: Preserve `.blue` compatibility; keep `blue-data` UI-free and Node-free; defer User UDO library; keep generated CSD text read-only in screen modal; do not replace the existing Csound editor system; keep native menu labels/order close to Java Blue  
**Scale/Scope**: Two workbench panels (`TablesTopComponent`, `UserDefinedOpcodeTopComponent`), root project Tables/UDO snapshot and patch expansion, one generated CSD modal surface, Project menu migration for CSD and playback/render actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. `Tables`, `OpcodeList`, UDO conversion, and CSD generation remain in `@blue/data`; React components render snapshots and dispatch patch intents.
- **Backwards-Compatible Serialization**: PASS with required round-trip tests. Tables and root UDO XML behavior must preserve Java-compatible `.blue` load/save.
- **JVM Dependencies Preserved, Not Replaced**: PASS. User UDO library and non-project repository workflows are deferred, not reimplemented.
- **Engine as External Process**: PASS. Runtime engine protocol is not changed; menu render/playback commands continue using existing main-process paths.
- **Test-First for Serialization**: PASS. Tables and UDO data changes require XML round-trip coverage before renderer completion.
- **Research Integration**: PASS. Java sources and reuse decisions are captured in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tables-udo-csd-surface.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── tables.ts
├── blue-data.ts
├── opcodes/
│   ├── opcode-list.ts
│   ├── opcode-definition.ts
│   └── udo-style.ts
└── [new or expanded tests near touched data files]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
└── main.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
└── project-store.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/
├── menu-bar/
│   └── [native menu-triggered CSD modal integration if renderer-owned]
└── workbench/
    ├── DockviewPanel.tsx
    └── panels/
        ├── TablesPanel.tsx
        ├── UserDefinedOpcodePanel.tsx
        ├── GeneratedCsdModal.tsx
        ├── editors/
        │   └── [reuse SelectedCodeEditor and context menu helpers]
        └── udo/
            ├── ProjectUdoPanel.tsx
            ├── UdoTable.tsx
            ├── UdoEditor.tsx
            └── [shared UDO helpers factored from BSB UDO components]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── tables-panel.test.tsx
├── udo-panel.test.tsx
├── project-menu-csd.test.tsx
└── generated-csd-modal.test.tsx
```

**Structure Decision**: Keep data compatibility and generation behavior in `@blue/data`; extend the existing project editor snapshot/patch bridge rather than adding independent Tables/UDO IPC; factor reusable UDO UI from the BSB editor into a project-level UDO panel; keep generated CSD display renderer-owned but generation/save actions main-process-owned.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/research.md](/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/data-model.md](/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/contracts/tables-udo-csd-surface.md](/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/contracts/tables-udo-csd-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/quickstart.md](/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Snapshot/patch design keeps React free of direct data mutation and keeps XML/generation in `@blue/data`/main process.
- **Backwards-Compatible Serialization**: PASS. Data model requires Tables and root UDO round-trip tests and no schema rewrite beyond compatibility fixes.
- **JVM Dependencies Preserved, Not Replaced**: PASS. User UDO library and repository import behavior are documented deferrals if unsafe in this slice.
- **Engine as External Process**: PASS. Playback command relocation does not alter engine protocol.
- **Test-First for Serialization**: PASS. Tasks must include data tests before renderer integration.
- **Research Integration**: PASS. Research documents Java anchors, context menu behavior, UDO component reuse, and CSD generation modal behavior.
