# Implementation Plan: BSB Instrument Loading & Orchestra Generation

**Branch**: `004-bsb-instruments` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Prerequisite**: Specs 001-003 complete (data model, engine client, React UI, audio pipeline)

## Summary

Load BlueSynthBuilder instruments from `.blue` file arrangement XML, parse their widget trees, compile instrument text by replacing `<placeholder>` tokens with widget values, and generate real CSD orchestra code. This replaces the stub PianoRoll oscillators with the project's actual synth instruments.

## Technical Context

**Key insight**: BSB instruments are stored **inline** in `<instrumentAssignment>` elements — NOT as references to `soundObjectLibrary`. Each assignment embeds the full instrument XML.

**Compilation flow**: `instrumentText` contains `<objectName>` tokens → `BSBCompilationUnit` collects `objectName` → `value` pairs from all widgets → `replaceBSBValues()` does text replacement → wrapped with `instr <id> ... endin`.

**BSBWidget types** (complete inventory, 18 types):
1. **BSBGroup** — container for nested widgets (recursive tree, implements `Iterable<BSBObject>`)
2. **BSBKnob** — rotary control, automatable
3. **BSBCheckBox** — binary on/off, automatable
4. **BSBHSlider** — horizontal slider, automatable
5. **BSBVSlider** — vertical slider, automatable
6. **BSBHSliderBank** — bank of multiple H-sliders, automatable
7. **BSBVSliderBank** — bank of multiple V-sliders, automatable
8. **BSBValue** — numeric display with editable value, automatable
9. **BSBDropdown** — dropdown selection list, automatable
10. **BSBDropdownItem** / **BSBDropdownItemList** — items within a dropdown
11. **BSBSubChannelDropdown** — subchannel selection dropdown (non-automatable)
12. **BSBFileSelector** — file path selector (implements `StringChannelProvider`)
13. **BSBTextField** — text input field (non-automatable)
14. **BSBLabel** — static text label (no value)
15. **BSBLineObject** — line/drawing element (no value)
16. **BSBXYController** — 2D XY pad controller, automatable
17. **AutomatableBSBObject** — abstract base for automation-linked widgets
18. **BSBObject** — abstract base for all widgets (implements `DeepCopyable`)

**No `blue_shm` opcodes in BSB**: The generated CSD uses direct text replacement. `blue_shm_get:k()` is only used when instruments read from shared memory channels — which happens at runtime in the engine.

## Project Structure

```
packages/blue-data/src/
├── instruments/
│   ├── blue-synth-builder/
│   │   ├── bsb-compilation-unit.ts   # Replacement value collector + text replacer
│   │   ├── bsb-graphic-interface.ts  # Root group, recursive widget tree walker
│   │   ├── bsb-widget.ts             # Base interface: objectName, value, min, max
│   │   ├── bsb-group.ts              # Container for nested bsbObjects
│   │   ├── bsb-knob.ts               # Rotary control + knobWidth
│   │   ├── bsb-check-box.ts          # Binary control + checked/unchecked values
│   │   ├── bsb-hslider.ts            # Horizontal slider
│   │   ├── bsb-vslider.ts            # Vertical slider
│   │   └── bsb-stub.ts               # Stub types: label, display, etc.
│   └── blue-synth-builder.ts         # Instrument implementation
├── sound-objects/poly-object.ts      # Updated: load BSB instruments from arrangement
├── arrangement.ts                    # Updated: parse embedded <instrument> elements
└── utilities/text.ts                 # Already has replaceAll()
```

## Phase Structure

```
Phase 18 (BSB Data Model)
  └─ BSBWidget types, BSBCompilationUnit, BSBGraphicInterface, BlueSynthBuilder

Phase 19 (Arrangement Instrument Loading)
  └─ Parse <instrumentAssignment> with embedded <instrument>, wire to arrangement

Phase 20 (BSB Compilation + CSD Generation)
  └─ generateInstrument(), generateGlobalOrc(), generateGlobalSco(), orchestra wrapping

Phase 21 (Integration + Testing)
  └─ demo2022.blue end-to-end test, CSD output verification
```
