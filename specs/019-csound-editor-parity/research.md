# Research Notes: Csound Editor Java Blue Parity

## Scope

Spec 019 starts from the CodeMirror-backed Global Orchestra editor delivered in spec 018. The goal is not to revisit Monaco or tree-sitter. The goal is Java Blue authoring parity for the editor behaviors users hit immediately: clipboard actions, editor context menu insertions, and completion/hint behavior.

## Current Electron Baseline

- `SelectedCodeEditor.tsx` owns the CodeMirror lifecycle and accepts `dynamicCompletionProviders`.
- `csound-completions.ts` can adapt dynamic completion providers into CodeMirror completion sources.
- `GlobalOrchestraPanel.tsx` wires Global Orchestra text through the existing project-store path.
- `use-keyboard-shortcuts.ts` already treats `.cm-editor` and `.selected-code-editor` as text-editing targets for Space/Escape gating.
- `main.ts` removed native Playback menu accelerators for Space/Escape, but Cut/Copy/Paste still need explicit validation because Electron menu accelerators/roles can bypass renderer assumptions.
- `@radix-ui/react-context-menu` is already available and used by `AuxiliaryTab.tsx`.

## Java Source Findings

### Global Orchestra Host

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalOrchestraTopComponent.java`

The Java Global Orchestra window is a NetBeans `TopComponent` named "Global Orchestra". The editor behavior is not hardcoded in that class; it comes from NetBeans editor mime registrations and popup actions.

### Blue Variables Menu

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/BlueVariablesMenu.java`

Decision: implement this menu in 019.

Rationale:

- It is small, source-traceable, and visible in the screenshot.
- It appears in both `text/x-csound-orc` and `text/x-blue-synth-builder` popup paths.
- Required values are exactly `<TOTAL_DUR>`, `<RENDER_START>`, `<PROCESSING_START>`, `<INSTR_ID>`, and `<INSTR_NAME>`.

### Menu Insertion Semantics

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/actions/NameValueTextAction.java`

Decision: match the same high-level behavior: menu item label and inserted value may differ, and action inserts text at caret or replaces the selected range.

Note: The Java implementation removes from caret position when a selection exists; the Electron implementation should behave like a modern editor by replacing the actual selection range.

### Opcodes Menu

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/OpcodesMenu.java`

Decision: implement a practical first pass only if opcode metadata can be sourced from the installed CodeMirror Csound package or an existing repo resource without adding a large new parser.

Rationale:

- Java builds nested menus from `CsoundManualUtilities.getOpcodeDocCategory()`.
- Each menu item inserts the opcode signature, not only the opcode name.
- Large categories are chunked into `More` submenus every 16 entries.
- The Electron repo does not currently carry Java `csound-manual` runtime metadata as an app resource.

### Blue Opcodes Menu

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/BlueOpcodesMenu.java`

Decision: implement this menu in 019.

Rationale:

- It is small and source-traceable.
- Java inserts:
  - `blueMixerOut asig1 [, asig2...]`
  - `blueMixerOut "subchannelName", asig1 ,asig2 [, asig3...]`
  - `asig1 [, asig2...] blueMixerIn`

### Custom Menu

Reference:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/editor/actions/CodeRepositoryMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/tools/codeRepository/CodeRepositoryManager.java`

Decision: include a Custom menu shell and implement repository-backed snippets only if the default/user `codeRepository.xml` path is available in the Electron app without introducing unsafe file ownership.

Rationale:

- Java reads `codeRepository.xml` from `BlueSystem.getCodeRepository()`.
- Repository nodes are groups or snippets; snippet items insert their stored signature/text.
- Java refreshes the menu when the repository is saved.
- This likely needs a broader Code Repository data/source decision, so a disabled or empty-state Custom submenu is acceptable for this slice if documented.

