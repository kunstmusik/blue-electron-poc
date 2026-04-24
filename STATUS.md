# Project Status — blue-electron

**Date**: 2026-04-24
**Branch**: `021-orchestra-editor`

## Spec 022 Package

Spec `022-bsb-interface-parity` is in planning.

- Goal: replace the remaining BlueSynthBuilder Interface and UDO placeholders from Spec 021 with Java Blue-style interface editing, preset application, and embedded opcode-list editing
- Planning artifacts: `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/contracts/bsb-interface-parity-surface.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/quickstart.md`, and `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/checklists/requirements.md`
- Scope under planning: editable BSB interface canvas, widget/property/grid editing, preset preservation/application, embedded opcode-list editing, and safe preservation of unsupported BSB widget/preset structures
- Task status: not generated yet
- Immediate next step: generate Spec 022 tasks and start implementation on top of the closed Spec 021 baseline

## Spec 021 Package

Spec `021-orchestra-editor` is complete and closed out for `blue-app`.

- Goal: replace the Orchestra placeholder with a Java Blue-style arrangement/library-left and instrument-editor-right surface
- Scope completed: nested draggable splitters, TanStack-backed arrangement table, inline enabled/id editing, row context actions with deferred import/export placeholders, selected instrument editor/comments tabs, GenericInstrument and JavaScriptInstrument code editors with explicit UDO placeholder tabs, BlueX7 baseline preservation editor, BlueSynthBuilder baseline editor, Python dummy panel, and temporary program-library placeholder
- Data compatibility: `@blue/data` now preserves instrument comments, JavaScriptInstrument, PythonInstrument, BlueX7, Java-compatible instrument assignments, and baseline BlueSynthBuilder `graphicInterface` XML
- Project bridge: `ProjectEditorSnapshot`, `ProjectDocumentPatch`, main-process patching, preload/global typing, and `project-store` now carry orchestra snapshots and patch intents
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/tasks.md` contains 55 completed tasks
- Validation status: `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` pass
- Explicit deferrals: program-wide orchestra library, `.binstr` import/export beyond placeholders, embedded opcode-list editing for Generic/JavaScript instruments, detailed BlueX7 parameter editor parity, Python execution/editor parity, and deeper Java BlueSynthBuilder layout/widget/preset/opcode-list parity
- Immediate next step: start Spec 022 planning for BlueSynthBuilder interface/widget/preset parity

## Spec 020 Package

Spec `020-main-toolbar-parity` is complete and closed out for `blue-app`.

- Goal: replace the renderer header with a Java Blue-style main toolbar and move file/window ownership into the native Electron menus
- Scope: transport controls, engine-authoritative playhead and selection displays, Blue Live buttons, native `File` menu ownership, native `Window` menu command routing, and window-title parity
- Specification status: complete in `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/spec.md`
- Planning status: complete; design artifacts are in `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/contracts/main-toolbar-parity-surface.md`, and `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/quickstart.md`
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/tasks.md` contains 27 tasks and all are complete
- Implementation status: complete; the Java-style toolbar shell, transport controls, playhead/selection display, native File and Window menu handling, and `Blue - [project.blue]` window titles are implemented
- Validation status: `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` all pass
- Remaining gap: playhead timing is intentionally hybrid for now, with engine-authored snapshots plus renderer interpolation; shared-memory transport remains deferred
- Immediate next step: start the next spec once a new follow-on scope is selected

## Spec 019 Package

Spec `019-csound-editor-parity` is complete for `blue-app`.

- Goal: add Java Blue Csound editor parity on top of the CodeMirror Global Orchestra editor from spec 018
- Scope: reliable Cut/Copy/Paste, Java Blue-style editor context menu insertions, first Java Blue-derived completion/hint parity pass, and reusable editor helpers for future Csound text surfaces
- Specification status: complete draft in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/spec.md`
- Planning status: complete; design artifacts are in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/contracts/csound-editor-parity-surface.md`, and `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/quickstart.md`
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/tasks.md` contains 37 tasks and all are complete
- Implementation status: complete; clipboard reliability, Java Blue-style editor context-menu insertions, completion/hint baseline, and reusable editor surface support are implemented
- Validation status: `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` all pass
- Remaining gap: project-level UDO completion is deferred
- Immediate next step: start the next Csound editor parity slice focused on any remaining Java Blue feature gaps and deeper tooling parity

### Java Reference Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/BlueVariablesMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/OpcodesMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/actions/BlueOpcodesMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/editor/actions/CodeRepositoryMenu.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/editor/actions/AddToCodeRepositoryAction.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor/src/main/java/blue/ui/editor/csound/orc/CsoundOrcCompletionProvider.java`

