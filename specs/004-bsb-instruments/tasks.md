# Tasks: BSB Instrument Loading & Orchestra Generation

**Input**: Design documents from `specs/004-bsb-instruments/`
**Prerequisites**: Specs 001-003 complete (data model, engine, audio pipeline)

---

## Phase 18: BSB Data Model

### BSBCompilationUnit
- [ ] T401 [P] Create `instruments/blue-synth-builder/bsb-compilation-unit.ts` — replacement value map + text replacer
- [ ] T402 [P] Implement `addReplacementValue(key, value)` and `replaceBSBValues(instrumentText)`

### BSBWidget Base
- [ ] T403 Create `instruments/blue-synth-builder/bsb-widget.ts` — base interface with objectName, value, min, max, parameterName
- [ ] T404 [P] Implement `collectReplacements(unit)` for base widget

### BSBGroup
- [ ] T405 Create `instruments/blue-synth-builder/bsb-group.ts` — container for nested bsbObject children
- [ ] T406 [P] Implement recursive `collectReplacements()` that walks all child widgets

### BSBKnob
- [ ] T407 Create `instruments/blue-synth-builder/bsb-knob.ts` — knobWidth property
- [ ] T408 [P] Implement XML load with objectName, x, y, value, min, max, knobWidth

### BSBCheckBox
- [ ] T409 Create `instruments/blue-synth-builder/bsb-check-box.ts` — checkedVal, uncheckedVal properties
- [ ] T410 [P] Implement XML load with objectName, value, checkedVal, uncheckedVal

### BSBHSlider / BSBVSlider
- [ ] T411 Create `instruments/blue-synth-builder/bsb-hslider.ts` — sliderWidth property
- [ ] T412 [P] Create `instruments/blue-synth-builder/bsb-vslider.ts` — sliderHeight property
- [ ] T413 [P] Implement XML load for both types

### BSBGraphicInterface
- [ ] T414 Create `instruments/blue-synth-builder/bsb-graphic-interface.ts` — root group, gridSettings
- [ ] T415 [P] Implement `collectReplacements()` that delegates to root group
- [ ] T416 Implement XML load with recursive bsbObject parsing

### BlueSynthBuilder Instrument
- [ ] T417 Create `instruments/blue-synth-builder.ts` — Instrument implementation
- [ ] T418 [P] Parse: name, instrumentText, alwaysOnInstrumentText, globalOrc, globalSco, graphicInterface
- [ ] T419 [P] Implement `generateInstrument()` — compilation unit + replaceBSBValues
- [ ] T420 Implement `generateGlobalOrc()` and `generateGlobalSco()`
- [ ] T421 [P] Implement XML load/save

---

## Phase 19: Arrangement Instrument Loading

### InstrumentAssignment Updates
- [ ] T422 Update `InstrumentAssignment` to hold an `Instrument` reference (not just metadata)
- [ ] T423 [P] Update `Arrangement.loadFromXML()` to parse embedded `<instrument>` elements
- [ ] T424 Implement type dispatch: `type="blue.orchestra.BlueSynthBuilder"` → `BlueSynthBuilder.loadFromXML()`
- [ ] T425 [P] Add `arrangementId` and `isEnabled` attribute parsing from XML

### Instrument Registry
- [ ] T426 Create instrument type registry for XML dispatch (extensible for future instrument types)
- [ ] T427 [P] Register BlueSynthBuilder in the registry

---

## Phase 20: BSB Compilation + CSD Generation

### Orchestra Generation
- [ ] T428 Update `Arrangement.generateOrchestra()` to call `ia.instr.generateInstrument()` for loaded instruments
- [ ] T429 [P] Wrap instrument text with `instr <arrangementId>\t;<name>\n...\n\tendin\n\n`
- [ ] T430 Apply `<INSTR_ID>` and `<INSTR_NAME>` token replacement
- [ ] T431 [P] Apply blueMixerOut → outc conversion

### Global Code Collection
- [ ] T432 Update `CompileData` to collect globalOrc from all instruments
- [ ] T433 [P] Update `CompileData` to collect globalSco from all instruments
- [ ] T434 Update `BlueData.toCSD()` to emit globalOrc before instrument definitions
- [ ] T435 [P] Update `BlueData.toCSD()` to emit globalSco before score events

### PianoRoll Integration
- [ ] T436 Remove stub instrument generation from PianoRoll (BSB instruments now provide real orchestra)
- [ ] T437 [P] Keep PianoRoll as fallback for projects without BSB instruments

---

## Phase 21: Integration + Testing

### End-to-End Testing
- [ ] T438 [P] Test: Load `demo2022.blue`, verify BSB instruments are loaded (count > 0)
- [ ] T439 [P] Test: Generate CSD, verify `<placeholder>` tokens are replaced with values
- [ ] T440 [P] Test: Generate CSD, verify globalOrc contains mixer inits and string globals
- [ ] T441 [P] Test: Generate CSD, verify instrument count matches Java Blue's output
- [ ] T442 Integration: Play `demo2022.blue`, verify audio matches Java Blue output
- [ ] T443 [P] Test: 115 existing tests still pass

### Edge Cases
- [ ] T444 Handle missing widget values (use default 0.0)
- [ ] T445 [P] Handle unknown BSB widget types (skip with warning)
- [ ] T446 Handle empty instrumentText (return empty string)

---

## Phase Dependencies

- **Phase 18**: No dependencies. Can start immediately.
- **Phase 19**: Depends on Phase 18 (BSB data model + BlueSynthBuilder).
- **Phase 20**: Depends on Phase 19 (arrangement instrument loading).
- **Phase 21**: Depends on Phase 20 (CSD generation with real instruments).
