# Research Notes: Csound Editor Tooling

## Scope

Planning-phase research baseline for feature `018-csound-editor-tooling`. The scope changed on 2026-04-22: Monaco is no longer assumed mandatory. The slice must evaluate CodeMirror and Monaco, choose one editor path for Global Orchestra, and document how dynamic completions can be supplied.

## Inputs

- Spec 018 definition in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/spec.md`
- Current Electron implementation:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectTextEditorPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/vite.config.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json`
- Java reference implementation:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalOrchestraTopComponent.java`
- External references:
  - [CodeMirror homepage](https://codemirror.net/)
  - [CodeMirror autocompletion example](https://codemirror.net/examples/autocompletion/)
  - [CodeMirror reference manual](https://codemirror.net/docs/ref/)
  - [Monaco Editor API: `registerCompletionItemProvider`](https://microsoft.github.io/monaco-editor/typedoc/functions/editor_editor_api.languages.registerCompletionItemProvider.html)
  - User-supplied plugin: [@kunstmusik/codemirror-lang-csound](https://github.com/kunstmusik/codemirror-lang-csound)
  - User-supplied grammar candidate: [tree-sitter-csound](https://github.com/PasqualeMainolfi/tree-sitter-csound)

## Current Baseline

Spec 017 replaced the Global Orchestra placeholder with a basic project-bound multiline editor. That baseline already satisfies the important project-document behavior:

- `globalOrc` is hydrated into the renderer store when a project loads
- edits flow through `updateGlobalOrc`
- save/reopen behavior already persists the text correctly

That means 018 does not need a new data path. It needs a selected editor shell and a bounded language/completion strategy layered on the existing path.

## CodeMirror Candidate

### Source Signal

The supplied repository currently identifies the publishable package as `@kunstmusik/codemirror-lang-csound` version `1.0.2`. Its package surface exports CSD, ORC, and SCO language support and depends on CodeMirror 6 packages plus Lezer. The README describes syntax highlighting, indentation, folding, comment support, opcode autocomplete, semantic highlighting, and hover info. The package source exposes `csoundCompletionSource`, bare language exports, and `csound({ mode: "csd" | "orc" | "sco" })`.

### Dynamic Completion Support

CodeMirror’s autocomplete package supports completion sources that receive a completion context and return completion results. The official docs also state that sources may run asynchronously by returning a promise. Language packages can register completion sources through language data, and completion logic can inspect syntax trees.

### Strengths

- Csound-specific package already exists.
- The package is focused on the exact domain: CSD, ORC, and SCO.
- Existing package includes opcode completions and document-local UDO completion.
- CodeMirror has a modular extension model that fits a local adapter and future project/runtime completion sources.
- No Monaco worker setup is required.

### Risks

- The plugin is new and must still be verified inside this Electron/Vite workspace.
- CodeMirror’s UI and extension APIs are not identical to VS Code/Monaco, so some rich-editor expectations may require custom work.
- The app will need a local React wrapper/adaptor for CodeMirror lifecycle and theme integration.

## Monaco Candidate

### Source Signal

Monaco exposes a `registerCompletionItemProvider` API for editor suggestions. A provider can provide completion items for a model/position and can optionally resolve items later for details or documentation.

### Dynamic Completion Support

Dynamic completions are viable through `registerCompletionItemProvider`. A provider can compute suggestions from the current model, cursor position, project state, or asynchronously supplied data.

### Strengths

- Strong editor UX and familiar VS Code-like behavior.
- Mature completion-provider model.
- Good fit if future goals require a VS Code-like editor surface.

### Risks

- No existing Csound Monaco language package is available in this repo.
- Monaco introduces worker/bundling complexity in Vite/Electron.
- Csound support would require custom language registration, tree-sitter bridging, or a less capable fallback.
- Matching the Csound capability already present in the CodeMirror plugin would likely be more work.

## Tree-Sitter Role

`tree-sitter-csound` remains relevant, but its role changes:

- If CodeMirror is selected, the Lezer-based CodeMirror plugin may make tree-sitter unnecessary for 018.
- If Monaco is selected, tree-sitter may be one possible route to syntax-aware Csound support.
- If neither route gives enough language intelligence, tree-sitter may become a follow-on research/implementation slice.

The same renderer-safe constraints still apply: no native addon requirement in the shipped renderer path, reasonable build complexity, and bounded value for this slice.

## Decision Matrix

| Criterion | CodeMirror + `@kunstmusik/codemirror-lang-csound` | Monaco + custom/tree-sitter support |
|---|---|---|
| Csound language package | Strong existing package for CSD/ORC/SCO | No existing package in repo |
| Dynamic completions | Supported through completion sources; async sources are supported | Supported through completion item providers |
| Existing Csound completions | Opcode and document-local UDO completions already present | Must be built |
| Hover/help | Plugin includes hover support | Must be built |
| Folding/indentation | Plugin includes folding and indentation | Must be built or approximated |
| Electron/Vite risk | Lower expected risk, no Monaco workers | Higher expected risk due worker/bundling |
| Future reuse | Good if the project accepts CodeMirror as the code editor stack | Good if future work values VS Code-like editor behavior |
| Preliminary fit for 018 | Stronger fit | Viable but likely higher effort |

## Final Recommendation

Select CodeMirror for 018.

Rationale:

- It directly addresses the Csound language-support problem.
- It already has autocomplete, hover, folding, indentation, and semantic highlighting.
- Dynamic completions are supported by CodeMirror’s completion-source model.
- It avoids Monaco worker complexity while keeping the slice focused on Global Orchestra.
- `@kunstmusik/codemirror-lang-csound` installed cleanly in `@blue/app` at `1.0.2`.
- The selected CodeMirror implementation passes `pnpm --filter @blue/app test` and `pnpm --filter @blue/app build`.

Fallback:

- Monaco remains the fallback editor shell if future CodeMirror work hits a blocker, but it is not the preferred path for this slice because comparable Csound language support would need to be built.

## Implementation Outcome

The Global Orchestra editor now uses a local CodeMirror adapter backed by `@kunstmusik/codemirror-lang-csound` in ORC mode. The adapter keeps the existing project-store update path and exposes a dynamic completion extension point through `createDynamicCsoundCompletionSource`.

Tree-sitter is deferred. The CodeMirror language package already provides the bounded language support needed for 018, so adding `tree-sitter-csound` now would duplicate parser work without clear immediate value.

## Recommended Output For 018

### Required

- CodeMirror vs Monaco decision matrix
- selected rich editor in `GlobalOrchestraTopComponent`
- stable load/edit/save/reopen behavior through the existing project store
- documented dynamic completion extension point
- documented follow-on slice for editor reuse or deeper language tooling

### Completed

- Csound language package integration through `@kunstmusik/codemirror-lang-csound`
- selected CodeMirror editor in `GlobalOrchestraTopComponent`
- dynamic completion adapter hook for future project/runtime completion sources

### Deferred

- Global Score editor migration
- generalized editor reuse across all code panels
- concrete runtime/project-aware completion providers beyond the selected editor extension point
- diagnostics, autocomplete depth, and language-server features
- tree-sitter-backed support unless a later Monaco or parser-specific slice needs it
- Java Blue editor context-menu parity, including Blue Variables, Opcodes, Blue Opcodes, Custom, Add to Code Repository, Cut/Copy/Paste actions, and any submenu insertion behavior shown in the Java editor
- Cut/Copy/Paste behavior verification for CodeMirror in Electron, including whether renderer-owned menus or Electron-native clipboard roles are required

## Follow-On Direction

The preferred follow-on is Java Blue Csound editor parity on top of the selected CodeMirror stack. That slice should inventory the Java Global Orchestra editor context menu and completion/hint sources, then implement the highest-value parity items first: reliable Cut/Copy/Paste, context-menu insertions for Blue variables and opcode-related entries, and project/runtime-aware completion or hint feeds. Monaco and tree-sitter should stay deferred unless a future requirement specifically needs VS Code-compatible editor behavior or a parser capability that the CodeMirror package cannot provide.
