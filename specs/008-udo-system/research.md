# Research: UDO System (OpcodeDefinition → UserDefinedOpcode Parity)

**Date**: 2026-04-14
**Source**: Java `blue.udo.UserDefinedOpcode`, `blue.udo.UDOStyle`, `blue.udo.OpcodeList`, `blue.utility.UDOUtilities`, `blue.mixer.Effect`

## Root Cause

The TypeScript `OpcodeDefinition` class is a simplified stub that only generates classic-style Csound UDO syntax. The Java `UserDefinedOpcode` class supports both **classic** and **modern** UDO styles, which produce fundamentally different opcode declaration syntax.

**Classic style** — traditional Csound UDO syntax:
```
    opcode saturate,a,ak
    aSig, kDrive    xin
    aOut = tanh(aSig * kDrive)
    xout aOut
    endop
```

**Modern style** — newer Csound syntax with named arguments:
```
opcode saturate(aSig, kDrive):a
    aOut = tanh(aSig * kDrive)
    xout aOut
endop
```

The TypeScript code only generates classic style. This causes issues when:
- Loading `.blue` files that use modern-style UDOs (the `inputArguments` field is silently lost)
- Effects generate UDOs in classic style while Java defaults to modern style (different output)
- The `isEquivalent()` deduplication method doesn't exist, causing duplicate UDOs in the CSD

## TypeScript OpcodeDefinition — Current State

Fields:
- `_name: string` — opcode name
- `_outTypes: string` — output type codes (e.g., `"aa"`)
- `_inTypes: string` — input type codes
- `_code: string` — code body

Missing:
- `style` (UDOStyle enum)
- `inputArguments` (modern-style named args)
- `commentText` (transient comment on opcode line)
- `comments` (user-facing comments)

`toCSD()` always generates: `opcode name,outTypes,inTypes\n code \nendop`

## Java UserDefinedOpcode — Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `opcodeName` | String | `"newOpcode"` | UDO name |
| `style` | UDOStyle | CLASSIC | Classic or Modern |
| `outTypes` | String | `""` | Output type codes |
| `inTypes` | String | `""` | Input type codes (classic) |
| `inputArguments` | String | `""` | Named input args (modern) |
| `codeBody` | String | `""` | Implementation code |
| `commentText` | String (transient) | `null` | Comment on opcode line |
| `comments` | String | `""` | User comments |

## Code Generation Differences

### Classic (`generateCode()`)
- Header: `\topcode name,outTypes,inTypes` (tab-indented, comma-separated types)
- Body: code as-is (no added indentation)
- End: `\tendop` (tab-indented)

### Modern (`generateModernCode()`)
- Header: `opcode name(args):outTypes` (no tab, parentheses, colon)
- Output types: single letter `a`, parenthesized `(a,a)`, or `void`
- Body: every non-blank line indented with 4 spaces
- End: `endop` (no indent)
- No `xin` statement (inputs declared in header)

## Effect UDO Generation

Java `Effect.generateUDO()`:
- Defaults to `UDOStyle.MODERN`
- Classic: includes `xin` line, sets `inTypes="aa"`, `outTypes="aa"`
- Modern: skips `xin`, sets `inputArguments="ain1, ain2"`, `outTypes="a, a"`

TypeScript `Effect.generateUDO()`:
- Always classic: includes `xin` line, `opcode blueEffectN,aa,aa`
- No style awareness

## UDOUtilities (659 lines in Java, absent in TypeScript)

Key methods:
- `parseUDOText(String)` — parses Csound UDO text into `UserDefinedOpcode` object
- `convertToModern(UserDefinedOpcode)` — classic → modern (extracts `xin`, adds legacy annotations)
- `convertToClassic(UserDefinedOpcode)` — modern → classic (strips annotations, injects `xin`)
- `getModernOutputSignature(String)` — converts `"aa"` → `"(a,a)"`, `"a"` → `"a"`, `""` → `"void"`
- `getNameOfEquivalentCopy(UserDefinedOpcode, OpcodeList)` — finds equivalent UDOs for deduplication
- `isEquivalent(UserDefinedOpcode, UserDefinedOpcode)` — compares UDOs with style awareness
