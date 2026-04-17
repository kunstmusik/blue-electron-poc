# Project Status — blue-electron + blue-engine

**Date**: 2026-04-17
**blue-electron branch**: `004-bsb-instruments`
**blue-engine branch**: `main`

## Current State

The `blue_shm_export` experiment is closed. The product path has been returned to standard Csound `chnexport`, and `blue-engine` now bridges native Csound control channels to shared memory instead of trying to expose shared memory directly inside generated orchestra code.

This is the state to resume from in a new session:

- `blue-electron` generates `chnexport` again for `gk_blue_autoN`.
- `blue-app` compiles orchestra first, then sends fixed parameter values and automation definitions to `blue-engine`.
- `blue-engine` treats native Csound control channels as the source of truth.
- Shared memory remains available, but only as a fast scalar control-channel read mirror.
- The `blue_shm_*` opcode path has been removed from `blue-engine`.

## Automation Investigation: Java Parity Pass

Playback with `demo2022.blue` had still sounded wrong after the return to `chnexport`. The next debugging pass focused on comparing `blue-electron` directly against the Java implementation in `~/work/nbprojects/blue`, then fixing the highest-confidence mismatches in the TypeScript loader and mixer renderer.

### What Was Compared

A full comparison was made between the Java `blue` project (`~/work/nbprojects/blue`) and `blue-app` (`~/work/blue-electron`) to find every source of `Automatable` parameters.

**Java sources (ParameterHelper.java lines 37-68):**

1. **BSB Instruments** — `arr.getInstrumentAssignment(i).instr` checked for `instanceof Automatable`; `BlueSynthBuilder` is the only `Automatable` instrument.
2. **Mixer source channels** — each channel's pre-effects, post-effects, and `levelParameter` (Volume).
3. **Mixer sub-channels** — same per-channel collection.
4. **Master channel** — `mixer.getMaster()` is a dedicated `Channel` field, collected with `appendAllParametersFromChannel()`.

**Java per-channel collection (ParameterHelper.java lines 105-127):**

- `preEffects` chain — each `Effect` and `Send` is `Automatable`, calls `.getParameterList()`.
- `postEffects` chain — same.
- `channel.getLevelParameter()` — always one `Parameter` named "Volume" (min -96, max 12).

**Java mixer rendering path (MixerNode.java lines 92-188, 312-434):**

- The mixer walks full ordered `EffectsChain` contents, where both `Effect` and `Send` are first-class items.
- Rendering order is:
  1. pre-fader chain
  2. channel fader (`levelParameter`)
  3. post-fader chain
  4. route to outChannel
- Subchannels are sorted so feedforward dependencies render before their targets.
- `Send` uses `send.getLevelParameter().getCompilationVarName()`, not a separate ad hoc value path.

### Bugs Found and Fixed

#### Bug 1: All channels shared one Volume automation variable (CRITICAL)

**File:** `packages/blue-data/src/blue-data.ts`

`generateBlueMixer()` called `findMixerParam(allParameters, 'Volume')` which searched ALL parameters by name "Volume" and returned the **last** match. Since every channel has a "Volume" parameter, every channel in the BlueMixer instrument used the same `gk_blue_autoN`.

**Fix:** Replaced with `channel.getLevelParameter().getCompilationVarName()` per channel, matching Java's `MixerNode.applyFader()`. Each channel now uses its own unique variable. Removed `findMixerParam()` entirely.

#### Bug 2: No Master channel object (CRITICAL)

**File:** `packages/blue-data/src/mixer/mixer.ts`

Java's `Mixer` has a dedicated `Channel master` field (`Mixer.java:59`), separate from `_channels` and `_subChannels`. The master is saved as a direct `<channel>` child of `<mixer>` in XML (`Mixer.java:157`). `ParameterHelper.getAllParameters()` collects it with `appendAllParametersFromChannel(params, mixer.getMaster())` (line 64).

blue-app had **no master channel field**. The previous lookup tried to find "Master" by name in `_channels` or `_subChannels`, but the Java Mixer stores master separately — it's never in either list. Master volume was never collected or automated.

