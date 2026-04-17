# Research Notes: UI Window System Research

## Scope

Completed research artifact for feature `011-window-system-research`. This document contains the Java Blue capability baseline, the candidate framework comparison, and the final recommendation.

---

## Part 1: Java Blue Window System Audit (Completed)

### Methodology

Source-level audit of all TopComponent registrations, WindowManager usage, persistence annotations, and lifecycle methods across:
- `~/work/nbprojects/blue/blue-ui-core`
- `~/work/nbprojects/blue/blue-ui-filemanager`
- `~/work/nbprojects/blue/blue-clojure`

### Registered TopComponents By Mode

**`editor` mode (9 components)**

| Component | openAtStartup | position | preferredID |
|---|---|---|---|
| ScoreTopComponent | true | (default) | ScoreTopComponent |
| OrchestraTopComponent | true | 200 | OrchestraTopComponent |
| GlobalOrchestraTopComponent | true | (default) | GlobalOrchestraTopComponent |
| GlobalScoreTopComponent | true | (default) | GlobalScoreTopComponent |
| TablesTopComponent | true | (default) | TablesTopComponent |
| UserDefinedOpcodeTopComponent | true | 300 | UserDefinedOpcodeTopComponent |
| ProjectPropertiesTopComponent | true | (default) | ProjectPropertiesTopComponent |
| BlueLiveTopComponent | true | 800 | BlueLiveTopComponent |
| ScratchPadTopComponent | false | (default) | ScratchPadTopComponent |

**`properties` mode (5 components)**

| Component | openAtStartup | preferredID |
|---|---|---|
| SoundObjectPropertiesTopComponent | false | SoundObjectPropertiesTopComponent |
| SoundObjectLibraryTopComponent | false | SoundObjectLibraryTopComponent |
| MarkersTopComponent | false | MarkersTopComponent |
| AudioFilePlayerTopComponent | false | AudioFilePlayerTopComponent |
| MidiInputPanelTopComponent | false | MidiInputPanelTopComponent |

**`output` mode (7 components)**

| Component | openAtStartup | position | preferredID |
|---|---|---|---|
| ScoreObjectEditorTopComponent | false | (default) | ScoreObjectEditorTopComponent |
| MixerTopComponent | false | 200 | MixerTopComponent |
| VirtualKeyboardTopComponent | false | 800 | VirtualKeyboardTopComponent |
| JavaScriptConsoleTopComponent | false | (default) | JavaScriptConsoleTopComponent |
| JythonConsoleTopComponent | false | (default) | JythonConsoleTopComponent |
| ClojureConsoleTopComponent | false | (default) | ClojureConsoleTopComponent |
| BlueFileManagerTopComponent | false | (default) | BlueFileManagerTopComponent |

**Note**: MidiProjectSettingsTopComponent exists but its registration is commented out.

### Persistence

All 21 active TopComponents use `PERSISTENCE_ALWAYS`. This means NetBeans saves and restores their open/closed state and position across sessions.

### Programmatic Window Interactions

**`findTopComponent()` usage** — used extensively to locate named panels from elsewhere in the UI:

- `ScoreTopComponent` is referenced from ~15+ locations: `ParameterLinePanel`, `PianoRollEditor`, `OSCActions`, `ScoreObjectView`, `PopupMenuListener`, numerous score object actions (nudge, align, navigate to marker/loop, raise/lower pixel second), `AddSoundObjectActionsPresenter`
- `ScoreObjectEditorTopComponent` is referenced from `ScoreObjectSelectionListener`
- `AudioFilePlayerTopComponent` is referenced from `RenderToDiskAndPlayAction`
- `WindowManager.getDefault().getMainWindow()` is used extensively (~30+ locations) as the parent frame for dialogs

**Lifecycle hooks** — every TopComponent implements `componentOpened()` and `componentClosed()` for setup/teardown of listeners and resources.

**Startup initialization** — `Installer.java` uses `WindowManager.getDefault().invokeWhenUIReady(...)` to defer initialization until the window system is ready, then starts background services (backup saver, temp file manager, MIDI, OSC).

### Window Setting Persistence

