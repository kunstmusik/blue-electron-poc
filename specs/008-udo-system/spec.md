# Feature Specification: UDO System (UserDefinedOpcode Parity)

**Feature Branch**: `008-udo-system`
**Created**: 2026-04-14
**Status**: Draft
**Input**: The TypeScript `OpcodeDefinition` class is a simplified stub that only generates classic-style Csound UDO syntax. The Java `UserDefinedOpcode` class supports both **classic** and **modern** UDO styles, and the `Effect` class also uses these styles for effect UDO generation. Modern-style UDOs use a different opcode declaration syntax (`opcode name(args):types` vs `opcode name,outTypes,inTypes`). The TypeScript code cannot load, save, or generate modern-style UDOs, and lacks the `UDOUtilities` parsing/conversion class entirely.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — OpcodeDefinition Matches Java UserDefinedOpcode (Priority: P1)

When the TypeScript code loads a `.blue` file containing UDOs, it correctly reads all fields including `style`, `inputArguments`, and `comments`, and generates code matching the Java output for both classic and modern styles.

**Why this priority**: The opcode list is core infrastructure — every instrument that uses UDOs depends on it. If UDOs are incorrectly generated, instruments break.

**Independent Test**: Create a `UserDefinedOpcode` with modern style, call `generateCode()`, verify the output matches the Java format.

**Acceptance Scenarios**:

1. **Given** a classic-style UDO with `opcodeName="saturate"`, `outTypes="a"`, `inTypes="ak"`, **When** `generateCode()` is called, **Then** output is `\topcode saturate,a,ak\n<codeBody>\n\tendop`
2. **Given** a modern-style UDO with `opcodeName="saturate"`, `inputArguments="aSig, kDrive"`, `outTypes="a"`, **When** `generateCode()` is called, **Then** output is `opcode saturate(aSig, kDrive):a\n    <indented codeBody>\nendop`
3. **Given** a modern UDO with empty `outTypes`, **When** `generateCode()` is called, **Then** output uses `:void` signature
4. **Given** a UDO with modern style and multiple outputs (`outTypes="aa"`), **When** `generateCode()` is called, **Then** output uses `:(a,a)` signature
5. **Given** a UDO saved to XML and loaded back, **Then** all fields (including `style`, `inputArguments`, `comments`) are preserved

---

### User Story 2 — Effect UDOs Support Both Styles (Priority: P1)

When an Effect generates its UDO, it respects its `style` property to produce either classic or modern output. Java `Effect` defaults to `UDOStyle.MODERN`.

**Why this priority**: Effects produce UDOs that are called by BlueMixer. If effect UDO format is wrong, the mixer routing breaks.

**Independent Test**: Create an Effect with modern style, call `generateUDO(0)`, verify the output uses modern opcode syntax.

**Acceptance Scenarios**:

1. **Given** a classic-style Effect, **When** `generateUDO(0)` is called, **Then** the UDO includes `ain1,ain2\txin` and uses `opcode blueEffect0,aa,aa` header
2. **Given** a modern-style Effect, **When** `generateUDO(0)` is called, **Then** the UDO skips `xin`, uses `opcode blueEffect0(ain1, ain2):(a,a)` header, and indents the code body
3. **Given** legacy Effect XML without `<style>` element, **When** loaded, **Then** style defaults to CLASSIC
4. **Given** an Effect saved to XML and loaded back, **Then** the `style` field is preserved

---

### User Story 3 — UDOUtilities Parsing and Conversion (Priority: P2)

The `UDOUtilities` class can parse Csound UDO text (both classic and modern), convert between styles, and provide equivalence checking for UDO deduplication.

**Why this priority**: Parsing is needed for user-editable UDO text fields. Conversion is useful but less critical than correct generation. Equivalence checking enables UDO deduplication.

**Independent Test**: Parse `"opcode saturate(aSig, kDrive):a\n    aOut = tanh(aSig * kDrive)\n    xout aOut\nendop"` and verify it produces a modern-style `UserDefinedOpcode`.

