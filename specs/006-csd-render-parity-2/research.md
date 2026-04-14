# Research: CSD Render Parity — Phase 2

**Date**: 2026-04-14
**Source**: Java CSDRender.java, ParameterHelper.java, ParameterNameManager.java, Mixer.java, MixerNode.java, TempoMap.java

## Decision 1: Parameter Compilation via `setupForCompilation`

**What**: BSB widgets check if their `objectName` matches a `Parameter.name` in the instrument's `ParameterList`. If a parameter exists and has a `compilationVarName`, the widget replaces `<objectName>` with that variable name instead of the raw value.

**Rationale**: This is the exact Java mechanism. Each widget's `setupForCompilation` method does the lookup. We replicate this in TypeScript by having each BSB widget accept a `ParameterList` reference and checking for a matching parameter before falling back to the raw value.

**Alternatives considered**:
- Replace values at a higher level (post-compilation string replacement) — rejected because parameters can have different types (k-rate, i-rate) requiring context-aware formatting
- Pre-compute a two-pass map — rejected because the Java does it in one pass during compilation

**Key Java logic** (BSBHSlider.setupForCompilation):
```java
Parameter param = parameters.getParameter(this.getObjectName());
if (param != null && param.getCompilationVarName() != null) {
    compilationUnit.addReplacementValue(getObjectName(), param.getCompilationVarName());
    return;
}
compilationUnit.addReplacementValue(getObjectName(), NumberUtilities.formatDouble(getValue()));
```

## Decision 2: Parameter Name Assignment — Monotonic Counter

**What**: Use a simple counter starting at 0, assigning `gk_blue_auto0`, `gk_blue_auto1`, etc. in collection order: arrangement instruments first, then mixer source channels, sub-channels, and master.

**Rationale**: Matches Java's `ParameterNameManager` exactly. The collection order in `ParameterHelper.getAllParameters()` is: instruments → mixer sources → mixer subs → mixer master. This produces stable, predictable names.

**Alternatives considered**:
- Per-instrument namespacing — rejected because Java uses a global counter
- Hash-based names — rejected because Java uses sequential numbering

## Decision 3: Mixer Effect UDO Generation

**What**: Each enabled `Effect` in a mixer channel's effects chain generates a `blueEffectN` UDO. The effect code uses BSB compilation (same widget replacement as instruments). Effects are deduplicated by comparing code body.

**Rationale**: Java's `Effect.generateUDO()` creates a UDO with the effect's code, wrapped in `xin`/`xout`. The `MixerNode.applyEffects()` deduplicates using `OpcodeList.getNameOfEquivalentCopy()`. The UDO format is MODERN style: `opcode blueEffect0(ain1, ain2):a, a`.

**Key format** (from reference CSD):
```
opcode blueEffect0,aa,aa ; 2pole LPF
ain1,ain2	xin
kcut = cpsoct(gk_blue_auto100 + 4)
aout1 = zdf_2pole(ain1, kcut, 0.5)
aout2 = zdf_2pole(ain2, kcut, 0.5)
xout	aout1,aout2
endop
```

## Decision 4: BlueMixer Instrument Generation

**What**: The mixer builds a routing graph (source channels → sub-channels → master), applies effects at each node, then outputs via `outc`. The instrument clears all audio variables after output.

**Rationale**: Java's `MixerNode.getMixerGraph()` builds a tree, then `getMixerCode()` walks it topologically. For demo2022.blue, the structure is:
- Sources 0,1,2 → apply their effect chains → route to Master
- Master → apply reverb send from sub-channel "Reverb" → output via outc

**Key format** (from reference CSD lines 1247-1351):
```
instr 4	;untitled          ← effect for source 0 (Alpha v3)
instr 5	;untitled          ← effect for source 1 (Alpha v3) 
instr BlueMixer             ← master mixer
```

## Decision 5: Tempo Statement from TempoMap

**What**: Load TempoMap from the Score's timeState. If enabled, generate a `t 0 <tempo>` statement. For single-point tempo maps (most common), it's just `t 0 <value>`.

**Rationale**: Java's `CSDRender.getTempoScore()` handles single-point, multi-point, and render-start offset cases. For demo2022.blue, there's a single tempo point at beat 0 with value `95.333...`, producing `t 0 95.33333333333333`.

**Alternatives considered**:
- Always emit tempo — rejected because Java only emits when TempoMap is enabled
- Parse `t` from globalOrc as fallback — deferred (Java does this when TempoMap is disabled)

## Decision 6: totalDur and Always-On Scheduling

**What**: After generating all notes, compute `totalDur = max(startTime + duration)` across all notes. Schedule always-on instruments for `totalDur`, BlueMixer for `globalDur = max(totalDur, globalScoreDur) + extraRenderTime`.

**Rationale**: Matches Java exactly. Always-on instruments run for `totalDur`, BlueMixer runs slightly longer to account for reverb tails.

## Decision 7: UDO Deduplication

**What**: Collect all UDOs into a single OpcodeList, skipping duplicates by name. Java uses `OpcodeList.getNameOfEquivalentCopy()` which compares code body.

**Rationale**: Both Alpha v3 instruments have identical UDO sets (13 UDOs each). The reference has 15 total (13 shared + 2 effect UDOs). We need to deduplicate to avoid redefining the same UDO twice.

## Current TypeScript State

| Component | Status | Gap |
|-----------|--------|-----|
| `CompileData` | Exists, empty | Needs parameter name manager |
| `Parameter` | Exists with name/value/min/max | Needs `compilationVarName` field |
| `BSBCompilationUnit` | Exists, does raw value replacement | Needs parameter-aware mode |
| `BSB widgets` | Each has `objectName`, `value` | Need `parameterName` and parameter lookup |
| `Mixer` | Loads XML, generates source inits | Missing effect chains, sub-channels, BlueMixer |
| `Score` | Generates notes | Missing tempo statement |
| `BlueData.toCSD()` | Assembles CSD | Missing mixer integration, always-on scheduling |
