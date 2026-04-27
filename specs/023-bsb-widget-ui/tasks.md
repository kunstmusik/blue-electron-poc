# Tasks: BSB Widget UI

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/plan.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/spec.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/research.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/contracts/bsb-widget-ui-surface.md`

**Tests**: Required by US2 (property sheet) and US4 (data model parity). Add `@blue/data` round-trip coverage for every new field before UI tasks for that widget type. Add renderer tests for canvas dispatch and property panel dispatch.

**Organization**: Tasks are grouped by phase and user story. Phase 0 (XML audit) must complete before Phase 1 model changes. Phase 1 must be green before Phase 2 rendering work begins.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

---

## Phase 0: XML Audit (Blocking Prerequisite)

**Purpose**: Determine actual Java-emitted attribute names for fields that differ between the current TS model and Java BeanInfo before any model renames are committed.

- [x] T001 Audit `~/work/blue/demo2026/01.csd` and a BSB-heavy `.blue` file for the following attribute names: `knobHeight`, `precision` (BSBValue), `labelText` vs `label` (BSBLabel), `textFieldValue` vs `value` (BSBTextField), `selectedPath` vs `fileName` (BSBFileSelector), `sliderCount` vs `numberOfSliders` (BSBHSliderBank / BSBVSliderBank), `xMinimum`/`xMaximum`/`yMinimum`/`yMaximum` vs `XMin`/`XMax`/`YMin`/`YMax` (BSBXYController); record findings in `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/research.md` (append section: "XML Audit Results")

**Checkpoint**: Field rename strategy confirmed before any model edits.

---

## Phase 1: Data Model Property Parity (`@blue/data`)

**Purpose**: Add all missing Java BeanInfo-listed fields to each widget class and fix field names where the TS model diverges from Java-emitted XML. All round-trip tests must pass before Phase 2 begins.

**⚠️ CRITICAL**: No rendering work should begin until this phase is green.

### Tests for Phase 1

- [x] T002 [P] [US4] Extend round-trip XML test fixtures in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/` (or existing BSB test files) to exercise all 15 widget types against Java-generated XML, asserting all new fields survive parse→serialize→re-parse without loss
- [x] T003 [P] [US4] Add missing-field default coverage tests: verify that each new optional field applies its default when absent from the parsed XML (no parse errors)

### Implementation for Phase 1

- [x] T004 [US4] Add `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` to `BSBHSlider` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-h-slider.ts`; update parse, serialize, and round-trip coverage
- [x] T005 [P] [US4] Add `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` to `BSBVSlider` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-v-slider.ts`; update parse, serialize, and round-trip coverage
- [x] T006 [P] [US4] Add `label`, `labelEnabled`, `labelFont`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` to `BSBKnob` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-knob.ts`; audit and remove `knobHeight` if not present in Java XML per T001 findings; update parse, serialize, and round-trip coverage
- [x] T007 [P] [US4] Add `label`, `automationAllowed`, `randomizable`, `comment` to `BSBCheckBox` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-check-box.ts`; update parse, serialize, and round-trip coverage
- [x] T008 [P] [US4] Add `fontSize`, `automationAllowed`, `randomizable`, `comment` to `BSBDropdown` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-dropdown.ts`; update parse, serialize, and round-trip coverage
- [x] T009 [P] [US4] Add `defaultValue`, `automationAllowed` to `BSBValue` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-value.ts`; audit `precision` per T001; update parse, serialize, and round-trip coverage
- [x] T010 [P] [US4] Add `groupName`, `titleEnabled`, `font`, `backgroundColor`, `borderColor`, `labelTextColor`, `comment` to `BSBGroup` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`; update parse, serialize, and round-trip coverage
- [x] T011 [P] [US4] Rename `labelText`→`label` (alias old name during parse), add `font` to `BSBLabel` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-label.ts`; update parse, serialize, and round-trip coverage
- [x] T012 [P] [US4] Rename `sliderCount`→`numberOfSliders` (alias during parse), add `resolution`, `gap`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` to `BSBHSliderBank` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-h-slider-bank.ts`; update parse, serialize, and round-trip coverage
- [x] T013 [P] [US4] Same changes as T012 for `BSBVSliderBank` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-v-slider-bank.ts`
- [x] T014 [P] [US4] Rename `selectedPath`→`fileName` (alias during parse), add `textFieldWidth`, `comment` to `BSBFileSelector` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-file-selector.ts`; update parse, serialize, and round-trip coverage
- [x] T015 [P] [US4] Rename `textFieldValue`→`value` (alias during parse), add `comment` to `BSBTextField` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-text-field.ts`; update parse, serialize, and round-trip coverage
- [x] T016 [P] [US4] Add `comment` to `BSBSubChannelDropdown` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-sub-channel-dropdown.ts`; update parse, serialize, and round-trip coverage
- [x] T017 [P] [US4] Rename `xMinimum`→`XMin`, `xMaximum`→`XMax`, `yMinimum`→`YMin`, `yMaximum`→`YMax` (aliases during parse); add `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` to `BSBXYController` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-xy-controller.ts`; update parse, serialize, and round-trip coverage
- [x] T018 [P] [US4] Add `comment` to `BSBLineObject` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-line-object.ts`; update parse, serialize, and round-trip coverage
- [x] T019 [US4] Update any snapshot/patch contract types in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` that carry BSB widget node properties to include the new fields (if typed per-widget snapshot fields are needed beyond the existing `properties` bag)

