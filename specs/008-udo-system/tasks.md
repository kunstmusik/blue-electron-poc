# Spec 008: UDO System — Implementation Tasks

## Phase 1: UDOStyle Enum + OpcodeDefinition Enhancements

- [ ] Create `UDOStyle` enum (`CLASSIC`, `MODERN`) in `src/opcodes/udo-style.ts`
- [ ] Add fields to `OpcodeDefinition`: `style`, `inputArguments`, `commentText`, `comments`
- [ ] Implement `generateCode()` dispatching to classic/modern paths
- [ ] Implement `generateModernCode()` with `indentModernCodeBody()` helper
- [ ] Implement `isEquivalent()` with style-aware comparison
- [ ] Update `saveAsXML()` / `loadFromXML()` for new fields
- [ ] Update `deepCopy()` for new fields

## Phase 2: UDOUtilities

- [ ] Create `src/opcodes/udo-utilities.ts`
- [ ] Implement `parseUDOText()` state machine (3 states)
- [ ] Implement `parseUDODeclaration()` (modern regex + classic comma-split)
- [ ] Implement `getModernOutputSignature()`, `normalizeModernOutTypes()`, `normalizeClassicOutTypes()`
- [ ] Implement `convertToModern()` and `convertToClassic()`
- [ ] Implement helper methods: `getInTypesFromInputArguments()`, `getInputArgumentsFromCodeBody()`, `removeXinLines()`, `parseTypeTokens()`, etc.

## Phase 3: OpcodeList + Effect Updates

- [ ] Add `getNameOfEquivalentCopy()` to `OpcodeList`
- [ ] Add `style` field to `Effect` (default `MODERN`, legacy XML defaults to `CLASSIC`)
- [ ] Rewrite `Effect.generateUDO()` to return an `OpcodeDefinition` with style-aware output
- [ ] Update `Effect.saveAsXML()` / `loadFromXML()` for style field
- [ ] Update `Effect.deepCopy()` for style

## Phase 4: Integration — CSD Generation Updates

- [ ] Update `blue-data.ts` to use `generateCode()` instead of `toCSD()`
- [ ] Update effect UDO generation in `generateMixerOrchestra()` to use new `Effect.generateUDO()` pattern

## Phase 5: Unit Tests

- [ ] `tests/udo/user-defined-opcode.test.ts` — classic/modern generation, XML round-trip, equivalence
- [ ] `tests/udo/udo-utilities.test.ts` — parsing, conversion, output signatures (~20 tests)
- [ ] `tests/udo/opcode-list.test.ts` — equivalence matching, legacy XML (3 tests)
- [ ] `tests/mixer/effect-udo.test.ts` — classic/modern effect UDO generation (6 tests)

## Phase 6: Verification

- [ ] `pnpm test` — all tests pass (no regressions)
- [ ] demo2022.blue CSD generation still produces 1205 notes
