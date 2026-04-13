# Feature Specification: BSB Instrument Loading & Orchestra Generation

**Feature Branch**: `004-bsb-instruments`
**Created**: 2026-04-13
**Status**: Draft
**Input**: Load BlueSynthBuilder instruments from `.blue` files, wire to arrangement, generate real CSD orchestra code.

## Background

The current pipeline generates CSD with stub oscillator instruments. The demo projects contain actual BlueSynthBuilder (BSB) instruments with rich synth definitions. The BSB system uses text-replace compilation: instrument templates contain `<objectName>` placeholders that get replaced with widget values or automation variable names.

### How BSB Works (from Java source)

1. **Instrument storage**: BSB instruments are stored **inline** within `<instrumentAssignment>` elements in the arrangement — not as references to `soundObjectLibrary`. Each assignment embeds the full instrument XML.

2. **BSB instrument XML structure**:
```xml
<instrument type="blue.orchestra.BlueSynthBuilder" editEnabled="false">
  <name>Reson 6 - Orch</name>
  <instrumentText>...CSD with <baseQ> <freqMultiply0> <gain0> tokens...</instrumentText>
  <globalOrc>...</globalOrc>
  <globalSco>...</globalSco>
  <graphicInterface>
    <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
      <objectName>baseQ</objectName>
      <value>29.881298</value>
      <minimum>0.1</minimum>
      <maximum>100.0</maximum>
    </bsbObject>
  </graphicInterface>
</instrument>
```

3. **Compilation flow**:
   - `generateInstrument()` → `BSBCompilationUnit.replaceBSBValues(instrumentText)`
   - Each BSB widget's `objectName` becomes a `<key>` → value replacement
   - Values come from: widget default value, or automation variable name (`gk_blue_auto0`)

4. **No blue_shm opcodes**: The generated CSD uses direct text replacement, not shared memory opcodes. `blue_shm_get:k()` is only used when instruments are loaded via the engine's channel system — which is a separate concern.

### Current State

- `Arrangement.loadFromXML()` loads assignment metadata (id, enabled) but NOT the instrument objects
- `Arrangement.generateOrchestra()` skips all assignments because `ia.instr` is `undefined`
- PianoRoll works as a fallback (generates stub oscillators)
- The actual BSB instruments from `demo2022.blue` are never loaded

## User Scenarios & Testing

### User Story 1 — Hear Real Instruments (Priority: P1)

A user loads `demo2022.blue` and presses Play. Instead of stub oscillators, they hear the actual BSB instruments: Reson 6 synth, bass drums, congas, hand claps — exactly as designed in the Java Blue app.

**Why this priority**: This is the core value proposition. Without real instruments, the app is a toy.

**Independent Test**: Load `demo2022.blue`, press Play, verify the audio matches the Java Blue app's output (same instrument timbres, same note patterns).

**Acceptance Scenarios**:
1. **Given** `demo2022.blue` is loaded, **When** Play is pressed, **Then** the CSD contains the actual BSB instrument text (Reson 6, BD, Clap, HH, etc.)
2. **Given** BSB instruments are loaded, **When** CSD is generated, **Then** `<objectName>` placeholders are replaced with widget values
3. **Given** the project uses sample-based instruments, **When** CSD is generated, **Then** sample paths from the original project are preserved in the `gS_blue_strN` globals

---

### User Story 2 — BSB Knob Values in Generated CSD (Priority: P1)

A BSB instrument with knobs set to specific values generates CSD with those values substituted into the template. A knob named `baseQ` with value `29.881298` replaces all `<baseQ>` tokens in the instrument text.

**Why this priority**: This is the core BSB compilation mechanism. Without it, instruments are just templates with unresolved placeholders.

**Acceptance Scenarios**:
1. **Given** a BSB instrument with a knob `freqMultiply0 = 1.0`, **When** `generateInstrument()` is called, **Then** all `<freqMultiply0>` tokens are replaced with `1.0`
2. **Given** a BSB instrument with a checkbox `modeOn0 = 1`, **When** generated, **Then** `<modeOn0>` becomes `1` in the CSD
3. **Given** a BSB instrument with nested BSBGroup widgets, **When** generated, **Then** all widget values from all groups are collected for replacement

---

### User Story 3 — Global Orchestra and Score Code (Priority: P2)

BSB instruments include `globalOrc` (global orchestra code like mixer inits, UDO definitions) and `globalSco` (global score code like F-tables). These are emitted into the CSD alongside the instrument definitions.

**Why this priority**: Without globalOrc, UDOs and mixer globals are missing. Without globalSco, F-tables for wavetables are missing.

**Acceptance Scenarios**:
1. **Given** a BSB instrument with `globalOrc` content, **When** CSD is generated, **Then** the globalOrc appears in `<CsInstruments>` before instrument definitions
2. **Given** a BSB instrument with `globalSco` content, **When** CSD is generated, **Then** the globalSco appears in `<CsScore>` before note events

---

## Requirements

### Functional Requirements

