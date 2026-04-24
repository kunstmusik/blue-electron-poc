# Implementation Plan: BSB Widget UI

**Branch**: `023-bsb-widget-ui` | **Date**: 2026-04-24 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/spec.md](/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/spec.md`

## Summary

Replace the generic-box BSB widget canvas and blind-dump property sheet with Java-parity widget-specific visual rendering and a typed per-widget property sheet. Also close out `@blue/data` model gaps so every Java BeanInfo-listed property round-trips safely. Build edit-mode affordances (resize handles for the five resizable widget types, `BSBValue` edit-mode placeholder) on top of the rendering foundation.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data`
**Primary Dependencies**: Existing `@blue/data` BlueSynthBuilder model and BSB widget classes, existing `@blue/app` Orchestra/BSB editor shell from Spec 021, Zustand 5.x project store, CodeMirror 6 BSB code editors, current renderer styling/utilities, and Java Blue BSB reference sources under `/Users/stevenyi/work/nbprojects/blue`
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer consumes BSB interface snapshots and dispatches patch intents through the existing project document IPC bridge; `.blue` XML remains the persistence format
**Testing**: Vitest unit/renderer tests, `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, XML round-trip fixtures, `git diff --check`
**Target Platform**: Electron desktop renderer on macOS first, with the existing workbench/editor stack from Spec 022
**Constraints**: Preserve Java Blue `.blue` compatibility throughout; keep `@blue/data` UI-free and Node-free; avoid regressing Spec 022 infrastructure (canvas selection, property sheet shell, preset bar, UDO editor); widget rendering must work inside the fixed absolute-position canvas layout from Spec 022

## Constitution Check

- **Data-First, UI-Separated**: PASS. All widget model changes stay in `@blue/data`; renderer components consume snapshots and dispatch patches.
- **Backwards-Compatible Serialization**: PASS. Adding/renaming fields must preserve existing XML by supplying defaults and handling the old field names as aliases during parse.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Work stays inside BSB data/UI parity.
- **Engine as External Process**: PASS. Playback is untouched.
- **Test-First for Serialization**: PASS. New `@blue/data` fields require round-trip tests before UI work.
- **Research Integration**: PASS. Planning is anchored to Java BeanInfo property matrices and Java Swing view implementations documented in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/023-bsb-widget-ui/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── bsb-widget-ui-surface.md
└── checklists/
    └── requirements.md
```

### Source Code (primary change areas)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/
├── bsb-h-slider.ts          ← add resolution, valueDisplayEnabled, automationAllowed, randomizable, comment
├── bsb-v-slider.ts          ← same
├── bsb-knob.ts              ← add label, labelEnabled, labelFont, valueDisplayEnabled, automationAllowed, randomizable, comment; audit knobHeight
├── bsb-check-box.ts         ← add label, automationAllowed, randomizable, comment
├── bsb-dropdown.ts          ← add fontSize, automationAllowed, randomizable, comment
├── bsb-value.ts             ← add defaultValue, automationAllowed; audit precision
├── bsb-group.ts             ← add groupName, titleEnabled, font, backgroundColor, borderColor, labelTextColor, comment
├── bsb-label.ts             ← rename labelText→label, add font
├── bsb-h-slider-bank.ts     ← rename sliderCount→numberOfSliders, add resolution, gap, valueDisplayEnabled, automationAllowed, randomizable, comment
├── bsb-v-slider-bank.ts     ← same
├── bsb-file-selector.ts     ← rename selectedPath→fileName, add textFieldWidth, comment
├── bsb-text-field.ts        ← rename textFieldValue→value, add comment
├── bsb-sub-channel-dropdown.ts ← add comment
├── bsb-xy-controller.ts     ← rename xMinimum→XMin etc., add valueDisplayEnabled, automationAllowed, randomizable, comment
├── bsb-line-object.ts       ← add comment
└── [round-trip test updates]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/
├── BSBInterfaceCanvas.tsx   ← replace generic box renderer with per-widget component dispatch
├── BSBPropertySheet.tsx     ← replace blind property dump with typed per-widget property panels
├── widgets/                 ← new directory: one component per widget type
│   ├── BSBHSliderWidget.tsx
│   ├── BSBVSliderWidget.tsx
│   ├── BSBKnobWidget.tsx
│   ├── BSBCheckBoxWidget.tsx
│   ├── BSBDropdownWidget.tsx
│   ├── BSBLabelWidget.tsx
│   ├── BSBTextFieldWidget.tsx
│   ├── BSBValueWidget.tsx
│   ├── BSBGroupWidget.tsx
│   ├── BSBXYControllerWidget.tsx
│   ├── BSBFileSelectorWidget.tsx
│   ├── BSBLineObjectWidget.tsx
│   ├── BSBSubChannelDropdownWidget.tsx
│   ├── BSBHSliderBankWidget.tsx
│   └── BSBVSliderBankWidget.tsx
└── property-panels/         ← new directory: one property sheet panel per widget type
    ├── BSBHSliderProperties.tsx
    ├── BSBVSliderProperties.tsx
    └── ... (one per widget type)
```

## Phase Plan

### Phase 0 — Audit and Baseline (prerequisite)

- Audit Java XML in `~/work/blue/demo2026/01.csd` and a BSB-rich `.blue` file for `knobHeight` and `precision` presence.
- Confirm whether `BSBLabel` `labelText` vs `label` is already correct in XML (look at actual element attribute name).
- Confirm whether `BSBTextField` `textFieldValue` vs `value` is already correct in XML.
- Record findings; decide rename vs alias before touching model code.

### Phase 1 — Data Model Property Parity (`@blue/data`)

1. Add missing fields to each widget class per the `data-model.md` gap table.
2. Handle renames: add both old and new names during parse (for compatibility), serialize canonical name only.
3. Update `@blue/data` round-trip tests for the new fields.
4. Run `pnpm --filter @blue/data test` — must pass before Phase 2.

### Phase 2 — Widget Renderer Components (non-edit mode first)

For each of the 15 widget types:
1. Create `widgets/BSB[Name]Widget.tsx` — props: `{ node: BsbWidgetNodeSnapshot, editEnabled: boolean, selected: boolean, onPatch: (patch: BsbInterfacePatch) => void }`.
2. Implement non-edit mode visual rendering that matches Java Blue's visual appearance.
3. Wire each widget into `BSBInterfaceCanvas.tsx` dispatch (switch on `node.type`).
4. Run `pnpm --filter @blue/app test`.

Priority within Phase 2: Slider → Knob → CheckBox → Label → Dropdown → TextField → Value → Group → XYController → FileSelector → LineObject (simplified) → SubChannelDropdown → HSliderBank → VSliderBank.

### Phase 3 — Typed Per-Widget Property Panels

For each of the 15 widget types:
1. Create `property-panels/BSB[Name]Properties.tsx` — renders labeled inputs for every BeanInfo property.
2. Wire each panel into `BSBPropertySheet.tsx` dispatch (switch on selected widget type).
3. Connect property edits to `onPatch` dispatch.

### Phase 4 — Edit-Mode Affordances

1. Add resize handle overlay to `BSBObjectViewHolder` (canvas selection wrapper) that reads per-widget resize metadata.
2. Wire width/height drag gestures to property patch dispatch for the 5 resizable widget types.
3. Implement `BSBValue` edit-mode placeholder rendering.
4. Confirm tooltip/comment behavior (title attribute in non-edit mode) across all widget types.

### Phase 5 — Validation and Close-Out

1. Run full test + build suite.
2. Manual verification against Java Blue with a BSB-heavy project.
3. XML round-trip smoke test: open Java-generated `.blue`, save from Electron, diff for data loss.
4. Update `STATUS.md` and commit.