**Checkpoint**: `pnpm --filter @blue/data test` passes; Java-generated `.blue` round-trip diff shows no data loss.

---

## Phase 2: Widget Renderer Components (Non-Edit Mode First)

**Purpose**: Replace the generic-box canvas dispatch in `BSBInterfaceCanvas.tsx` with per-widget renderer components. Implement non-edit mode visuals for all 15 widget types.

### Tests for Phase 2

- [x] T020 [P] [US1] Add canvas renderer smoke tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx` that mount representative widget nodes and assert the correct component type is rendered (not the generic box)
- [x] T021 [P] [US1] Add widget renderer unit tests for size/layout contracts in a new test file `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-widget-renderers.test.tsx`

### Shared Infrastructure

- [x] T022 [US1] Create widget resize/edit-mode metadata registry `bsb-widget-meta.ts` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/` exporting `BSB_WIDGET_RESIZE_META` for all 15 widget types (canResizeWidth, canResizeHeight, minWidth, minHeight, editModeConditional)
- [x] T023 [US1] Update `BSBInterfaceCanvas.tsx` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx` to dispatch rendering to per-widget components instead of the generic box; retain the existing selection/drag/position wrapper logic

### Slider and Knob Widgets (Priority Group A)

- [x] T024 [US1] Create `BSBHSliderWidget.tsx` in `.../bsb/widgets/` rendering a horizontal slider track at `sliderWidth`×30px with optional `ValuePanel` (50×30) when `valueDisplayEnabled`; `comment` as `title` in non-edit mode
- [x] T025 [P] [US1] Create `BSBVSliderWidget.tsx` in `.../bsb/widgets/` rendering a vertical slider track at 30×`sliderHeight` with optional `ValuePanel` below when `valueDisplayEnabled`
- [x] T026 [P] [US1] Create `BSBKnobWidget.tsx` in `.../bsb/widgets/` rendering a knob circle at `knobWidth`×`knobWidth`; optional label above when `labelEnabled`; optional value display below when `valueDisplayEnabled`

### Simple/Text Widgets (Priority Group B)

- [x] T027 [P] [US1] Create `BSBCheckBoxWidget.tsx` in `.../bsb/widgets/` rendering a checkbox with `label` text; `comment` tooltip in non-edit mode
- [x] T028 [P] [US1] Create `BSBLabelWidget.tsx` in `.../bsb/widgets/` rendering plain text using `label` and `font`
- [x] T029 [P] [US1] Create `BSBTextFieldWidget.tsx` in `.../bsb/widgets/` rendering a text input at `textFieldWidth`; `comment` tooltip in non-edit mode
- [x] T030 [P] [US1] Create `BSBDropdownWidget.tsx` in `.../bsb/widgets/` rendering a select control with `BSBDropdownItemList` items at `fontSize`; `comment` tooltip in non-edit mode
- [x] T031 [P] [US1] Create `BSBSubChannelDropdownWidget.tsx` in `.../bsb/widgets/` rendering a dropdown for sub-channel selection; `comment` tooltip in non-edit mode
	Runtime option-source parity remains deferred: the renderer snapshot does not yet expose mixer subchannel inventory, so the widget currently preserves and displays `channelOutput` but does not provide a Java-equivalent populated selection list.

### Value and XY Widgets (Priority Group C)

- [x] T032 [US1] [US3] Create `BSBValueWidget.tsx` in `.../bsb/widgets/` rendering interactive numeric display in non-edit mode; non-interactive `objectName` label in edit mode (implements `EditModeConditional` contract)
- [x] T033 [P] [US1] Create `BSBXYControllerWidget.tsx` in `.../bsb/widgets/` rendering a 2D pad at `width`×`height` with cross-hair at normalized `(xValue, yValue)`; value display overlay when `valueDisplayEnabled`; `comment` tooltip in non-edit mode

### Container and Advanced Widgets (Priority Group D)

- [x] T034 [US1] Create `BSBGroupWidget.tsx` in `.../bsb/widgets/` rendering a titled border container using `groupName`; applies `backgroundColor`, `borderColor`, `labelTextColor`; hides title when `titleEnabled` is false; renders child widgets recursively
- [x] T035 [P] [US1] Create `BSBFileSelectorWidget.tsx` in `.../bsb/widgets/` rendering a text field at `textFieldWidth` + browse button; shows `fileName`; `comment` tooltip in non-edit mode
- [x] T036 [P] [US1] Create `BSBLineObjectWidget.tsx` in `.../bsb/widgets/` rendering a canvas at `canvasWidth`×`canvasHeight` with a simplified polyline from `lines` data; `comment` tooltip in non-edit mode
- [x] T037 [P] [US1] Create `BSBHSliderBankWidget.tsx` in `.../bsb/widgets/` rendering `numberOfSliders` horizontal sliders at `sliderWidth` with `gap` spacing; optional value panels when `valueDisplayEnabled`
- [x] T038 [P] [US1] Create `BSBVSliderBankWidget.tsx` in `.../bsb/widgets/` rendering `numberOfSliders` vertical sliders at `sliderHeight` with `gap` spacing; optional value panels when `valueDisplayEnabled`

**Checkpoint**: `pnpm --filter @blue/app test` passes; all 15 widget types visible with distinct renderings on a BSB-heavy project.

---

## Phase 3: Generic Dynamic Property Sheet (BeanInfo-Parity)

**Purpose**: Replace the generic property dump with a dynamic property sheet that filters fields per widget type using the exact Java BeanInfo property lists. BSBGroup excludes width/height (canvas-only, matching Java). BSBDropdown gets an inline item editor.

### Tests for Phase 3

- [x] T039 [P] [US2] Add property sheet dispatch coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`: select each widget type, confirm the correct typed panel renders and exposes the BeanInfo-listed fields