#### Instrument Loading
- **FR-401**: `Arrangement.loadFromXML()` MUST parse embedded `<instrument>` elements within each `<instrumentAssignment>`
- **FR-402**: Instruments with `type="blue.orchestra.BlueSynthBuilder"` MUST be loaded as `BlueSynthBuilder` objects
- **FR-403**: `BlueSynthBuilder.loadFromXML()` MUST parse: `name`, `instrumentText`, `alwaysOnInstrumentText`, `globalOrc`, `globalSco`, `graphicInterface`
- **FR-404**: `BSBGraphicInterface.loadFromXML()` MUST parse the hierarchical tree of `bsbObject` elements (BSBGroup, BSBKnob, BSBHSlider, BSBVSlider, BSBCheckBox, BSBNumericDisplay, etc.)
- **FR-405**: Each BSB widget MUST store: `objectName`, `x`, `y`, `value`, `minimum`, `maximum`, and type-specific properties

#### BSB Compilation
- **FR-406**: `BlueSynthBuilder.generateInstrument()` MUST replace all `<objectName>` tokens with widget values
- **FR-407**: `BSBCompilationUnit` MUST collect replacement values from all widgets in the graphic interface tree (recursive)
- **FR-408**: Widget values that are automation-linked MUST use the variable name (e.g., `gk_blue_auto0`) instead of the raw numeric value
- **FR-409**: `generateInstrument()` MUST also handle UDO opcode name replacements if present

#### Orchestra Generation
- **FR-410**: `Arrangement.generateOrchestra()` MUST wrap each instrument's generated text with `instr <arrangementId> ... endin`
- **FR-411**: Global orchestra code from ALL BSB instruments MUST be collected and emitted before instrument definitions
- **FR-412**: Global score code from ALL BSB instruments MUST be collected and emitted before note events
- **FR-413**: String globals (`gS_blue_str0 = "path.wav" chnexport ...`) from globalOrc MUST be preserved
- **FR-414**: Automation globals (`gk_blue_auto0 init 1 chnexport ...`) from globalOrc MUST be preserved

#### Backwards Compatibility
- **FR-415**: If a BSB instrument fails to load, it MUST be skipped with a warning (not crash)
- **FR-416**: PianoRoll instruments MUST continue to work alongside BSB instruments
- **FR-417**: The CSD output format MUST match Java Blue's format exactly (same header, same globalOrc placement, same instrument wrapping)

### Key Entities

#### BlueSynthBuilder
```typescript
class BlueSynthBuilder implements Instrument {
  name: string
  instrumentText: string         // CSD template with <placeholder> tokens
  alwaysOnInstrumentText: string // optional always-on code
  globalOrc: string              // global orchestra code
  globalSco: string              // global score code
  graphicInterface: BSBGraphicInterface
  editEnabled: boolean

  generateInstrument(): string   // replaces <placeholders> with values
  generateGlobalOrc(): string | null
  generateGlobalSco(): string | null
}
```

#### BSBGraphicInterface
```typescript
class BSBGraphicInterface {
  rootGroup: BSBGroup
  gridSettings: string

  collectReplacements(unit: BSBCompilationUnit): void
  // Recursively walks all widgets, adding objectName→value pairs
}
```

#### BSBCompilationUnit
```typescript
class BSBCompilationUnit {
  replacementValues: Map<string, string>

  addReplacementValue(key: string, value: string): void
  replaceBSBValues(instrumentText: string): string
  // Uses TextUtilities.replaceAll() for all replacements
}
```

#### BSBWidget (base)
```typescript
interface BSBWidget {
  objectName: string
  x: number
  y: number
  minimum: number
  maximum: number
  value: number
  parameterName: string | null  // if linked to automation

  collectReplacements(unit: BSBCompilationUnit): void
}
```

#### BSBKnob, BSBHSlider, BSBVSlider, BSBCheckBox
```typescript
// Concrete widget types — each extends BSBWidget
// Knob: knobWidth, knobHeight
// HSlider/VSlider: sliderWidth, sliderHeight
// CheckBox: checked/unchecked values
// All collect replacements the same way: objectName → value (or automation var)
```

## Success Criteria

- **SC-401**: Loading `demo2022.blue` produces CSD with all 8+ BSB instruments (Reson 6, BD, Clap, HH, etc.)
- **SC-402**: All `<placeholder>` tokens in BSB instrument text are replaced with actual values
- **SC-403**: Global orchestra code (mixer inits, UDOs, string globals, automation globals) appears in the CSD
- **SC-404**: CSD audio output matches the Java Blue app's CSD output (same instrument text, same note events)
- **SC-405**: 115 existing tests continue to pass
- **SC-406**: CSD generation completes without errors for `demo2022.blue`

## Assumptions

- BSB widget types to implement (complete inventory from Java source):
  - **Automatable** (can link to automation, contribute replacement values):
    BSBKnob, BSBCheckBox, BSBHSlider, BSBVSlider, BSBHSliderBank, BSBVSliderBank, BSBValue, BSBDropdown, BSBXYController
  - **Non-automatable** (still contribute replacement values):
    BSBSubChannelDropdown, BSBFileSelector, BSBTextField
  - **No values** (visual only, no replacement contribution):
    BSBLabel, BSBLineObject, BSBGroup (container only)
  - **Support types**: BSBDropdownItem, BSBDropdownItemList
  - All extend BSBObject (abstract base, implements DeepCopyable)
- The `blue_shm_get:k()` opcode system is handled by the engine — BSB just generates the CSD text with the right opcodes
- String globals for sample paths reference files on the user's filesystem — paths must be preserved as-is
- Automation variable names (`gk_blue_autoN`) come from the automation system — for Phase 1, use raw widget values
