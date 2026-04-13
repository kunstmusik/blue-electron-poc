# Implementation Plan: BSB Instrument Loading & Orchestra Generation

**Branch**: `004-bsb-instruments` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Prerequisite**: Specs 001-003 complete (data model, engine client, React UI, audio pipeline)

## Summary

Load BlueSynthBuilder instruments from `.blue` file arrangement XML, parse their widget trees, compile instrument text by replacing `<placeholder>` tokens with widget values, and generate real CSD orchestra code. This replaces the stub PianoRoll oscillators with the project's actual synth instruments.

## Technical Context

**Key insight**: BSB instruments are stored **inline** in `<instrumentAssignment>` elements — NOT as references to `soundObjectLibrary`. Each assignment embeds the full instrument XML.

**Compilation flow**: `instrumentText` contains `<objectName>` tokens → `BSBCompilationUnit` collects `objectName` → `value` pairs from all widgets → `replaceBSBValues()` does text replacement → wrapped with `instr <id> ... endin`.

**BSBWidget types** (priority order):
1. **BSBGroup** — container for nested widgets (recursive tree)
2. **BSBKnob** — rotary control with `knobWidth`
3. **BSBCheckBox** — binary on/off with `checkedVal`/`uncheckedVal`
4. **BSBHSlider** / **BSBVSlider** — horizontal/vertical sliders
5. **Stub types** — BSBLabel, BSBNumericDisplay, BSBSpectrumAnalyzer, etc. (load data only, no replacement impact)

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