### Planning Notes

- Use a renderer-owned context menu first, likely Radix-backed, because the menu needs direct CodeMirror selection and insertion state.
- Review Electron standard Edit menu roles for clipboard reliability; native menus may be needed for keyboard/platform behavior, but should not replace the Java Blue-style editor context menu by default.
- Blue Variables and Blue Opcodes are high-confidence implementation targets for this slice.
- Opcodes, Custom, and Add to Code Repository may be full, partial, or explicitly disabled/deferred depending on available metadata and repository storage support.
- Completion parity now covers document-local Csound variables, Blue Variables/Blue Opcodes entries, and document-local UDO names; project-level UDO support is deferred.
- Completion implementation now uses the CodeMirror Csound rich opcode catalog for Java Blue-shaped opcode rows and manual-summary help text, scans document-local Csound variables using the Java prefix rules, supports document-local UDO names, and exposes optional BSB replacement-key completion context for future BlueSynthBuilder editors. The package does not expose a standalone `opcodes.json`; the rich catalog module is the usable source.

## Spec 018 Package

Spec `018-csound-editor-tooling` is complete and committed as the CodeMirror editor-selection and Global Orchestra implementation slice for `blue-app`.

- Goal: choose and implement a richer editor for `GlobalOrchestraTopComponent` after evaluating CodeMirror plus `@kunstmusik/codemirror-lang-csound` against Monaco plus optional grammar/language-support work
- Constraint: Monaco adoption is no longer assumed mandatory; dynamic completion support is now an explicit decision criterion, and the selected editor must expose a documented path for project/runtime completion sources
- Specification status: revised for CodeMirror vs Monaco evaluation
- Planning status: revised; the 018 design package is now in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/plan.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/contracts/global-orchestra-editor-surface.md`, and `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/quickstart.md`
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/tasks.md` contains 20 completed tasks
- Implementation status: complete; CodeMirror is selected and implemented for `GlobalOrchestraTopComponent`
- Close-out status: complete; CodeMirror is active for `GlobalOrchestraTopComponent`, the current project load/edit/save path is preserved, and editor-selection research is documented
- Immediate next step: open the follow-on Java Blue Csound editor parity slice for Cut/Copy/Paste behavior, context-menu insertions, completion/hint parity, and future reuse across other Csound text surfaces

### Suggested Scope Boundary

- Treat the current spec 017 Global Orchestra panel as the baseline surface to be replaced
- Evaluate CodeMirror plus `@kunstmusik/codemirror-lang-csound` and Monaco plus optional grammar/language-support work before choosing the implementation path
- Require the selected editor in the shipped slice for `GlobalOrchestraTopComponent`
- Require a documented dynamic completion extension point for the selected editor
- Keep `tree-sitter-csound` as a possible follow-on or Monaco-language-support input rather than the only language-support candidate
- Leave Global Score and other code-oriented surfaces as explicitly deferred follow-on targets
- Defer Java Blue editor context-menu parity, Cut/Copy/Paste verification, and project/runtime completion sources to the next spec rather than expanding 018

### Planning Outcome

- CodeMirror is now a first-class candidate because `@kunstmusik/codemirror-lang-csound` already provides CSD/ORC/SCO language support, opcode and UDO completions, semantic highlighting, hover, indentation, and folding
- Monaco remains viable but likely requires more Csound-specific language work because there is no comparable package already in the repo
- Both candidates support dynamic completions: CodeMirror through completion sources/language data and Monaco through completion item providers
- Keep the current `project-store` patch path as the only persistence flow for `globalOrc`
- Final direction: CodeMirror is selected for 018 because the package installs/builds cleanly in `@blue/app` and gives the strongest Csound-specific baseline

### Implementation Summary

- Added CodeMirror dependencies: `codemirror`, `@codemirror/autocomplete`, `@codemirror/state`, `@codemirror/view`, and `@kunstmusik/codemirror-lang-csound`
- Implemented `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx` as the local CodeMirror adapter
- Implemented `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-language.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-completions.ts`
- Updated `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx` to use the selected editor when a project is loaded
- Added renderer coverage for the selected editor marker and dynamic completion adapter in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

### Validation

- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- Residual warnings are unchanged: package lacks `"type": "module"` for `postcss.config.js`, and Vite reports the existing large renderer chunk warning

### Candidate Research Input