### Implementation

- [x] T040 [US2] Replace per-widget panel approach with a single generic dynamic `BSBPropertySheet.tsx` that uses `BEANINFO_PROPERTIES` map (15 widget types, each with exact Java BeanInfo property list) to filter which fields appear. Edit widget type determines which properties render. Includes inline dropdown items editor with add/remove/reorder.
- [x] T047-T055 [P] [US2] Superseded — per-widget property panels removed in favor of generic dynamic approach (T040)

**Checkpoint**: Selecting any widget type shows a property panel with exactly the BeanInfo-listed fields for that type; edits dispatch patches and canvas updates.

---

## Phase 3.5: Widget Interaction Fixes

**Purpose**: Fix interaction bugs found during manual testing. See `BSB_GROUP_PANEL_WIDTH_ISSUE.md` for remaining group width issue.

- [x] T067 Slider thumb drag support (was click-only). Fixed with ref-based mousemove/mouseup listeners in `BSBHSliderWidget.tsx` and `BSBVSliderWidget.tsx`
- [x] T068 Dropdown interaction in non-edit mode. Fixed — renders `<select>` element in non-edit mode
- [x] T069 BSB Group navigation (breadcrumb bar + double-click to enter). Added `groupStack` state to `BSBInterfaceCanvas.tsx`, breadcrumb bar with "Root > GroupName" navigation, `onDoubleClick` on BSBGroupWidget
- [x] T070 Value panel double-click text editing. `ValuePanel` component now shows `<input>` on double-click, commits on Enter, cancels on Escape
- [x] T071 Group color parsing for `0xRRGGBBAA` format. `parseBsbColor()` added to `BSBGroupWidget.tsx`
- [x] T072 Canvas background color. Changed from `#0a0f1a` (near-black) to `#26334c` (Java FlatLAF Dark `@background`)
- [x] T073 BSBGroup child selection blocking in edit mode. Invisible overlay div inside group content area prevents mouse events from reaching children
- [x] T074 BSBGroup width/height snapshot fix. Changed from `record._width` (undefined) to `record.width` (correct). Removed from `properties` bag to avoid property sheet duplication. Display size now computed at render time in `BSBGroupWidget` using Java's `getPreferredSize()` algorithm
- [x] T075 Generic dynamic property sheet with BeanInfo filtering. `BEANINFO_PROPERTIES` map encodes all 15 widget types' exact Java property lists. BSBGroup correctly excludes width/height
- [x] T076 BSBGroup width fix (resolved in separate session)