**Acceptance Scenarios**:

1. **Given** modern UDO text with named arguments, **When** `parseUDOText()` is called, **Then** it returns a `UserDefinedOpcode` with `style=MODERN`, correct `inputArguments`, and `outTypes`
2. **Given** classic UDO text with comma-separated types, **When** `parseUDOText()` is called, **Then** it returns a `UserDefinedOpcode` with `style=CLASSIC`, correct `inTypes`, and `outTypes`
3. **Given** a classic UDO, **When** `convertToModern()` is called, **Then** `xin` args are extracted into `inputArguments`, `inTypes` is cleared, type annotations added for legacy types
4. **Given** a modern UDO, **When** `convertToClassic()` is called, **Then** `inputArguments` are converted to `xin` statement, type annotations stripped, `void` → `"0"` conversion
5. **Given** two UDOs with identical code bodies and types (ignoring whitespace), **When** `isEquivalent()` is called, **Then** they are considered equivalent
6. **Given** an OpcodeList with an equivalent UDO, **When** `getNameOfEquivalentCopy()` is called, **Then** it returns the existing UDO's name

---

### User Story 4 — Unit Tests Match Java JUnit Tests (Priority: P1)

The TypeScript UDO system has comprehensive unit tests mirroring the Java JUnit tests for `UDOUtilitiesTest`, `OpcodeListTest`, and `EffectTest`.

**Test Suite Structure** (files in `packages/blue-data/tests/`):

#### 4A. `udo/user-defined-opcode.test.ts` — mirrors `UserDefinedOpcode` behavior (implicit in other tests)

Tests for the core `OpcodeDefinition` (renamed conceptually to match `UserDefinedOpcode`):
- Classic style code generation (header, body, endop indentation)
- Modern style code generation (named args, colon output, indented body)
- Modern style with void output (`:void`)
- Modern style with multiple outputs (`:(a,a)`)
- XML serialization round-trip for both styles
- Legacy XML defaults to CLASSIC
- `isEquivalent()` comparison between UDOs
- `commentText` appended to opcode line

#### 4B. `udo/udo-utilities.test.ts` — mirrors `UDOUtilitiesTest.java` (20 tests)

**Parsing modern UDO text** (4 tests):
- `testParseModernUDOText` — basic modern UDO: `opcode name(args):types`
- `testParseModernUDOWithAnnotatedArgs` — modern with legacy annotations: `(kIn1:o, kIn2:j)`
- `testParseModernUDOWithColonOnNextLine` — header split across lines
- `testRecoverFromBrokenModernHeader` — graceful fallback on malformed input

**Parsing classic UDO text** (1 test):
- `testParseClassicUDOText` — `opcode name,outTypes,inTypes`

**Classic → Modern conversion** (5 tests):
- `testConvertClassicToModern` — extracts `xin` args into `inputArguments`
- `testConvertClassicToModernWithLegacyTypes` — adds `:o`/`:j` annotations for legacy types
- `testConvertClassicToModernMultipleOutputs` — `"aa"` → `"(a,a)"` output
- `testConvertClassicToModernVoidConversion` — empty `outTypes` → `"void"`
- `testConvertModernToClassic` — strips annotations, injects `xin`, `void` → `"0"`

**Modern → Classic conversion** (2 tests):
- `testConvertModernToClassic` — injects `xin` from `inputArguments`
- `testConvertModernToClassicAnnotationStripping` — removes `:o`/`:j` annotations

**XML round-trip** (1 test):
- `testSaveLoadModernUDOXML` — modern UDO survives save/load

**Equivalence** (2 tests):
- `testEquivalenceWithSpacingNormalization` — identical code with different whitespace is equivalent
- `testGetNameOfEquivalentCopy` — finds equivalent UDO in OpcodeList

**Output signature** (3 tests):
- `testModernOutputSignatureSingle` — `"a"` → `"a"`
- `testModernOutputSignatureMultiple` — `"aa"` → `"(a,a)"`
- `testModernOutputSignatureVoid` — `""` → `"void"`

