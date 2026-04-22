# Contract: Global Orchestra Editor Surface

## Purpose

Define the boundary between the workbench panel, the selected rich-editor adapter, dynamic completion support, and the existing project store for spec 018.

## Inputs

### From Project Store

- `loaded: boolean`
- `globalOrc: string`
- `updateGlobalOrc(globalOrc: string): Promise<void>`

### From Editor Selection

- `editorKind: "codemirror" | "monaco"`
- `languageId: string`
- `readOnly: boolean`
- `options: object`
- `completionStrategy: DynamicCompletionStrategy`

### From Completion Sources

- static opcode metadata
- document-local UDO names
- future project/runtime completion providers

## Outputs

### Panel Behavior

- When `loaded` is `false`, render an empty disabled state instead of an editable editor surface.
- When `loaded` is `true`, render the selected editor and keep it synchronized with `globalOrc`.

### Update Behavior

- Editor-originated content changes MUST call `updateGlobalOrc`.
- The editor adapter MUST NOT persist project content directly.
- The panel MUST tolerate store-driven value replacement after project open, project switch, or save/reopen cycles.

### Completion Behavior

- The selected editor MUST expose an adapter point for dynamic completions.
- The adapter MAY initially use static opcode and document-local completions if that is the selected package’s default.
- Future project/runtime completion providers MUST attach through the adapter rather than directly coupling to `GlobalOrchestraPanel`.

## Lifecycle Rules

- The selected editor adapter owns editor/document creation and disposal.
- The adapter must dispose runtime editor resources when the Dockview panel unmounts.
- The adapter may keep local ephemeral state for cursor/view behavior, but project text remains store-owned.

## Candidate Rules

- CodeMirror is valid if `@kunstmusik/codemirror-lang-csound` installs/builds cleanly in `@blue/app` and can expose completion extension points.
- Monaco is valid if its completion-provider and language-support setup can be packaged cleanly in Electron/Vite.
- `tree-sitter-csound` is optional and should not block the selected editor if the CodeMirror package already satisfies the language-support requirement.