`WindowSettingManager` (in `blue.WindowSettingManager`) persists dialog/auxiliary window positions (x, y, width, height, visible) to `windowSettings.xml` in the user config directory. This is separate from the NetBeans `PERSISTENCE_ALWAYS` workspace layout persistence. On app close (`Installer.closing()`), it calls `WindowSettingManager.getInstance().save()`.

### Window Menu

All TopComponents register a Window menu action via `@ActionReference(path = "Menu/Window")` with explicit position ordering. This provides a standardized way to open/reveal any panel.

---

## Part 2: Capability Baseline (Validated)

### Capability Inventory with Classification

| ID | Capability | Category | Required Level | Prototype Critical | Evidence |
|---|---|---|---|---|---|
| C01 | Three durable workspace areas (editor/properties/output) | Layout | **Mandatory** | Yes | 21 TopComponents registered in 3 named modes |
| C02 | Central editor area with tabbed documents | Layout | **Mandatory** | Yes | 9 editor-mode components with position ordering |
| C03 | Docked tool panes (properties sidebar, output bottom) | Layout | **Mandatory** | Yes | 5 properties + 7 output components |
| C04 | Programmatic open/focus/reveal by stable ID | Activation | **Mandatory** | Yes | `findTopComponent("ScoreTopComponent")` used 15+ times |
| C05 | Layout persistence and restore across restarts | Persistence | **Mandatory** | Yes | All 21 use `PERSISTENCE_ALWAYS` |
| C06 | Tab groups within an area with ordering | Layout | **Mandatory** | Yes | Multiple components per mode, position values |
| C07 | `componentOpened` / `componentClosed` lifecycle | Lifecycle | **Mandatory** | Yes | All TopComponents implement open/close hooks |
| C08 | Window menu to open/reveal any panel | Activation | **Mandatory** | Yes | All components have `Menu/Window` action |
| C09 | Startup initialization deferred until workspace ready | Lifecycle | **Preferred** | Yes | `invokeWhenUIReady` in Installer |
| C10 | openAtStartup = true/false per panel | Persistence | **Preferred** | No | Editor panels mostly true; properties/output mostly false |
| C11 | Multi-panel coordinated workflows | Workflow | **Preferred** | No | Score selection drives properties panel updates |
| C12 | Floating/detached windows | Layout | **Deferrable** | No | No evidence of programmatic floating in source |
| C13 | Multi-monitor / popout windows | Layout | **Deferrable** | No | No evidence in source audit |
| C14 | Drag-to-dock user customization | Layout | **Deferrable** | No | NetBeans supports it but no Blue-specific code relies on it |
| C15 | Split ratio persistence within areas | Persistence | **Deferrable** | No | `PERSISTENCE_ALWAYS` covers this implicitly |

---

## Part 3: Candidate Framework Comparison

### Candidates Evaluated

| # | Candidate | Family | React-Native | License | Stars | Weekly Downloads | Last Commit |
|---|---|---|---|---|---|---|---|
| 1 | **dockview** | React docking | Yes | MIT | 3,100 | 58,064 | Apr 2026 (active) |
| 2 | **rc-dock** | React docking | Yes | Apache-2.0 | 805 | 13,231 | Sep 2025 |
| 3 | **react-mosaic** | React tiling | Yes | Apache-2.0 | 4,700 | 61,868 | Apr 2026 (active) |
| 4 | **golden-layout** | Generic docking | Partial (virtual components) | MIT | 6,700 | 11,779 | Jan 2026 (doc-only; last code Sep 2022) |
| 5 | **@lumino/widgets** | Framework-agnostic workbench | No (wrapper needed) | BSD-3-Clause | 749 | 150,019 | Mar 2026 (active) |
| 6 | **dock-spawn-ts** | Generic docking | No (wrapper needed) | MIT | 144 | 385 | Apr 2026 (active) |

### Parity Matrix

Scoring: **Direct** = works out of the box, **Partial** = works with some configuration, **Custom** = requires significant custom code, **None** = not supported.