**Display string** (2 tests):
- `testDisplayStringForOutTypes` — formatted display of output types
- `testModernUDOWithVoidOutputAndEmptyList` — void + `()` edge case

#### 4C. `udo/opcode-list.test.ts` — mirrors `OpcodeListTest.java` (3 tests)

- `testGetNameOfExistingCopy` — classic-style UDO equivalence matching (same code body + types = match)
- `testGetNameOfExistingModernCopy` — modern-style UDO equivalence (input arguments must match)
- `testLegacyXmlDefaultsToClassicStyle` — XML without `<style>` defaults to CLASSIC

#### 4D. `mixer/effect-udo.test.ts` — mirrors `EffectTest.java` (6 tests)

- `classicGenerateUDOIncludesXinLine` — classic effect: `xin`/`xout`, `inTypes="aa"`, `outTypes="aa"`
- `modernGenerateUDOSkipsXinLine` — modern effect: no `xin`, `inputArguments="ain1, ain2"`, `outTypes="a, a"`
- `modernGenerateCodeUsesModernHeader` — full generation: `opcode testEffect(ain1):a` format with indented body
- `modernGenerateCodeMultipleOutputs` — `:(a,a)` output for stereo
- `legacyXmlDefaultsToClassicStyle` — no `<style>` → CLASSIC
- `xmlRoundTripPreservesStyle` — MODERN survives save/load

**Acceptance Scenarios**:

1. **Given** all test files in `packages/blue-data/tests/udo/` and `packages/blue-data/tests/mixer/`, **When** `pnpm test` is run, **Then** all tests pass
2. **Given** the test names, **When** compared to Java JUnit tests, **Then** each Java test method has a matching TypeScript test
3. **Given** a classic UDO, **When** `generateCode()` is called, **Then** output uses tab-indented `opcode name,out,in` format
4. **Given** a modern UDO, **When** `generateCode()` is called, **Then** output uses `opcode name(args):out` format with 4-space indented body

---

### Edge Cases

- What happens when a UDO has empty `outTypes` in classic style? It should output `"0"` for classic and `:void` for modern.
- What happens when parsing a malformed modern header (e.g., missing closing paren)? `parseUDOText()` should return null or a best-effort classic UDO.
- What happens when converting a modern UDO with legacy annotations (`:o`, `:j`) to classic? Annotations are stripped.
- What happens with legacy `.blue` files that have no `<style>` element on UDOs? Default to CLASSIC.
- What happens with legacy Effect XML that has no `<style>` element? Default to CLASSIC.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `OpcodeDefinition` (renamed conceptually to `UserDefinedOpcode`) MUST have a `style` property with values `CLASSIC` and `MODERN`
- **FR-002**: `OpcodeDefinition` MUST have an `inputArguments` property for modern-style named input arguments
- **FR-003**: `OpcodeDefinition` MUST have a `comments` property for user-facing comments
- **FR-004**: `OpcodeDefinition.generateCode()` MUST produce classic-style output when `style=CLASSIC` (tab-indented header, `opcode name,outTypes,inTypes`, no body indentation, tab-indented `endop`)
- **FR-005**: `OpcodeDefinition.generateCode()` MUST produce modern-style output when `style=MODERN` (no tab, `opcode name(args):outTypes`, 4-space body indentation, no tab on `endop`)
- **FR-006**: Modern-style output types MUST be formatted as: single letter for one type (`a`), parenthesized comma-separated for multiple (`(a,a)`), or `void` for none
- **FR-007**: `OpcodeDefinition.toCSD()` MUST delegate to `generateCode()` (not duplicate logic)
- **FR-008**: `OpcodeDefinition` XML serialization MUST save/load the `style`, `inputArguments`, and `comments` fields
- **FR-009**: `OpcodeDefinition.loadFromXML()` MUST default to `CLASSIC` style when no `<style>` element is present (backward compatibility)
- **FR-010**: `Effect` MUST have a `style` property defaulting to `MODERN` (matching Java)
- **FR-011**: `Effect.generateUDO()` MUST use classic format when `style=CLASSIC` (includes `xin`, concatenated type codes)
- **FR-012**: `Effect.generateUDO()` MUST use modern format when `style=MODERN` (no `xin`, named args, comma-separated output types)
- **FR-013**: `Effect` XML serialization MUST save/load the `style` field
- **FR-014**: `Effect.loadFromXML()` MUST default to `CLASSIC` style when no `<style>` element is present
- **FR-015**: `UDOUtilities` MUST implement `parseUDOText()` for both classic and modern UDO text formats
- **FR-016**: `UDOUtilities` MUST implement `convertToModern()` and `convertToClassic()` for style conversion
- **FR-017**: `UDOUtilities` MUST implement `getModernOutputSignature()` for type code formatting
- **FR-018**: `OpcodeDefinition.isEquivalent()` MUST compare UDOs with style awareness (classic compares `inTypes`, modern compares `inputArguments`)
- **FR-019**: `OpcodeList` MUST implement `getNameOfEquivalentCopy()` using `isEquivalent()` for UDO deduplication
- **FR-020**: All UDO-related XML serialization MUST round-trip correctly for both classic and modern styles

