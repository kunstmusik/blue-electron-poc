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

- [ ] T056 [P] [US3] Add edit-mode affordance coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`: enable edit mode, confirm resize handle presence for BSBHSlider/BSBVSlider/BSBKnob/BSBLineObject/BSBXYController; confirm BSBValue renders non-interactive label in edit mode

### Implementation for Phase 4

- [ ] T057 [US3] Add resize handle overlay to the canvas widget wrapper in `BSBInterfaceCanvas.tsx`: read `BSB_WIDGET_RESIZE_META` from `bsb-widget-meta.ts`; render right-edge handle when `canResizeWidth && editEnabled`; render bottom-edge handle when `canResizeHeight && editEnabled`; dispatch `UpdateWidgetProperty` patch for the appropriate size field on drag-end
- [ ] T058 [P] [US3] Wire resize snap-to-grid: when `gridSettings.snapEnabled` is true, snap dragged width/height to the nearest grid multiple during resize operations in `BSBInterfaceCanvas.tsx`
- [ ] T059 [P] [US1] Implement `comment` tooltip: in each widget renderer, apply `title={node.comment}` to the root element when `!editEnabled && node.comment`

**Checkpoint**: Resize handles visible in edit mode on resizable types; `BSBValue` shows objectName label in edit mode; comment tooltips appear in non-edit mode.

---

## Phase 5: Validation and Close-Out

- [x] T060 Run `pnpm --filter @blue/data test` — must pass
- [x] T061 [P] Run `pnpm --filter @blue/app test` — must pass
- [ ] T062 [P] Run `pnpm --filter @blue/app build` — must pass
- [ ] T063 [P] Run `git diff --check` — must pass
- [ ] T064 Manual verification: open `~/work/blue/demo2026/01.csd` in the Electron app; confirm each major widget type renders visually distinct; confirm property panels show all BeanInfo fields; confirm resize handles; confirm save/reopen round-trip preserves all widget data
- [ ] T065 XML round-trip smoke test: parse a Java-generated `.blue` file, save from Electron, diff the output — no data loss on any widget type
- [ ] T066 Update `STATUS.md` to mark Spec 023 complete with implementation summary and validation status