---

## Phase 4: Edit-Mode Affordances

**Purpose**: Add resize handles for the 5 resizable widget types and confirm `BSBValue` edit-mode placeholder. Implement tooltip/comment behavior.

### Tests for Phase 4

- [x] T056 [P] [US3] Add edit-mode affordance coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`: confirm resize handle presence for BSBHSlider/BSBVSlider/BSBKnob/BSBLineObject/BSBXYController; confirm BSBValue renders non-interactive label in edit mode; added `data-resize-edge` attribute to ResizeHandle for testability

### Implementation for Phase 4

- [x] T057 [US3] Add resize handle overlay to WidgetWrapper: 5x5 green handles at right/bottom edges of selected resizable widgets in edit mode, ref-based drag with `Math.max(minSize, ...)` clamping
- [x] T058 [P] [US3] Wire resize snap-to-grid: `Math.round(pos / gridSize) * gridSize` applied to mouse position before computing new size
- [x] T059 [P] [US1] Implement `comment` tooltip: already in WidgetWrapper `title` attribute when `!editEnabled && node.properties.comment`

**Checkpoint**: Resize handles visible in edit mode on resizable types; `BSBValue` shows objectName label in edit mode; comment tooltips appear in non-edit mode.

---

## Phase 3.6: Preset and Runtime Value Fixes

**Purpose**: Fix preset application to use widget-specific serialization and ensure runtime value changes sync with automation parameters.

- [x] T077 [US4] Add `getPresetValue()`/`setPresetValue()` to all widget types that need custom preset serialization: `BSBCheckBox`, `BSBDropdown`, `BSBFileSelector`, `BSBSubChannelDropdown`, `BSBTextField`, `BSBValue`, `BSBXYController`
- [x] T078 [US4] Update `Preset.ts` `collectValues()` to use `widget.getPresetValue()` when available instead of generic `ver2:${widget.value}`
- [x] T079 [US4] Fix `BlueSynthBuilder.applyPreset()` to call `widget.setPresetValue()` and sync linked `Parameter` instances after each widget update
- [x] T080 [US4] Add `BSBWidget.setValue()` base method and override in subclasses (`BSBCheckBox`, `BSBDropdown`, `BSBValue`, `BSBHSlider`, `BSBVSlider`, `BSBKnob`, `BSBXYController`) so that internal state (e.g. `selected`, `selectedIndex`) stays consistent
- [x] T081 [US4] Fix `BlueSynthBuilder.setWidgetValue()` and `updateWidgetProperty()` to call `widget.setValue()` and sync linked parameters
- [x] T082 [US4] Add `randomize()` to all randomizable widget types and wire `randomize` patch through `BsbInterfacePatch`
- [x] T083 [P] [US4] Add `values` map to `PresetSnapshot` and `buildPresetGroupSnapshot()` so preset contents are visible in the renderer
- [x] T084 [P] [US4] Add engine-client request queueing in `blue-engine-client` to prevent interleaved ZeroMQ messages

---

## Phase 5: Canvas Interaction (Context Menu, Drag-to-Move, Remove)

**Purpose**: Implement the BSB edit panel context menu (add/remove widgets), drag-to-move selected widgets, and keyboard delete. These match Java `BSBEditPanelPopup` and `BSBObjectViewHolder` mouse-drag behavior.

### Data Model

- [x] T090a Add `addWidget` and `removeWidget` patch types to `BsbInterfacePatch` in `project-editor.ts`
- [x] T090b Add `createWidgetByType()` and `removeWidget()` methods to `BSBGraphicInterface` in `@blue/data`
- [x] T090c Add optimistic snapshot handlers for `addWidget`/`removeWidget` in renderer store
- [x] T090d Export `BSBGroup` from `@blue/data` package index

### Context Menu

- [x] T091 [US3] Add right-click context menu to BSB canvas area in edit mode using `@radix-ui/react-context-menu`. Menu items: "Add Group", "Add Knob", "Add Horizontal Slider", "Add Horizontal Slider Bank", "Add Vertical Slider", "Add Vertical Slider Bank", "Add CheckBox", "Add Label", "Add Dropdown List", "Add SubChannel Dropdown List", "Add File Selector", "Add XY Controller", "Add Line Object", "Add Text Field", "Add Value". If a widget is selected, also show "Remove" item. Widget is added at the right-click position with grid snapping applied. Items match Java `BSBObjectRegistry` entry list.

### Drag-to-Move

- [x] T092 [US3] Add drag-to-move for selected widgets in edit mode. On mousedown (left button) on a selected widget, record starting position and mouse origin. On mousemove, compute delta from origin, apply grid snap, clamp to >= 0. Send `updateWidgetProperties` patch with new x/y. Uses ref-based listeners (same pattern as slider drag) to avoid re-render loops.

### Resize Handle Fix

- [x] T093 [US3] Fix resize handles not showing: forward `onBsbInterfacePatch` prop from all 16 widget components to `WidgetWrapper`
- [x] T094 [US3] Fix resize handle coordinate calculation: use delta-based approach (`startClient` + `startSize`) instead of comparing `clientX` against `node.x` (which are in different coordinate spaces)

---

## Phase 6: Grid Overlay Optimization

**Purpose**: Replace the expensive SVG-based grid overlay (40k+ DOM nodes for 2000x2000 canvas with 10px grid) with a GPU-accelerated CSS approach.

- [x] T095 [US1] Replace SVG-based `GridOverlay` with CSS `background-image` approach using `radial-gradient` for DOT style and `linear-gradient` for LINE style with `backgroundSize` = grid dimensions. Zero React children, purely CSS-driven.

---

## Phase 7: Tooltip Improvement

- [x] T096 [US1] Replace native HTML `title` tooltip with Radix `Tooltip` component for faster show time (~100ms delay) and consistent styling with the rest of the app. WidgetWrapper wraps in `Tooltip.Root`/`Tooltip.Trigger`/`Tooltip.Content` with `Tooltip.Portal` and `Tooltip.Arrow`. `Tooltip.Provider` placed at `BSBInterfaceCanvas` level with `delayDuration={100}`. Styled with `.bsb-tooltip-content` matching the editor context menu dark theme.

---

## Phase 8: Multi-Select and Keyboard

**Purpose**: Implement Java-parity multi-select, keyboard navigation, and marquee selection. These match Java `BSBObjectViewHolder` shift-click selection, arrow key movement, and `BSBEditPanel` marquee.

- [x] T097 [US3] Shift-click multi-select: clicking a widget while holding Shift toggles it in/out of the selection set. Changed `selectedWidgetId: string | null` to `selectedWidgetIds: Set<string>` throughout BSBInterfaceEditor, BSBInterfaceCanvas, WidgetWrapper, and BSBPropertySheet. Property sheet shows "N widgets selected" when multiple are selected. Remove context menu removes all selected widgets.
- [x] T098 [US3] Arrow key movement: when widgets are selected in edit mode, arrow keys move all selected widgets by grid size (or 1px if grid snap disabled). Implemented with window keydown listener in BSBInterfaceCanvas.
- [x] T099 [US3] Marquee selection: click-drag on empty canvas draws a dashed selection rectangle with pink highlight; all widgets whose bounding box intersects the rectangle are selected on mouseup. Shift+marquee toggles intersection set. Click on background clears selection (unless marquee drag occurred).

---

## Phase 9: Widget Object Edit Context Menu (Deferred)

**Purpose**: Implement the per-widget context menu shown when right-clicking a selected widget in edit mode. Matches Java `BSBObjectEditPopup`.

- [x] T100 [US3] Per-widget context menu on right-click in edit mode: "Remove", "Cut", "Copy", "Make Group" (when multiple selected), "Break Group" (when single BSBGroup selected), "Align" submenu (Left, Right, Top, Bottom, Center H, Center V), "Distribute" submenu

---

## Phase 10: Parity Fixes and Polish

**Purpose**: Fix rendering and interaction parity issues found during manual review against Java Blue.

- [x] T101 [US1] BSBKnob arc rendering: rewrite PIE arc geometry using correct Java angle convention (225° start, 270° sweep). Replace `polarToCartesian(angleDeg - 90)` with `polarToXY` using `cy - r * sin(rad)` y-flip for SVG. Replace `describeArc` with `describePieArc` taking sweep angle with correct SVG sweep direction flag. Notch indicator changed from `<polygon>` to `<rect rx/ry>` for pill shape (matching Java `fillRoundRect`). Value indicator line and notch rendered via SVG `<g transform="rotate()">` matching Java's `g2d.rotate()`. 1px margin applied (`drawSize = size - 2`) matching Java's `size = Math.min(w,h) - 2`.
- [x] T102 [US1] BSBKnob value panel: dark navy background `rgb(20,29,45)` with `borderRadius: 3` (Java `arcWidth=6` is diameter, SVG `rx=3` is radius) matching Java `ValuePanel.paintComponent()`
- [x] T103 [US1] BSBKnob mouse tracking: fix angle computation from `atan2(dx, -dy)` (compass convention) to `atan2(-dy, dx)` (standard math convention matching the arc drawing system)
- [x] T104 [US2] Property sheet commit-on-enter/blur: `PropertyInput` component with local state, validates on blur/enter, Escape reverts, `objectName` uniqueness check, numeric validation via `validateNumericProperty()`
- [x] T105 [US2] Font chooser dialog: modal with system fonts via `window.queryLocalFonts()`, filter input, per-font rendering, style/size selection, preview area. Property sheet groups `font.*`/`labelFont.*` into single row with `...` button. `local-fonts` permission auto-granted in main process.
- [x] T106 [US1] Arrangement panel: 3-column resizable layout (Use/Instr ID/Instr Name), editable Instr Name column, `+Add` popup with all 5 Java instrument types (Generic, Python, JavaScript, BlueX7, BlueSynthBuilder). `InstrumentNameField` removed from all instrument editors.
- [x] T107 [US1] Grid snap decoupled from grid visibility: `gridSnapEnabled` checks only `snapEnabled`, not `enabled`
- [x] T108 [US1] Empty BSB canvas always interactive: `buildWidgetTreeSnapshot()` always returns root node (never null)
- [x] T109 [US1] BSBFileSelector `textFieldWidth` fix: added `BSBFileSelector` case in `buildWidgetTreeNode` computing `width = textFieldWidth + 30`, `height = 30` (matching Java's `getPreferredSize()`). Fixed optimistic update in `project-store.ts` to also add `+30`. Updated resize meta `minWidth: 10`, `minHeight: 30`. Widget uses `textFieldWidth` from properties for text field div, 30px fixed button.
- [x] T110 BSB interface canvas scroll padding: handled by the explicit canvas sizing helpers in `widgets/utils.ts`. `getCanvasDisplaySize()` and recursive `getWidgetDisplaySize()` both add `BSB_CANVAS_SCROLL_PADDING = 10`, and renderer coverage in `bsb-interface-editor.test.tsx` asserts the padded root/group canvas bounds.
- [x] T111 BSBKnob mouse tracking verification: confirmed `atan2(-dy, dx)` angle convention matches arc rendering (225° start, 270° sweep)

---

## Phase 10: Validation and Close-Out

- [x] T060 Run `pnpm --filter @blue/data test` — must pass
- [x] T061 [P] Run `pnpm --filter @blue/app test` — must pass
- [x] T062 [P] Run `pnpm --filter @blue/app build` — must pass
- [x] T063 [P] Run `git diff --check` — must pass
- [x] T064 Manual verification: open `~/work/blue/demo2026/01.csd` in the Electron app; confirm each major widget type renders visually distinct; confirm property panels show all BeanInfo fields; confirm resize handles; confirm save/reopen round-trip preserves all widget data. Completed via smoke testing in the Electron app; no regressions observed.
- [x] T065 XML round-trip smoke test: parse a Java-generated `.blue` file, save from Electron, diff the output — no data loss on any widget type. **Verified with `alphaV4.blue`: all structural data matches; remaining diffs are cosmetic only (attribute quoting `'` vs `"`, entity encoding `&apos;` vs literal, self-closing tag style, indentation).**
- [x] T066 Update `STATUS.md` to mark Spec 023 close-out state with implementation summary and validation status
