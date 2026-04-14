# Tasks: CSD Render Parity — Phase 2

**Input**: Design documents from `specs/006-csd-render-parity-2/plan.md`

## Phase A: Parameter-Aware BSB Compilation ✅

- [x] A1. Modify `BSBWidget.collectReplacements()` to look up by `objectName` in Parameter[] for `compilationVarName`
- [x] A2. Thread `Parameter[]` through `BSBGroup.collectReplacements()` and `BSBGraphicInterface.collectReplacements()`
- [x] A3. Modify `BlueSynthBuilder.generateInstrument()` to accept `Parameter[]` and pass to graphic interface
- [x] A4. Modify `Arrangement.generateOrchestra()` to accept `Parameter[]` map and pass per-instrument
- [x] A5. Modify `BlueData.toCSD()` to wire parameters into BSB compilation
- [x] A6. Build, run `test-csd.js`, verify hardcoded `i()` count drops from 70+ to 0

## Phase B: Mixer Sub-Channels & Effects ✅

- [x] B1. Fix sub-channel loading from XML (`<channelList list='subChannels'>`)
- [x] B2. Enhance Channel loading (name from child element, effectsChain bin='pre/post', sends)
- [x] B3. Enhance Effect to load full BSB structure (code, graphicInterface, parameterList)
- [x] B4. Fix Send loading to read `<sendChannel>` and send parameters
- [x] B5. Generate sub-channel init statements (ga_bluesub_Reverb_0/1)
- [x] B6. Generate `blueEffectN` UDOs from effect chain code with parameter replacement
- [x] B7. Generate always-on instruments from BSB `alwaysOnInstrumentText`
- [x] B8. Generate BlueMixer instrument with routing graph
- [x] B9. Collect mixer parameters (volume, send amounts, effect params)

## Phase C: Tempo & Always-On Scheduling ✅

- [x] C1. Fix TempoMap loading from `<timeContext>/<meterMap>/<tempoMap>`
- [x] C2. Generate `t 0 <tempo>` statement in `<CsScore>`
- [x] C3. Compute `totalDur` from generated notes
- [x] C4. Schedule always-on instruments and BlueMixer in score
- [x] C5. Remove `<CsOptions>` for realtime CSD output
- [x] C6. Build, run `test-csd.js`, verify tempo and always-on events

## Phase D: UDO Deduplication & Structural Polish ✅

- [x] D1. Deduplicate UDOs across instruments (collect unique set by name)
- [x] D2. Verify CsOptions removed for realtime
- [x] D3. CSD compiles and runs successfully with Csound
- [x] D4. Final comparison: 10/10 mixer inits, 6/6 instruments, 15/15 UDOs, 0 hardcoded i()