| Capability | dockview | rc-dock | react-mosaic | golden-layout | @lumino/widgets | dock-spawn-ts |
|---|---|---|---|---|---|---|
| C01: Three workspace areas | Direct | Direct | Direct | Direct | Direct | Direct |
| C02: Central editor tabs | Direct | Direct | Direct | Direct | Direct | Direct |
| C03: Docked tool panes | Direct | Direct | Direct | Direct | Direct | Direct |
| C04: Programmatic open/focus | Direct | Direct | Direct | Partial | Direct | Partial |
| C05: Layout persistence | Direct | Direct | Direct | Direct | Direct | Direct |
| C06: Tab groups + ordering | Direct | Direct | Partial (v7 adds tabs; v6 has no tabs) | Direct | Direct | Direct |
| C07: Panel lifecycle hooks | Direct | Direct | Partial | Partial | Direct | Partial |
| C08: Window menu integration | Direct (API) | Direct (API) | Direct (API) | Direct (API) | Direct (API) | Direct (API) |
| C09: Deferred startup init | Custom | Custom | Custom | Custom | Custom | Custom |
| C10: Per-panel startup visibility | Direct (params) | Direct (layout) | Direct (tree) | Direct (config) | Direct (layout) | Direct (config) |
| C11: Multi-panel workflows | Direct | Direct | Direct | Direct | Direct | Direct |
| C12: Floating/detached windows | Direct (overlay + popout) | Direct (float + new window) | None | Direct (popouts) | Custom (Electron only) | Direct (float dialog) |
| C13: Multi-monitor/popout | Direct (popout windows) | Direct (rc-new-window) | None | Direct (popouts) | Custom (Electron only) | Direct (browser windows) |
| C14: Drag-to-dock customization | Direct | Direct | Direct | Direct | Direct | Direct |
| C15: Split ratio persistence | Direct (serialized) | Direct (serialized) | Direct (tree) | Direct | Direct | Direct |

### Operational Risk Assessment

| Dimension | dockview | rc-dock | react-mosaic | golden-layout | @lumino/widgets | dock-spawn-ts |
|---|---|---|---|---|---|---|
| **Maintenance** | Active, daily commits | Active, single maintainer | Active, v7 beta | Semi-abandoned (no code release since 2022) | Active (Jupyter project) | Active, single maintainer |
| **Bus factor** | 1 maintainer | 1 maintainer | 2 (orig author + new contributor) | 1 (doc-only) | High (Jupyter ecosystem) | 1 maintainer |
| **Community size** | Medium (3.1k stars) | Small (805 stars) | Large (4.7k stars) | Large (6.7k stars) | Medium (749 stars, but 15.5k repos use it) | Small (144 stars) |
| **Test suite** | Yes | Limited | Limited | Yes | Yes | None |
| **Documentation** | Excellent | Adequate | Good (v7 improving) | Good | Sparse | Sparse |
| **React integration** | Native React components | Native React | Native React | Virtual component wrapper | Manual wrapper needed | Manual wrapper needed |
| **TypeScript** | Full | Full | Full | Full | Full | Full |
| **Electron fit** | Good | Good | Good | Good | Good | Good |
| **Breaking changes risk** | Low (v5 stable) | Medium (v4 alpha) | Medium (v7 beta) | High (v3 stalled) | Low (mature) | Low (stable) |
| **Zero deps** | Yes (dockview-core) | No (lodash) | No (react-dnd, lodash, etc.) | Yes | Yes | Yes |

---

## Part 4: Recommendation

### Preferred Direction: dockview

**dockview** (v5.2.0) is the recommended framework for the blue-electron window system.

**Reasoning:**

1. **Best parity match**: Direct support for all 8 mandatory capabilities and 3 preferred capabilities. Only C09 (deferred startup init) requires custom wiring, which is trivial.

2. **React-native**: dockview ships as native React components. No DOM-bridging wrapper needed, unlike @lumino/widgets or dock-spawn-ts.

3. **Active maintenance**: Daily commits, 103 releases, MIT license, zero runtime dependencies in `dockview-core`. The maintainer is responsive to issues.

4. **Feature completeness**: Floating panels (overlay), popout windows (real browser windows), tab groups with overflow menus, edge groups for sidebar patterns, layout serialization — all built in.

5. **IDE-grade layout**: Proven in IDE-style apps. The grid/split/tab model maps naturally to Blue's editor/properties/output workspace pattern.