### Add To Code Repository

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/editor/actions/AddToCodeRepositoryAction.java`

Decision: gate implementation on selected text and backing repository support. If repository support is not available in this slice, show a disabled action or non-destructive explanatory state.

Rationale:

- Java does nothing if there is no selected text.
- With selected text, Java opens `AddToCodeRepositoryDialog`, validates name/category, saves `codeRepository.xml`, and refreshes `CodeRepositoryMenu`.
- Implementing the full repository editor/storage flow may be larger than editor parity.

### Completion Provider

Reference: `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/CsoundOrcCompletionProvider.java`

Decision: implement a first Java-derived completion provider that supplements the CodeMirror package rather than replacing it.

Rationale:

- Java uses opcode names from `CsoundManualUtilities.getOpcodeNames()`.
- Java also scans document text before the caret for matching Csound variables when the current filter looks like a Csound variable prefix.
- Auto-query is disabled (`getAutoQueryTypes` returns `0`), so manual invocation is an acceptable parity baseline if CodeMirror default behavior differs.

### Completion Items And Hints

References:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/CsoundOrcCompletionItem.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/OpcodeDocumentation.java`

Decision: preserve the idea of completion detail/help when available, but do not require full bundled Csound manual HTML in 019.

Rationale:

- Java completion item labels show opcode name with right label `opcode`.
- Selecting an opcode inserts the opcode signature.
- Documentation comes from installed Csound manual HTML files and extracts the reference entry content.
- The CodeMirror Csound package already includes opcode completions and hover information; the 019 work should avoid duplicate noisy completions.

## Decision: Renderer Context Menu First

Use a renderer-owned context menu for the editor, likely Radix-backed for consistency with the existing workbench tab menu.

Rationale:

- The menu needs direct access to CodeMirror selection/cursor state and editor insertion commands.
- Java Blue visual parity matters for this editor menu.
- Existing Radix styles can be reused.
- Electron-native roles may still be required for clipboard reliability, especially for keyboard shortcuts or platform menu integration, but native OS menus are not required as the default UI path.

Alternative considered: Electron-native menu only.

- Advantage: native clipboard roles and platform behavior.
- Rejected as the primary path because Java Blue submenu styling and rich insertion actions are renderer/editor-state-heavy.

## Decision: Clipboard Reliability Needs Both Renderer And Main-Menu Review

The implementation should verify:

- CodeMirror native browser clipboard handling for keyboard shortcuts.
- Context-menu actions using editor commands and/or `navigator.clipboard` where allowed.
- Electron app menu roles for `cut`, `copy`, and `paste`, especially if the app menu currently lacks standard Edit roles.

Rationale:

- The user reports Cut/Copy/Paste not working.
- Electron menu accelerators can bypass renderer focus checks.
- The prior Space fix removed Playback accelerators from the main menu; clipboard may need the opposite treatment: standard Edit roles that target focused text fields/editors.

## Decision: Completion Scope

Initial completion parity should include:

- document-local Csound variable completions using Java's prefix classes (`i`, `k`, `a`, `gi`, `gk`, `ga`, `w`, `f`, `gw`, `gf`, `S`, `gS`)
- Blue Variables insertion items, optionally mirrored as completion entries if useful
- Blue Opcodes completion entries
- project-level UDO names from `@blue/data` if exposed in the current project snapshot with reasonable effort

Deferred:

- full Csound manual HTML documentation extraction
- complete custom code repository editor/storage
- BlueSynthBuilder-specific completion parity unless it falls out naturally from shared editor helpers

## Open Implementation Risks

- CodeMirror and `@kunstmusik/codemirror-lang-csound` may already provide some opcode/document-local completions. The new Java-derived providers must de-duplicate options.
- Clipboard behavior in Electron may differ between keyboard shortcuts, native menu roles, and custom Radix context-menu actions.
- Full Custom and Add to Code Repository behavior depends on `codeRepository.xml`, which is not currently a first-class data model in the TypeScript port.
