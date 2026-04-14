# Tasks: CSD Render Parity with Java CSDRender

**Input**: Design documents from `specs/005-csd-render-parity/`
**Prerequisites**: Spec 004 complete (BSB instrument loading)

---

## Phase 22: Mixer Init Statements

- [x] T501 [P] Add Mixer field to BlueData class
- [x] T502 [P] Load mixer from XML (support `<channelList>` element format)
- [x] T503 Implement `Mixer.getInitStatements()` → `ga_bluemix_X_Y init 0`
- [x] T504 [P] Generate source channel inits: `ga_bluemix_{id}_{ch} init 0`
- [x] T505 [P] Generate sub channel inits: `ga_bluesub_{name}_{ch} init 0`
- [x] T506 [P] Generate master channel inits: `ga_bluesub_Master_{ch} init 0`
- [x] T507 [P] Assign channel IDs via `assignChannelIds()`
- [x] T508 [P] Append mixer inits to globalOrc in `BlueData.toCSD()`

---

## Phase 23: CSD Header and Structure

- [x] T509 Move sr/ksmps/nchnls/0dbfs from `<CsOptions>` to `<CsInstruments>` header
- [x] T510 [P] Implement `BlueData.buildOrchestraHeader()` → `sr=44100\nksmps=64\nnchnls=2\n0dbfs=1`
- [x] T511 Change CsOptions to only `-odac\n-d`
- [x] T512 [P] Add project info comments: `; "title"\n; by author\n; notes`
- [x] T513 [P] Change score sustain from `f 0 <dur>` to `e` statement
- [x] T514 Append UDO list from `OpcodeList.toString()`

---

## Phase 24: Parameter and String Channel Handling

- [x] T515 Load automation parameters from arrangement
- [x] T516 Generate parameter init statements: `gk_blue_autoN init <value>`
- [x] T517 Generate `chnexport` for real-time parameters
- [x] T518 Load BSB StringChannels from instrument library
- [x] T519 Generate string channel inits: `gS_blue_strN = "value"`
- [x] T520 Generate `chnexport` for string channels

---

## Phase 25: Integration + Testing

- [x] T521 [P] Test: Generated CSD contains mixer inits
- [x] T522 [P] Test: Generated CSD has sr/ksmps/nchnls/0dbfs in orchestra header
- [x] T523 [P] Test: Generated CSD ends with `e` statement
- [x] T524 [P] Test: Project info comments present
- [x] T525 Test: CSD generates valid Csound output
- [x] T526 [P] Test: All 123 existing tests still pass
