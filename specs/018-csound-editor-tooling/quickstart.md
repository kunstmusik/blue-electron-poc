# Quickstart: Csound Editor Tooling

## Goal

Validate that spec 018 first chooses the right editor path for Global Orchestra, then ships that selected editor while preserving the existing project save behavior.

## Implementation Order

1. Completed the CodeMirror vs Monaco evaluation matrix in `research.md`.
2. Verified `@kunstmusik/codemirror-lang-csound` package integration risk inside `@blue/app`.
3. Verified Monaco integration risk and dynamic completion capability from API documentation.
4. Selected CodeMirror as the preferred editor path for 018.
5. Added the selected editor dependencies and wrapper/adapter code.
6. Replaced the current `ProjectTextEditorPanel` usage in `GlobalOrchestraPanel` with the selected editor adapter.
7. Added renderer tests for empty state, loaded state, selected editor markup, and dynamic completion adapter behavior.
8. Documented the dynamic completion extension point and the follow-on editor/language-tooling slice.

## Manual Validation

### Editor Selection

1. Review `research.md`.
2. Confirm it compares CodeMirror and Monaco on dynamic completions, Csound language support, packaging risk, testability, theming, and future reuse.
3. Confirm it names CodeMirror as the selected path and Monaco as fallback.

### Selected Editor Baseline

1. Run `pnpm --filter @blue/app test`
2. Run `pnpm --filter @blue/app build`
3. Start the app in development mode
4. Open a project with non-empty global orchestra content
5. Open `Global Orchestra`
6. Confirm the panel uses the CodeMirror-backed selected editor rather than the prior textarea surface
7. Edit the text, save the project, reopen it, and confirm the text persists
8. Close the project or open an empty state path and confirm the panel is non-editable when no project is loaded

### Dynamic Completion Verification

1. Confirm the selected editor has a documented dynamic completion adapter point.
2. Confirm `createDynamicCsoundCompletionSource` can adapt project/runtime completions.
3. Confirm concrete project/runtime completion providers remain documented as follow-on rather than hidden as a missing feature.

## Expected Outcome

- Completed outcome: CodeMirror and Monaco were compared before implementation.
- Completed outcome: CodeMirror is active in Global Orchestra.
- Completed outcome: load/edit/save/reopen behavior still uses the existing project store path.
- Deferred outcome: Java Blue editor parity is named as follow-on work, including Cut/Copy/Paste behavior, context-menu insertions, and deeper project/runtime completion or hint sources.
