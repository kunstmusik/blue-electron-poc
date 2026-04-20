# Java UI Component And Required Feature Inventory

## Purpose

This document is the concrete inventory deliverable for spec `016-component-system-research`. It lists the currently registered Java workbench components in scope, maps each one to the current Electron counterpart or gap, and records the required UI features implied by each surface.

## Scope Rules

- Include currently registered Java `TopComponent` workbench surfaces found in the audited source modules.
- Exclude commented-out or non-registered surfaces from the completeness count, but call them out explicitly.
- Treat required UI features as reusable capability tags, not final implementation decisions.

## Required UI Feature Tags

- `editor-tabs`: tabbed editor-area surface with top tabs and close/focus behavior
- `startup-editor`: opens in the default joined editor area on startup
- `property-sheet`: form-heavy inspector or property panel
- `auxiliary-dock-group`: docked non-editor workbench group that can live on an edge
- `collapse-slideout`: minimize to edge rail, reopen as slideout, restore to docked group
- `floating-popout`: float as a separate OS window or detached window-system surface
- `maximize-restore`: maximize and restore without losing group membership
- `browser-tree-list`: browser, library, or file-management surface with selection-driven content
- `table-grid-editor`: tabular or spreadsheet-like editing surface
- `console-repl`: console or REPL surface with scrollback and input handling
- `keyboard-live-control`: transport, realtime, keyboard, or live-play interaction surface
- `window-menu-entry`: discoverable from Window/menu actions and reusable reveal routing
- `drag-reposition`: drag between dock edges or editor/docked placements

## Java Components In Scope

### Editor Mode

| Java Component | Default | Source | Electron Counterpart | Required UI Features |
| --- | --- | --- | --- | --- |
| `ScoreTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/ScoreTopComponent.java` | `ScoreTopComponent` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts` | `editor-tabs`, `startup-editor`, `window-menu-entry` |
| `OrchestraTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/OrchestraTopComponent.java` | `OrchestraTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `window-menu-entry` |
| `GlobalOrchestraTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalOrchestraTopComponent.java` | `GlobalOrchestraTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `window-menu-entry` |
| `GlobalScoreTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalScoreTopComponent.java` | `GlobalScoreTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `window-menu-entry` |
| `TablesTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/tables/TablesTopComponent.java` | `TablesTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `table-grid-editor`, `window-menu-entry` |
| `UserDefinedOpcodeTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/udo/UserDefinedOpcodeTopComponent.java` | `UserDefinedOpcodeTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `window-menu-entry` |
| `ProjectPropertiesTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/ProjectPropertiesTopComponent.java` | `ProjectPropertiesTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `property-sheet`, `window-menu-entry` |
| `BlueLiveTopComponent` | Startup | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/blueLive/BlueLiveTopComponent.java` | `BlueLiveTopComponent` in `panel-registry.ts` | `editor-tabs`, `startup-editor`, `keyboard-live-control`, `window-menu-entry` |
| `ScratchPadTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/scratchPad/ScratchPadTopComponent.java` | `ScratchPadTopComponent` in `panel-registry.ts` | `editor-tabs`, `window-menu-entry` |

### Properties Mode

| Java Component | Default | Source | Electron Counterpart | Required UI Features |
| --- | --- | --- | --- | --- |
| `SoundObjectPropertiesTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/SoundObjectPropertiesTopComponent.java` | `SoundObjectPropertiesTopComponent` in `panel-registry.ts` | `property-sheet`, `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout`, `window-menu-entry`, `drag-reposition` |
| `SoundObjectLibraryTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/library/SoundObjectLibraryTopComponent.java` | `SoundObjectLibraryTopComponent` in `panel-registry.ts` | `browser-tree-list`, `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout`, `window-menu-entry`, `drag-reposition` |
| `MarkersTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/MarkersTopComponent.java` | `MarkersTopComponent` in `panel-registry.ts` | `property-sheet`, `auxiliary-dock-group`, `collapse-slideout`, `window-menu-entry`, `drag-reposition` |
| `AudioFilePlayerTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/soundFile/AudioFilePlayerTopComponent.java` | `AudioFilePlayerTopComponent` in `panel-registry.ts` | `auxiliary-dock-group`, `collapse-slideout`, `keyboard-live-control`, `window-menu-entry`, `drag-reposition` |
| `MidiInputPanelTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/MidiInputPanelTopComponent.java` | `MidiInputPanelTopComponent` in `panel-registry.ts` | `property-sheet`, `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout`, `window-menu-entry`, `drag-reposition` |

### Output Mode

| Java Component | Default | Source | Electron Counterpart | Required UI Features |
| --- | --- | --- | --- | --- |
| `ScoreObjectEditorTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java` | `ScoreObjectEditorTopComponent` in `panel-registry.ts` | `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout`, `window-menu-entry`, `drag-reposition` |
| `MixerTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/mixer/MixerTopComponent.java` | `MixerTopComponent` in `panel-registry.ts` | `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout`, `window-menu-entry`, `drag-reposition`, `keyboard-live-control` |
| `VirtualKeyboardTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/VirtualKeyboardTopComponent.java` | `VirtualKeyboardTopComponent` in `panel-registry.ts` | `auxiliary-dock-group`, `collapse-slideout`, `keyboard-live-control`, `window-menu-entry`, `drag-reposition` |
| `JavaScriptConsoleTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/script/javascript/JavaScriptConsoleTopComponent.java` | `JavaScriptConsoleTopComponent` in `panel-registry.ts` | `console-repl`, `auxiliary-dock-group`, `collapse-slideout`, `window-menu-entry`, `drag-reposition` |
| `JythonConsoleTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/script/jython/JythonConsoleTopComponent.java` | `JythonConsoleTopComponent` in `panel-registry.ts` | `console-repl`, `auxiliary-dock-group`, `collapse-slideout`, `window-menu-entry`, `drag-reposition` |
| `ClojureConsoleTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-clojure/src/main/java/blue/clojure/ClojureConsoleTopComponent.java` | `ClojureConsoleTopComponent` in `panel-registry.ts` | `console-repl`, `auxiliary-dock-group`, `collapse-slideout`, `window-menu-entry`, `drag-reposition` |
| `BlueFileManagerTopComponent` | On demand | `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager/src/main/java/blue/ui/filemanager/BlueFileManagerTopComponent.java` | `BlueFileManagerTopComponent` in `panel-registry.ts` | `browser-tree-list`, `auxiliary-dock-group`, `collapse-slideout`, `window-menu-entry`, `drag-reposition` |

## Explicit Exclusions From The Completeness Count

- `MidiProjectSettingsTopComponent` exists in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/MidiProjectSettingsTopComponent.java`, but its NetBeans registration annotations are commented out. It should be tracked as a historical or deferred surface, not as a currently registered baseline component.

## Exit Criteria For Spec 016

This document is complete enough to close the inventory portion of spec 016 when:

- every currently registered Java `TopComponent` in scope appears above
- every listed component maps to at least one required UI feature
- every listed component points to a current Electron counterpart or an explicit gap
- any non-registered or intentionally excluded Java surface is called out explicitly
