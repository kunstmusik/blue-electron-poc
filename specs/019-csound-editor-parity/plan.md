# Implementation Plan: Csound Editor Java Blue Parity

**Branch**: `019-csound-editor-parity` | **Date**: 2026-04-22 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/spec.md`

## Summary

Build the next layer on top of the CodeMirror editor selected in spec 018: reliable editor clipboard actions, Java Blue-style Csound editor context menu insertions, and a first completion/hint parity pass grounded in the Java sources. Global Orchestra remains the implementation surface, but the work must be structured as reusable Csound editor behavior for Global Score and future code panels.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages
**Primary Dependencies**: CodeMirror 6 (`codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/autocomplete`), `@kunstmusik/codemirror-lang-csound`, Radix Context Menu already present in `@blue/app`, existing `@blue/data` project model
**Storage**: Existing project snapshot and `.blue` XML serialization for Global Orchestra; optional code repository data remains read-only or deferred unless the Java-backed format can be safely ported in this slice
**Testing**: Vitest renderer tests, existing app tests, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `git diff --check`
**Target Platform**: Electron desktop renderer on macOS first, with cross-platform keyboard shortcut semantics (`Cmd` on macOS, `Ctrl` elsewhere)
**Project Type**: Desktop application renderer feature
**Performance Goals**: Context menu should open interactively; completion providers should avoid blocking the renderer and should not scan more than the active document plus available static/project metadata per request
**Constraints**: Preserve project load/edit/save behavior, do not reintroduce global shortcut conflicts inside text editors, keep Java Blue parity source-traceable, avoid a broad Code Repository editor implementation unless strictly needed for menu parity
**Scale/Scope**: One primary editor surface (`GlobalOrchestraTopComponent`) plus reusable editor helpers for future Csound text surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. The slice is primarily renderer editor behavior; any project-aware completions must consume `@blue/data` without moving business logic into React components.
- **Backwards-Compatible Serialization**: PASS. Global Orchestra edits must continue through the existing project-store path and `.blue` serialization; no format changes are planned.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No JVM-backed score generation behavior is altered.
- **Engine as External Process**: PASS. Engine integration is not changed.
- **Test-First for Serialization**: PASS/N/A. No new data serialization class is introduced; existing save/reopen behavior remains a validation target.
- **Research Integration**: PASS. Java Blue source findings are recorded in `research.md` and drive the task list.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── csound-editor-parity-surface.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/
├── CsoundEditorContextMenu.tsx
├── SelectedCodeEditor.tsx
├── csound-completions.ts
├── csound-editor-actions.ts
├── csound-editor-language.ts
├── csound-editor-menu.ts
├── csound-java-blue-completions.ts
└── editor-adapter-types.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/
└── GlobalOrchestraPanel.tsx

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/
└── use-keyboard-shortcuts.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
└── main.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── app.test.ts
├── csound-editor-parity.test.ts
└── project-editor-panels.test.ts
```

**Structure Decision**: Keep all editor-specific parity code under the existing `panels/editors/` adapter boundary. `GlobalOrchestraPanel` should consume a richer editor prop/interface, not own menu construction or completion source details.

## Complexity Tracking

No constitution violations are required.

## Phase 0 Research Output

See `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/research.md`.

## Phase 1 Design Output

- `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/data-model.md`
- `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/contracts/csound-editor-parity-surface.md`
- `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/quickstart.md`

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The data model separates editor commands/menu metadata from React rendering.
- **Backwards-Compatible Serialization**: PASS. No `.blue` schema changes are planned.
- **Research Integration**: PASS. Java file references are included in research and task prerequisites.