**Fix:** Added `_master` Channel field to `Mixer`, loaded from the direct `<channel>` child in XML (matching Java's `Mixer.loadFromXML` case `"channel"`). Added `getMaster()`/`setMaster()`. Added Master volume processing in `generateBlueMixer()` before `outc`.

#### Bug 3: Channel had no proper levelParameter (CRITICAL)

**File:** `packages/blue-data/src/mixer/channel.ts`

Java's `Channel` constructor (`Channel.java:84-91`) creates a `Parameter levelParameter` with name "Volume", min -96, max 12, value 0, resolution -1. This is loaded from `<parameter>` XML children (`Channel.java:143-147`).

blue-app's `Channel` had `_parameter: any = null` and `getChannelParameter()` returning null by default. The `<parameter>` XML loading was incomplete (manual attribute parsing instead of `Parameter.loadFromXML()`).

**Fix:** Added `_levelParameter: Parameter` initialized in constructor (matching Java's defaults). Added `getLevelParameter()`/`setLevelParameter()`. XML loading now uses `Parameter.loadFromXML()` and syncs the fixed value from the channel level.

#### Bug 4: Java parameter XML was not actually being parsed for mixer channels (CRITICAL)

**Files:** `packages/blue-data/src/automation/parameter.ts`, `packages/blue-data/src/mixer/channel.ts`

Even after switching `Channel.loadFromXML()` to call `Parameter.loadFromXML()`, the TypeScript `Parameter.loadFromXML()` implementation still only handled a simplified non-Java format:

- it ignored `automationEnabled`
- it ignored `value`
- it ignored Java's `<line><linePoint x='...' y='...'/></line>` structure
- it treated automation as `enabled && points.length >= 2` instead of the Java boolean flag

That meant mixer volume automation from Java `.blue` files was still being collapsed to fixed values.

**Fix:** `Parameter.loadFromXML()` now reads the Java attributes (`min`, `max`, `bdresolution`, `automationEnabled`, `value`, `label`) and the Java `<line>/<linePoint>` format. `Parameter.isAutomationEnabled()` now matches the Java boolean flag instead of inferring from point count.

#### Bug 5: Sends were not modeled like Java `Automatable` chain items (CRITICAL)

**Files:** `packages/blue-data/src/mixer/send.ts`, `packages/blue-data/src/mixer/effects-chain.ts`, `packages/blue-data/src/automation/parameter-helper.ts`

Java stores `Send` inside `EffectsChain` alongside `Effect`, preserving order and exposing the send level as a real `Parameter` named `Send Amount`.

`blue-electron` had diverged in three ways:

- `EffectsChain` only stored `Effect` items and kept sends in a side list
- `Send.loadFromXML()` only loaded a partial subset of parameter data
- `ParameterHelper` handled sends separately instead of treating them as ordered chain items

**Fix:** `EffectsChain` now preserves ordered `Effect`/`Send` items from XML, `Send` now owns a Java-like `levelParameter`, and `ParameterHelper` now walks mixer chains the same way Java does.

#### Bug 6: BlueMixer was not rendering full Java-style pre/post chains (CRITICAL)

**File:** `packages/blue-data/src/blue-data.ts`

The previous `generateBlueMixer()` path was still a large simplification of Java `MixerNode`:

- source channels only used the last enabled pre-effect
- subchannels only considered pre-effects
- sends were not applied in ordered chain position
- master pre/post effects were ignored
- subchannels were not sorted by feedforward dependency

**Fix:** `generateBlueMixer()` now:

- walks ordered pre and post chains for source channels, subchannels, and master
- applies sends in chain order
- uses `send.getLevelParameter()` for send gain
- applies master effects before `outc`
- sorts subchannels into a feedforward render order based on outChannel/send targets

#### Bug 7: Effect nested `opcodeList` definitions were loaded but not emitted (PARITY)

**Files:** `packages/blue-data/src/mixer/effect.ts`, `packages/blue-data/src/blue-data.ts`

Java effects can carry internal UDO dependencies via `opcodeList`. Those opcodes are part of the effect render path and must be present in the generated CSD when the effect is enabled.

`blue-electron` was loading effect code and parameters, but not the nested `opcodeList`.

**Fix:** `Effect` now loads its `opcodeList`, and mixer UDO generation now emits nested opcodes before the effect UDO with best-effort deduplication/renaming.

### Additional Fix: Removed All Dynamic Imports

**File:** `packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`

Had 15 `await import()` calls for BSB widget classes to "avoid circular dependency" but no circular deps existed (all widgets import from `bsb-widget`, not `bsb-group`). These caused esbuild warnings during `pnpm dev`.

**Fix:** Converted to static imports with a lazy-initialized registry that self-registers `BSBGroup` after class declaration. Made `loadFromXML()` synchronous throughout the BSB loading chain: `BSBGroup` → `BSBGraphicInterface` → `BlueSynthBuilder` → `InstrumentRegistry` → `Arrangement` → `BlueData.loadFromString`. All callers with `await` still work (await on a non-Promise is a no-op).

### Current Result After This Pass

The generated `BlueMixer` section for `demo2022.blue` now shows the expected structure:

- distinct `gk_blue_autoN` variables for each source-channel volume
- distinct `gk_blue_autoN` variables for each send amount
- distinct `gk_blue_autoN` variables for subchannel and master volume
- ordered effect/send processing in the mixer instrument

This closed the biggest known `blue-electron` mismatches against Java mixer/parameter handling.

### Runtime Automation Timing Bug Found And Fixed

After the mixer/parameter parity fixes, playback still sounded wrong in `demo2022.blue`: LPF and mixer volume automation were not audibly moving like Java blue.

The next pass checked the full runtime path instead of only the generated CSD:

1. Verified the generated orchestra still exports every `gk_blue_autoN` with `chnexport`.
2. Verified the generated mixer/effect code actually uses the expected variables for LPF cutoff, send amount, and channel volume.
3. Verified `blue-app` sends `CREATE_AUTOMATION` using the same compilation variable names it generated into the orchestra.
4. Compared the Java realtime path in `CS6RealtimeRenderService` against `blue-engine`.

That comparison exposed the real mismatch:

- Java evaluates automation with `param.getValue(currentTime)`, where `currentTime` is in **beat time**.
- With a tempo map, Java computes that beat time as:
  `tempoMap.secondsToBeats(scoreTime + renderStartSeconds)`.
- `blue-engine` currently evaluates automation against raw **elapsed seconds from playback start**.
- `blue-app` had been sending raw parameter point `x` values directly to `blue-engine`.

That meant point times such as `96` and `128` from `demo2022.blue` were being interpreted as 96/128 elapsed seconds, not 96/128 beats. For a project running at about 95.333 BPM, that pushes audible automation much later than Java expects.

**Fix implemented:** `blue-app` now converts automation point times from Blue beat-space into engine-local elapsed seconds before sending `CREATE_AUTOMATION`.

Conversion now used:

- disabled/no tempo map:
  `engineTime = pointBeat - renderStartTime`
- enabled tempo map:
  `engineTime = tempoMap.beatsToSeconds(pointBeat) - tempoMap.beatsToSeconds(renderStartTime)`

This preserves Java's runtime semantics without requiring a `blue-engine` protocol change.

### Follow-up Investigation: LPF Path Verified, String Channel Bug Found

Playback with `demo2022.blue` still did not sound like Java after the timing fix, so the next pass traced the specific `2pole LPF` automation on mixer channel `1`.

What was verified:

1. The effect placement matched Java.
   The `2pole LPF` is on source channel `1` in the **pre-effects** chain, not post-effects. The generated `BlueMixer` routing and `blueEffect0` placement matched `demo2022_rt.csd`.

2. The generated LPF code matched Java.
   Both the generated CSD and `demo2022_rt.csd` use:
   `kcut = cpsoct(gk_blue_auto100 + 4)`
   inside `blueEffect0`.

3. The automation variable name matched Java.
   The LPF cutoff automation is `gk_blue_auto100`, exported with `chnexport` and referenced by the effect UDO exactly as in the Java-rendered CSD.

4. The automation values were already correctly scaled.
   The LPF cutoff parameter stores absolute values in its declared `0..10` domain; it is not a normalized `0..1` curve needing extra min/max remapping.
   Runtime tracing showed `gk_blue_auto100` moving through the expected range during playback, producing a cutoff sweep of roughly `130 Hz` to `5.5 kHz` after `cpsoct(...)`.

That ruled out the original LPF suspicion:

- not bad channel naming
- not bad min/max scaling
- not bad `BlueMixer` placement
- not missing automation delivery into `blue-engine`

The concrete mismatch found in the next trace was elsewhere:

- `SimpleSampler` instrument text was rendering
  `SFiles[] fillarray 0, 0, ...`
  instead of Java's
  `SFiles[] fillarray gS_blue_strN, ...`

Root cause:

- `BSBFileSelector` contributed string channels to the global CSD init block, but its `<objectName>` placeholder replacement inside instrument text still fell back to the base `BSBWidget` numeric replacement path.
- That meant the assigned `gS_blue_strN` symbol never got substituted back into the instrument text.

Fix implemented:

- `packages/blue-data/src/instruments/blue-synth-builder/bsb-file-selector.ts`
  now mirrors Java `BSBFileSelector.setupForCompilation()` by replacing `<objectName>` with the assigned `gS_blue_strN` channel name when string-channel mode is enabled.
- `packages/blue-data/src/blue-data.ts`
  now assigns the generated `gS_blue_strN` name back onto the live `StringChannel` object before BSB instrument compilation.
- `packages/blue-data/tests/integration/bsb-instrument-loading.test.ts`
  now asserts that `SimpleSampler` compiles with `SFiles[] fillarray gS_blue_str...` instead of zero placeholders.

### Follow-up Investigation: Arrangement Instruments Were Still Bypassing The Mixer

After the LPF path and string-channel fix, another concrete mismatch was found by inspecting the generated CSD directly:

- `instr 1`, `instr 2`, and `instr 3` were still ending in `outc ...`
  instead of routing into `ga_bluemix_*`.

Root cause:

- `packages/blue-data/src/arrangement.ts`
  still contained the old Phase 3 stub:
  `blueMixerOut -> outc`
  `blueMixerIn -> // blueMixerIn`
- That meant normal arrangement instruments bypassed the mixer entirely, even while the generated `BlueMixer` instrument and effect UDOs were otherwise correct.
- There was also a secondary naming mismatch:
  `Mixer.getChannelVar()` / `getSubChannelVar()` were still returning legacy `ch...` / `sub...` names instead of the actual `ga_bluemix_*` / `ga_bluesub_*` variables used elsewhere in the renderer.

Fix implemented:

- `packages/blue-data/src/arrangement.ts`
  now ports the Java line-by-line `blueMixerIn` / `blueMixerOut` rewrite logic instead of using the stub.
  It now:
  - reads the real mixer-enabled state
  - resolves the source mixer channel by arrangement id
  - rewrites output to `ga_bluemix_*` / `ga_bluesub_*`
  - uses `+=` for normal send-to-mixer behavior
  - uses `=` when the instrument previously read from `blueMixerIn`
  - respects commented lines by stripping both `//` and `;` comments before detection
- `packages/blue-data/src/blue-data.ts`
  now computes channel-id assignments once per render and stores them in `CompileData` so arrangement conversion and mixer generation use the same ids.
- `packages/blue-data/src/mixer/mixer.ts`
  now returns `ga_bluemix_*` / `ga_bluesub_*` from the helper accessors.
- `packages/blue-data/tests/integration/bsb-instrument-loading.test.ts`
  now asserts that `demo2022.blue` instruments `1`, `2`, and `3` route to `ga_bluemix_0/1/2_*` and no longer contain `outc`.

### Remaining Investigation If Playback Still Sounds Wrong

The remaining high-value comparison points are now smaller and mostly outside the original TypeScript loader bugs:

1. **Exact runtime interpolation parity**
   The main timing-domain mismatch has been fixed in `blue-app`, but `blue-engine` interpolation should still be compared against Java `Line.getValue()` for any remaining edge cases, especially repeated point times / discontinuities and quantization behavior in more complex projects.

2. **Exact nested UDO parity for effects**
   `blue-electron` now emits nested effect opcodes, but the deduplication/renaming path is a TypeScript reimplementation, not a line-for-line port of Java `UDOUtilities.appendUserDefinedOpcodes()`. If a project uses many effect-local opcodes, compare the generated UDO block against Java CSD output.

3. **Manual playback retest with rebuilt bundles**
   After the `BSBFileSelector` fix, restart `pnpm dev`/`blue-app` so the rebuilt `@blue/data` and app main-process output are used. The stale bundle problem already occurred once during the `blue_shm_export` rollback, so do not trust a running dev session to pick this up automatically.

4. **If playback still differs, compare engine-side interpolation rather than CSD generation**
   The `demo2022` LPF path itself has now been validated from generated CSD through live channel values. If sound is still off after the string-channel fix, the next likely gap is in `blue-engine` runtime behavior or in another instrument-specific render path, not in mixer automation naming/scaling.

### Key Java Files for Reference

| File              | Path                                                                                         | Role                                                   |
| ----------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ParameterHelper` | `~/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/ParameterHelper.java` | Collects ALL parameters from Arrangement + Mixer       |
| `CSDRender`       | `~/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/CSDRender.java`       | CSD generation, calls ParameterHelper                  |
| `MixerNode`       | `~/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/MixerNode.java`                   | Per-channel volume/effects in mixer code               |
| `Mixer`           | `~/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Mixer.java`                       | Has dedicated `master` Channel field                   |
| `Channel`         | `~/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Channel.java`                     | Has `levelParameter` (Volume, -96 to 12 dB)            |
| `Automatable`     | `~/work/nbprojects/blue/blue-core/src/main/java/blue/automation/Automatable.java`            | Interface: `getParameterList()`, `getStringChannels()` |
| `Effect`          | `~/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Effect.java`                      | Automatable, has BSBGraphicInterface                   |
| `Send`            | `~/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Send.java`                        | Automatable, 1 parameter "Send Amount"                 |

## Spec Status

| Spec | Title                           | Status                                      |
| ---- | ------------------------------- | ------------------------------------------- |
| 001  | blue-data port                  | Done                                        |
| 002  | Complete blue-data model        | Done                                        |
| 003  | React UI rebuild                | Done                                        |
| 004  | BSB instruments                 | Done on current branch                      |
| 005  | CSD render parity               | Done                                        |
| 006  | CSD render parity 2             | Done                                        |
| 007  | Time system + Pattern subsystem | Done                                        |
| 008  | UDO system                      | Done                                        |
| 009  | Automation playback bridge      | Closed — implemented                        |
| 010  | blue_shm_export bridge          | Closed, superseded by return to `chnexport` |

## Implemented Direction

### blue-electron

Implemented on the current branch in `~/work/blue-electron`:

- `packages/blue-data/src/blue-data.ts`
  `buildParameterInits()` now emits:
  `gk_blue_autoN init <value>`
  `gk_blue_autoN chnexport "gk_blue_autoN", 3`
- `packages/blue-data/tests/integration/bsb-instrument-loading.test.ts`
  Expects `chnexport` again for numeric automation parameters.
- `packages/blue-app/src/main/engine-bridge.ts`
  Playback flow is:
  1. create engine
  2. compile orchestra
  3. convert automation points from beat time into engine elapsed seconds
  4. send fixed values and automation definitions
  5. read score
  6. start
- `packages/blue-app/src/main/main.ts`
  Collects parameters via `ParameterHelper`.
  Passes `renderStartTime` and `TempoMap` into the engine bridge so automation timing matches Java realtime playback.
- `packages/blue-data/src/automation/parameter-runtime.ts`
  Added helpers to convert automation points from Blue beat time into engine elapsed seconds.
- `packages/blue-data/tests/automation/parameter-runtime.test.ts`
  Covers disabled tempo, constant tempo, and tempo-change conversion cases.
- `packages/blue-engine-client/src/protocol.ts`
  Automation command encoding is implemented.
- `packages/blue-engine-client/src/engine-client.ts`
  Automation client methods are implemented and `getChannel()` decoding is fixed.

Automation fixes from 2026-04-17 session:

- `packages/blue-data/src/mixer/channel.ts`
  Added `_levelParameter` field with `getLevelParameter()`, matching Java's `Channel.levelParameter`.
  `saveAsXML()` / `loadFromXML()` now follow the Java channel shape more closely.
- `packages/blue-data/src/mixer/mixer.ts`
  Added `_master` Channel field with `getMaster()`, matching Java's `Mixer.master`.
  XML loading now reads the direct `<channel>` child as master.
- `packages/blue-data/src/automation/parameter.ts`
  Now parses Java parameter XML correctly (`automationEnabled`, `value`, `bdresolution`, `<line>/<linePoint>`).
  `isAutomationEnabled()` now matches the Java boolean flag.
- `packages/blue-data/src/automation/parameter-helper.ts`
  Uses `channel.getLevelParameter()` unconditionally (not `getChannelParameter()`).
  Uses `mixer.getMaster()` directly (not fragile name search).
  Walks ordered `EffectsChain` items so `Send` parameters are collected like Java.
- `packages/blue-data/src/mixer/send.ts`
  Now mirrors Java `Send`: `enabled`, `levelParameter`, and Java-style parameter XML loading.
- `packages/blue-data/src/mixer/effects-chain.ts`
  Now preserves ordered `Effect` + `Send` items from mixer XML instead of storing sends separately.
- `packages/blue-data/src/blue-data.ts`
  `generateBlueMixer()` uses per-channel `getLevelParameter().getCompilationVarName()` for volume.
  Added source/sub/master pre/post chain rendering, ordered send handling, master effect handling, subchannel dependency sorting, and nested effect opcode emission.
  Removed broken `findMixerParam()`.
- `packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`
  Converted 15 dynamic `await import()` calls to static imports.
  Made `loadFromXML()` synchronous.
- `packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
  Made `loadFromXML()` synchronous.
- `packages/blue-data/src/instruments/blue-synth-builder.ts`
  Made `loadFromXML()` synchronous.
- `packages/blue-data/src/instruments/instrument-registry.ts`
  Made `loadInstrumentFromXML()` synchronous.
- `packages/blue-data/src/arrangement.ts`
  Made `loadFromXML()` synchronous.
- `packages/blue-data/src/mixer/effect.ts`
  Removed `.catch(() => {})` on now-synchronous `loadFromXML()`.

Important runtime note:

- The app had stale built artifacts in `packages/blue-data/dist` and `packages/blue-app/dist/main` that still contained `blue_shm_export`.
- Those artifacts were rebuilt on 2026-04-17, and the runtime bundles no longer contain `blue_shm_export`.

### blue-engine

Implemented and currently uncommitted in `~/work/csound/blue-engine`:

- Removed `src/opcodes/BlueShmOpcodes.cpp` and `src/opcodes/BlueShmOpcodes.h`.
- Added native Csound channel API loading in:
  - `src/csound/CsoundTypes.h`
  - `src/csound/CsoundLoader.h`
  - `src/csound/CsoundLoader.cpp`
- Reworked `src/engine/CsoundEngine.cpp` / `.h` to own:
  - pending initial values before export
  - control-channel cache rebuilt after `compileOrc()` and again on `start()`
  - native control-channel writes for fixed values
  - automation writes through native channel pointers
  - shared-memory mirroring from live control channels
- Updated `src/automation/AutomationManager.cpp` / `.h`
  so automation writes through an engine callback instead of directly to shared memory.
- Updated `src/ipc/ZmqHandler.cpp`
  so `CREATE_CHANNEL`, `SET_CHANNEL`, and `GET_CHANNEL` route through the engine bridge.
- Updated examples and docs to use `chnexport`-based orchestras.
- Added `tests/cpp/test_channel_bridge.cpp` for the native channel bridge.

Behavioral decisions now encoded in the implementation:

- `CREATE_CHANNEL` before compile stages a pending initial value.
- `SET_CHANNEL` before export also stages a pending value.
- After export exists, writes go to native Csound control channels.
- Shared memory is mirrored from live control-channel state.
- `SET_CHANNEL` on an enabled automated channel during playback returns an error.
- No `csound` repo changes were needed for this iteration.

## Verification Completed

### blue-electron

Ran successfully in `~/work/blue-electron`:

- `pnpm vitest run packages/blue-data/tests/integration/bsb-instrument-loading.test.ts packages/blue-engine-client/tests/protocol.test.ts`
  Result: 23/23 tests passed
- `pnpm --filter @blue/data build`
- `pnpm --filter @blue/engine-client build`
- `pnpm --filter @blue/app build:main`

Post-build check:

- No `blue_shm_export` references remain in:
  - `packages/blue-data/dist`
  - `packages/blue-engine-client/dist`
  - `packages/blue-app/dist/main`

After automation fixes (2026-04-17):

- `pnpm vitest run packages/blue-data/tests` — 384 passed
- `pnpm --filter @blue/data build` — clean
- `pnpm --filter @blue/app build:main` — clean
- No dynamic imports remain in source code
- Added targeted `demo2022.blue` checks for mixer volume automation, send loading, and Java-style parameter collection

After runtime automation timing fix (2026-04-17):

- `pnpm vitest run packages/blue-data/tests/automation/parameter-runtime.test.ts packages/blue-data/tests/integration/bsb-instrument-loading.test.ts`
  Result: 19/19 tests passed
- `pnpm --filter @blue/data build` — clean
- `pnpm --filter @blue/app build:main` — clean
- `demo2022.blue` automation sanity check against built `@blue/data` confirmed the converted runtime ranges now land in seconds instead of raw beats:
  - cutoff: `0..96 beats` -> `0..60.4196 seconds`
  - source volume: `0..128 beats` -> `0..80.5594 seconds`
  - source volume: `0..64 beats` -> `0..40.2797 seconds`
  - wetdry: `0..37.7083 beats` -> `0..23.7325 seconds`

### blue-engine

Ran successfully in `~/work/csound/blue-engine/build`:

- `cmake ..`
- `cmake --build . --target blue-engine test_channel_bridge example_client_c example_client_cpp -j4`
- `ctest --output-on-failure -R 'FixedPointTests|QuantizationTests|AutomationStoreTests|ChannelBridgeTests'`
  Result: 4/4 tests passed

Additional checks:

- `node --check examples/javascript/test_client.js`
- `python3 -m py_compile examples/python/test_client.py examples/python/blue_engine_client.py`
- `cargo check --manifest-path examples/rust/Cargo.toml`
  Passed with existing dead-code warnings in the Rust example client
- `mvn -q -DskipTests compile`

## Dirty Working Tree Summary

### blue-electron

There are uncommitted source changes related to:

- automation bridge
- return to `chnexport`
- engine client protocol work
- Java parity fixes for mixer/effect/send parameter loading and rendering
- removal of dynamic imports
- status/spec docs

There are also unrelated pre-existing files in the working tree:

- `.agents/`
- `AGENTS.md`
- `CLAUDE.md`

### blue-engine

There are uncommitted source changes related to:

- native control-channel bridge
- shared-memory mirroring
- removal of `blue_shm_*` opcodes
- example/test/doc updates

There is also an untracked historical design note:

- `CSOUND_SHARED_MEMORY.md`

## Next Session: Recommended Starting Points

If resuming in a fresh session to continue debugging automation:

1. Rebuild both repos:
   - `~/work/blue-electron`: `pnpm --filter @blue/data build && pnpm --filter @blue/app build:main`
   - `~/work/csound/blue-engine`: `cmake --build build -j4`
2. Run `pnpm dev` and test with `demo2022.blue` (`~/work/blue/demo2024/demo2022.blue`).
3. If automation still sounds wrong, compare Java `Line.getValue()` edge cases against `blue-engine` interpolation for repeated-time points or quantized descending ramps.
4. Diff the generated CSD from blue-app against the CSD generated by Java blue for `demo2022.blue` to isolate any remaining structural differences.

## Key Files

### blue-electron

- [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md)
- [blue-data.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts)
- [engine-bridge.ts](/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/engine-bridge.ts)
- [parameter.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.ts)
- [parameter-helper.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-helper.ts)
- [channel.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/channel.ts)
- [send.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/send.ts)
- [effects-chain.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effects-chain.ts)
- [effect.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect.ts)
- [mixer.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts)
- [bsb-group.ts](/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts)
- [protocol.ts](/Users/stevenyi/work/blue-electron/packages/blue-engine-client/src/protocol.ts)
- [engine-client.ts](/Users/stevenyi/work/blue-electron/packages/blue-engine-client/src/engine-client.ts)

### blue-engine

- [CsoundEngine.cpp](/Users/stevenyi/work/csound/blue-engine/src/engine/CsoundEngine.cpp)
- [AutomationManager.cpp](/Users/stevenyi/work/csound/blue-engine/src/automation/AutomationManager.cpp)
- [ZmqHandler.cpp](/Users/stevenyi/work/csound/blue-engine/src/ipc/ZmqHandler.cpp)
- [CsoundLoader.cpp](/Users/stevenyi/work/csound/blue-engine/src/csound/CsoundLoader.cpp)
- [test_channel_bridge.cpp](/Users/stevenyi/work/csound/blue-engine/tests/cpp/test_channel_bridge.cpp)

### Java Reference (for comparison)

- [ParameterHelper.java](/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/ParameterHelper.java)
- [CSDRender.java](/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/CSDRender.java)
- [MixerNode.java](/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/MixerNode.java)
- [Mixer.java](/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Mixer.java)
- [Channel.java](/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/Channel.java)

## Spec 010 Closure

Spec 010 is considered addressed and closed by the decision to abandon `blue_shm_export` and return to `chnexport` with an engine-side native control-channel bridge.

The correct interpretation is:

- the original `blue_shm_export` proposal was explored
- it proved to be the wrong product direction
- the replacement work is the implemented fix
- spec 010 should not be reopened unless the architecture changes again