### Key Entities

- **UDOStyle**: Enum — `CLASSIC`, `MODERN`. Determines opcode declaration syntax.
- **OpcodeDefinition** (conceptually `UserDefinedOpcode`): Represents a Csound User Defined Opcode with name, style, types, input arguments, code body, and comments.
- **UDOUtilities**: Static utility class for parsing Csound UDO text, converting between styles, generating output signatures, and checking equivalence.
- **OpcodeList**: Collection of `OpcodeDefinition` objects with deduplication support.
- **Effect**: Mixer effect that generates UDOs using the same classic/modern style system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A modern-style UDO generates `opcode name(args):outTypes` format with 4-space indented body
- **SC-002**: A classic-style UDO generates `\topcode name,outTypes,inTypes` format with tab-indented `endop`
- **SC-003**: Effect UDO generation respects the `style` property and defaults to `MODERN` for new effects
- **SC-004**: UDO XML serialization round-trips correctly for both classic and modern styles
- **SC-005**: `UDOUtilities.parseUDOText()` correctly parses both classic and modern Csound UDO text
- **SC-006**: `OpcodeList.getNameOfEquivalentCopy()` finds equivalent UDOs for deduplication
- **SC-007**: All existing tests continue to pass (no regressions)
- **SC-008**: All UDO system test files pass with `pnpm test`
- **SC-009**: Test count is approximately 29 tests across the 4 test files (20 + 3 + 6 from Java, plus OpcodeDefinition tests)

## Test Coverage Summary

| # | Test File | Java Source | Tests |
|---|-----------|-------------|-------|
| 4A | `udo/user-defined-opcode.test.ts` | `UserDefinedOpcode` behavior | ~10 |
| 4B | `udo/udo-utilities.test.ts` | `UDOUtilitiesTest.java` | 20 |
| 4C | `udo/opcode-list.test.ts` | `OpcodeListTest.java` | 3 |
| 4D | `mixer/effect-udo.test.ts` | `EffectTest.java` | 6 |
| | **Total** | | **~39** |

## Assumptions

- The Java `UserDefinedOpcode` class is the authoritative design
- The `OpcodeDefinition` TypeScript class will be updated in-place (not renamed) to match Java behavior
- The `UDOStyle` enum will be added as a new TypeScript file
- `UDOUtilities` will be a new TypeScript utility class
- Classic UDOs use tab (`\t`) for indentation; modern UDOs use 4 spaces
- Java defaults new Effects to `MODERN` style; legacy files without `<style>` default to `CLASSIC`
- The `isEquivalent()` method normalizes whitespace for comparison
- Modern-style legacy annotations (`:o`, `:j`) are Csound-specific type specifiers that must be preserved during modern ↔ classic conversion