6. **Extension model**: Panels are React components registered by ID. Programmatic open/focus is a first-class API (`api.addPanel()`, `panel.focus()`). This maps well to the `findTopComponent("ScoreTopComponent")` pattern Blue depends on.

### Fallback Direction: rc-dock

If dockview proves unsuitable during prototyping, **rc-dock** (v3.3.2) is the fallback.

**Reasoning:**

1. Also React-native with full docking/tab/persistence support.
2. Floating panels and new-window popouts supported.
3. Simpler API surface than dockview — may be easier for initial prototyping.
4. Main risk: single maintainer, v4 is alpha, npm `latest` tag currently points to alpha (must pin to 3.3.2).

### Rejected Candidates

| Candidate | Reason for Rejection |
|---|---|
| react-mosaic | No native tab support in stable v6; no floating windows; v7 beta is not production-ready; heavy dependency chain |
| golden-layout | Semi-abandoned — no functional code release since Sep 2022; v3 stalled; 99 open issues with no triage |
| @lumino/widgets | Not React-native — requires manual DOM-bridging wrapper for every panel; imperative API adds complexity; JupyterLab-level scale is overkill for Blue's panel count; steeper learning curve without proportional benefit |
| dock-spawn-ts | Not React-native; tiny community (385 weekly downloads, 144 stars); no test suite; single maintainer; sparse docs |

### Accepted Gaps

For the first iteration, the following are explicitly deferred:

1. **C12/C13 Floating/popout windows**: dockview supports them, but the Java source audit shows no Blue code relying on programmatic floating. User drag-to-float can be a v2 feature.
2. **C14 Drag-to-dock user customization**: Nice to have but not critical for workflow parity.
3. **C09 Deferred startup initialization**: Will be handled via a simple app-level startup orchestrator rather than a framework hook.

---

## Part 5: Prototype Scope

The prototype should validate these highest-risk assumptions before broader UI implementation:

### Prototype Deliverables

1. **Three-area workbench shell**: editor center, properties sidebar (right), output bottom — matching Blue's NetBeans mode structure
2. **Tab management**: Open Score, Orchestra, and Project Properties as tabs in the editor area; demonstrate tab switching
3. **Programmatic panel control**: A command/action that opens and focuses a specific panel by stable ID (mirroring `findTopComponent("ScoreTopComponent")`)
4. **Layout persistence**: Serialize the layout to JSON, restore it on app restart, verify tab state and split ratios survive
5. **Panel lifecycle**: Verify that opening/closing a panel triggers appropriate setup/teardown (analogous to `componentOpened`/`componentClosed`)
6. **Window menu**: A minimal Window menu that lists all registered panels and can open/reveal each one

### Prototype Validation Questions

1. Does dockview's serialization handle all panel states needed for Blue's 21 panels?
2. Can panel focus be driven programmatically from external actions (e.g., clicking a sound object in the score view reveals the properties panel)?
3. Is the rendering performance acceptable with complex editor content (e.g., a canvas-based score timeline) inside dockview panels?
4. Does layout restore work correctly after panels are dynamically added/removed?

### Out of Scope for Prototype

- Actual editor implementations (use placeholder components)
- Blue-specific data integration
- Floating/popout windows
- Multi-monitor support
- Custom theming beyond defaults

---

## Part 6: Answers to Open Questions

1. **Which behaviors are mandatory vs deferrable?** — See the capability table in Part 2. Eight capabilities are mandatory (C01-C08), three are preferred (C09-C11), four are deferrable (C12-C15).

2. **Does Blue depend on floating windows?** — No. The source audit found no programmatic floating/undocking code. Floating is deferrable.

3. **Which React-friendly candidates have credible maintenance?** — dockview (active, daily commits) and rc-dock (active but slower cadence). react-mosaic is active but its tab support is beta-only.

4. **Is a non-React workbench foundation better long-term?** — Not justified for Blue. @lumino/widgets would add wrapper complexity without proportional benefit for 21 panels. dockview's React-native model is simpler and sufficient.

5. **Is a custom workbench shell justified?** — No. dockview covers the mandatory capability set. Custom work would only be justified if persistence or programmatic activation parity proved inadequate during the prototype.