- User-supplied grammar candidate: [tree-sitter-csound](https://github.com/PasqualeMainolfi/tree-sitter-csound)

## Spec 017 Package

Spec `017-global-project-editors` is complete as the current editor-surface implementation slice for `blue-app`.

- Goal: replace the placeholder editor tabs for `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, and `ProjectPropertiesTopComponent` with basic working implementations backed by the current project data model
- Constraint: keep this slice bounded to basic editing and project-property workflow; defer Monaco, Csound language tooling, and tree-sitter work to the following spec
- Specification status: complete
- Planning status: complete
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/tasks.md` contains 27 implementation tasks
- Implementation status: complete; the target panels are now wired to the current project document and validated with `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, and `pnpm --filter @blue/app build`
- Close-out status: complete; final UI polish removed redundant in-panel headers and restored Dockview tab titles to the Java-aligned human-readable labels from the panel registry
- Immediate next step: start `018-csound-editor-tooling` as the Monaco and Csound-language-tooling research slice

### Suggested Scope Boundary

- `GlobalOrchestraTopComponent`: basic editable global orchestra text surface bound to the current project
- `GlobalScoreTopComponent`: basic editable global score text surface bound to the current project
- `ProjectPropertiesTopComponent`: basic built-in project-properties sections only; plugin-provided extension tabs remain deferred unless they fall out naturally from existing data binding work

### Deferred Follow-On

- Start `018-csound-editor-tooling` after spec 017 to evaluate Monaco integration and tree-sitter-backed Csound language support, using [tree-sitter-csound](https://github.com/PasqualeMainolfi/tree-sitter-csound) as the starting grammar candidate for investigation

## Spec 016 Package

Spec `016-component-system-research` is complete as the research and planning slice for future UI/component-system work in `blue-app`.

- Goal: inventory Java blue UI surfaces and current Electron counterparts, group them into reusable component-need categories, compare Dockview/custom workbench ownership against Radix primitives, shadcn-style wrappers, and Electron-native menus where relevant, and recommend bounded next UI specs
- Constraint: this slice is documentation-only and must stay traceable to current Java registrations and current Electron implementation boundaries
- Planning status: complete
- Task status: complete; `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/tasks.md` contains 22 research tasks
- Implementation status: complete; the research output now includes the dedicated Java inventory and the component-system recommendation record

## Spec 016 Close-Out

The 016 research package is complete:

- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/plan.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/data-model.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/contracts/research-output.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/checklists/requirements.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/tasks.md`

Key outcome of the 016 research slice:

- use Java `TopComponent` registrations and window-manager metadata as the baseline inventory corpus
- require a dedicated Java inventory deliverable at `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md` that maps every registered Java component in scope to required UI features
- audit the current Electron port from both `panel-registry.ts` and the live workbench shell
- group findings by surface family rather than by individual file or window alone
- compare four concrete approach families: Dockview/custom workbench ownership, Radix primitives, shadcn-style wrappers, and Electron-native menus
- expect a hybrid recommendation rather than a single-library answer
- immediate next spec candidate recorded during 016 was `017-component-primitive-pilot`, but that placeholder is now superseded by the concrete implementation slice `017-global-project-editors`

### Primary Research Inputs

- Java reference roots:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor`
- Java window-manager metadata:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr`
- Electron workbench roots:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json`

### Suggested Next Step

- Start `017-global-project-editors` to implement the first non-placeholder editor-area surfaces identified during the 016 audit
- Keep Monaco, tree-sitter, and broader code-editor tooling deferred to the following spec so the first implementation pass stays bounded

## Spec 015 Close-Out

Spec `015-left-edge-parity` is complete as the current auxiliary left-edge parity slice for `blue-app`.

## Spec 014 Close-Out

Spec `014-window-system-parity` is complete as the current bounded prototype slice for auxiliary window-system parity in `blue-app`.

## Spec 013 Close-Out

Spec `013-collapsed-sidebar-research` is complete as a bounded prototype and research slice.

- The 013 runtime prototype proved stable panel IDs, auxiliary-edge metadata, and a simplified edge-rail shell in `blue-app`.
- That slice intentionally did **not** claim full NetBeans RCP parity.
- Its main recommendation stands: keep dockview as the canonical panel/group host and localize custom behavior around auxiliary-group presentation state.

## Spec 014 Implemented Slice

The implemented 014 slice now provides the bounded prototype behavior for the four target panels:

- Auxiliary groups can be `docked`, `minimized`, `slideout`, or `maximized`
- Minimizing a group leaves visible ordered edge tabs on the owning edge
- Clicking a minimized tab toggles one edge-attached, resizable slide-out tool window per edge
- Docking from a slide-out docks only the selected tool, while the rail restore action docks the whole minimized group
- Maximizing a docked auxiliary group presents it with top tabs like the main editor area
- Restore returns the selected tool or group to its home edge without duplicating stable panel IDs
- Layout save/restore and Window-menu reveal must honor the existing presentation state

## What Landed

- **Canonical runtime host**: dockview remains the live host for docked and maximized auxiliary groups
- **App-owned layer**: minimized edge tabs, edge-attached slide-outs, home-edge restore metadata, stable-ID reveal routing, and parity session state
- **Prototype scope**:
  - right / `properties`: `SoundObjectPropertiesTopComponent`, `MidiInputPanelTopComponent`
  - bottom / `output`: `ScoreObjectEditorTopComponent`, `MixerTopComponent`
- **Parity-support scope**:
  - left / right / bottom edges are supported by the shell and state model
  - no left-edge Java-backed prototype tool has been assigned in this slice yet
- **Primary implementation files**:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`

## Validation

- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- In-app verification confirmed the current right and bottom prototype flows are working well enough to close the slice.
- No full Java-side manual parity checklist has been completed yet, so broader UX confirmation is still follow-on.

## Spec 015 Implementation Summary

The 015 left-edge parity slice is now implemented:

- **v5 instance-based model**: The auxiliary layout has been migrated from the fixed version 4 two-group model to a version 5 instance-based model with seeded and derived-singleton group instances
- **Layout migration**: Version 2, 3, and 4 stored layouts are automatically upgraded to version 5 on load
- **Whole-group moves**: Users can move any auxiliary group to the left, right, or bottom edge via header actions
- **Single-tool splits**: Moving one tool out of a multi-tool seeded group creates a derived singleton instance on the target edge
- **Merge-back**: Derived singletons can merge back into their seeded sibling group, preserving seed definition panel order
- **Reset layout**: The Window menu now exposes a "Reset Default Layout" action that discards derived singletons and re-seeds the default right/bottom layout
- **Zero left-edge defaults**: Fresh and reset layouts seed zero left-edge tools
- **Edge independence**: Left, right, and bottom edge state is fully independent
- **Drag-to-edge moves**: Docked auxiliary groups move by dragging their header area, and slide-out tools move by dragging the slide-out title bar to left, right, or bottom edge drop zones
- **Group-aware edge behavior**: Restoring minimized tools on an occupied edge rejoins the existing edge group; minimizing a docked edge group minimizes the full edge group
- **Docked-size restore**: Minimizing and restoring a docked edge group now restores the last live docked size instead of the seeded default size
- **Auxiliary tab context menu**: Auxiliary tabs now use a Radix-based context menu with `Close`, `Close Group`, `Maximize`/`Restore`, `Minimize`, and `Minimize Group`
- **Menu decision**: Electron-native context menus were deferred; the current choice is to keep workbench-internal menus renderer-owned for Java-parity styling and direct access to Dockview/Zustand state

### Primary Implementation Files

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts` — v5 data model, migration, normalization, move/merge/reset operations
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts` — store actions for group-instance IDs, move-to-edge, merge-back, reset-layout
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` — renders rails, slideouts, and move controls from instance-based state
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx` — move-to-edge and minimize controls in docked group headers
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx` — move-to-edge controls in slide-out chrome
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx` — updated to use groupInstanceId for restore actions
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryTab.tsx` — Radix-backed auxiliary tab context menu
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx` — reset-layout action and presentation badges

### Validation

- `pnpm --filter @blue/app test`: PASS (49 tests, 0 failures, 2 skipped)
- `pnpm --filter @blue/app build`: PASS
- In-app verification of left-edge moves, singleton splits, merge-back, reset, and the new auxiliary tab context menu is recommended as follow-on

### Remaining Follow-On

- Manual in-app parity review against the Java reference for left-edge behavior
- Broader UX polish for left-edge slide-out sizing and tab ordering
- Decide whether `Float` / `Float Group` should use Dockview popout groups in separate OS windows and add the required auxiliary-state tracking before enabling those menu items
- Add a follow-on spec to inventory reusable component needs from the Java application and compare a Radix-first approach against adopting shadcn wrappers more broadly, including whether workbench context menus should remain Radix-based or move to Electron-native menus

## Related Specs

- **Spec 011**: closed; dockview was selected as the workbench foundation, with rc-dock as fallback
- **Spec 012**: closed; demo2026 parity work now matches the Java `01.csd` reference byte-for-byte
- **Spec 013**: closed; bounded auxiliary-rail prototype and implementation recommendation completed
