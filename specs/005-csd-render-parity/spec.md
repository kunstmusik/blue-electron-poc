# Spec 005: CSD Render Parity with Java CSDRender

**Feature Branch**: `005-csd-render-parity`
**Created**: 2026-04-13
**Status**: Draft
**Input**: Java CSDRender class (`blue.ui.core.render.CSDRender`) — 1145 lines

## Background

The Java `CSDRender` class is the authoritative reference for how Blue generates CSD. The current TypeScript implementation in `BlueData.toCSD()` and `CompileData.toCSD()` follows a different pattern that produces incomplete CSD output.

### Key Differences Found

| Feature | Java CSDRender | TypeScript Current | Gap |
|---------|---------------|-------------------|-----|
| **Mixer init statements** | Generated from `Mixer.getInitStatements()` → `ga_bluemix_X_Y init 0` | ❌ Missing | **Critical** |
| **Parameter init statements** | `gk_blue_autoN init <value>` + `chnexport` | ❌ Missing | **Critical** |
| **String channel init** | `gS_blue_strN = "path.wav"` + `chnexport` | ❌ Missing | **Critical** |
| **sr/ksmps/nchnls/0dbfs** | In `<CsInstruments>` header | In `<CsOptions>` | **Bug** |
| **`e` statement** | `e\n` at end of score | `f 0 <dur>` only | Minor |
| **Project info comments** | `; "title"\n; by author\n` | ❌ Missing | Nice-to-have |
| **UDO list** | Appended from OpcodeList | ❌ Missing | Nice-to-have |

### Why the demo2022.blue file has empty `<globalOrc/>`

The `.blue` file stores **empty** `<globalOrc/>` elements because Java Blue **generates** globalOrc at render time from:
1. **Mixer configuration** → `ga_bluemix_X_Y init 0` + sub channel inits
2. **Automation parameters** → `gk_blue_autoN init <value>` + `chnexport`
3. **BSB StringChannels** → `gS_blue_strN = "path.wav"` + `chnexport`

The `CSDRender.generateCSDImpl()` method orchestrates all of this:

```java
// Java CSDRender.java (simplified flow)
Mixer mixer = new Mixer(data.getMixer());
assignChannelIds(compileData, mixer);

// 1. Generate score notes
NoteList generatedNotes = data.getScore().generateForCSD(compileData, startTime, endTime);

// 2. Pre-generate orchestra (adds compile-time instruments, F-tables)
arrangement.preGenerateOrchestra(compileData, mixer, nchnls, alwaysOnInstruments);

// 3. Generate globalSco
globalSco += arrangement.generateGlobalSco(compileData);
globalSco = preprocessSco(globalSco, totalDur, renderStartTime, processingStart, tempoMap);

// 4. Add mixer init statements to globalOrc ← THIS IS THE KEY PIECE
if (mixerEnabled) {
    globalOrcSco.appendGlobalOrc(
        mixer.getInitStatements(compileData, nchnls));  // ga_bluemix_X_Y init 0
    
    arrangement.addInstrumentWithId(
        mixer.getMixerInstrument(compileData, udos, nchnls),
        "BlueMixer", false);
}

// 5. Add parameter init statements to globalOrc
handleParameters(parameters, stringChannels, globalOrcSco, generatedNotes, ...);

// 6. Write CSD with orchestra header (sr/ksmps/nchnls/0dbfs)
appendCsInstruments(compileData, data, udos, arrangement, globalOrcSco, csd, mixer, isRealTime);
```

### Java's `appendCsInstruments()` Output

```csound
<CsInstruments>
sr=44100
ksmps=64
nchnls=2
0dbfs=1

; globalOrc from GlobalOrcSco (stored in .blue file)
; globalOrc from Mixer.getInitStatements() → ga_bluemix_X_Y init 0
; globalOrc from handleParameters() → gk_blue_autoN init <value>

; UDOs from OpcodeList

; Instruments from arrangement.generateOrchestra()
    instr 1    ;Alpha v3
...
</CsInstruments>
```

### Java's `appendCsScore()` Output

```csound
<CsScore>

; F-tables from Tables

; globalSco from GlobalOrcSco + arrangement.generateGlobalSco() + preprocessing

; generatedNotes from score.generateForCSD()
; parameter score notes from handleParameters()

e

</CsScore>
```

## Requirements

### Functional Requirements

#### CSD Header (Orchestra)
- **FR-501**: `sr`, `ksmps`, `nchnls`, `0dbfs` MUST be in `<CsInstruments>` header, NOT `<CsOptions>`
- **FR-502**: Real-time mode uses `sampleRate`/`ksmps`/`nchnls`/`zeroDbFS` from ProjectProperties
- **FR-503**: Disk render mode uses `diskSampleRate`/`diskKsmps`/`diskChannels`/`diskZeroDbFS`

#### Mixer Global Orchestra
- **FR-504**: `Mixer.getInitStatements()` generates `ga_bluemix_X_Y init 0` for each mixer channel
- **FR-505**: Source channel inits: `ga_bluemix_{sourceIdx}_{chIdx} init 0`
- **FR-506**: Sub channel inits: `ga_bluesub_{subName}_{chIdx} init 0`
- **FR-507**: Master channel inits: `ga_bluesub_Master_{chIdx} init 0`

#### Parameter Global Orchestra
- **FR-508**: Each automation parameter gets `gk_blue_autoN init <initialValue>` in globalOrc
- **FR-509**: Real-time mode: parameters get `gk_blue_autoN chnexport "gk_blue_autoN", 3`
- **FR-510**: Disk render mode: parameters generate instrument + score notes for automation curves

#### String Channel Global Orchestra
- **FR-511**: BSB StringChannels get unique names via StringChannelNameManager
- **FR-512**: String channels get `gS_blue_strN = "value"` + `chnexport` in globalOrc

#### Score Generation
- **FR-513**: Score ends with `e` statement (not just `f 0 <dur>`)
- **FR-514**: Project info comments prepended: `; "title"\n; by author\n; notes`
- **FR-515**: UDO list appended after globalOrc, before instruments

## Success Criteria

- **SC-501**: Generated CSD for `demo2022.blue` contains `ga_bluemix_X_Y init 0` mixer inits
- **SC-502**: Generated CSD for `demo2022.blue` contains `gS_blue_strN = "..."` string channels
- **SC-503**: Generated CSD for `demo2022.blue` contains `gk_blue_autoN init <value>` parameters
- **SC-504**: sr/ksmps/nchnls/0dbfs in `<CsInstruments>`, not `<CsOptions>`
- **SC-505**: CSD ends with `e` statement
- **SC-506**: 122 existing tests still pass
- **SC-507**: CSD generates valid Csound that produces audio through blue-engine

## Assumptions

- Mixer system is already loaded from XML (TBD — need to verify)
- Automation parameters are already loaded from XML (TBD — need to verify)
- BSB StringChannels are already loaded from XML (TBD — need to verify)
- The blue-engine's `blue_shm_get:k()` opcodes read from the same shared memory channels
- We're implementing real-time mode only for now (disk render is future work)
