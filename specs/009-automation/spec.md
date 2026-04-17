# Feature Specification: Automation Playback Bridge

**Feature Branch**: `009-automation`
**Created**: 2026-04-15
**Status**: Closed — implemented with compile-first engine bridge + runtime timing conversion (2026-04-17)
**Depends on**: blue-engine C++ automation (already implemented)

Use [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md) as the authoritative current summary. This document is retained as the feature record for the automation bridge work that is now complete.

## Problem

The automation data model, CSD generation, and C++ engine automation are all fully implemented, but they are not connected. When the user plays a project with automated parameters, the `gk_blue_autoN` variables are initialized to their start values but never updated during playback. The C++ engine's `AutomationManager` is ready to drive the values — it just needs the automation definitions sent via ZMQ before playback starts.

## Architecture

```
blue-data (Parameter model)          blue-engine-client (ZMQ)         blue-engine (C++)
┌─────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
│ Parameter               │     │ EngineClient             │     │ ZmqHandler               │
│  .getName()             │────▶│  .createAutomation(...)  │────▶│  CREATE_AUTOMATION (0x20)│
│  .getValue(time)        │     │  .updateAutomation(...)  │     │ AutomationStore          │
│  .getCompilationVarName │     │  .enableAutomation(...)  │     │  ↓ (copy-on-write)       │
│  .getPoints()           │     │  .clearAutomation(...)   │     │ AutomationManager        │
│  .getCurve()            │     └──────────────────────────┘     │  ↓ (per-k-cycle)         │
│  .isAutomationEnabled() │                                      │ native Csound channels   │
└─────────────────────────┘     ┌──────────────────────────┐     │  ↓                       │
                                │ EngineBridge             │     │ shared-memory read mirror│
                                │  .playCSD(csd, params)   │     └──────────────────────────┘
                                │    1. compile orc
                                │    2. send fixed values
                                │    3. send automation defs
                                │    4. read score
                                │    5. start
                                └──────────────────────────┘
```

The TS side does NOT need a polling loop. It sends automation definitions once before playback, and the C++ engine handles all per-k-cycle interpolation internally.

## Outcome

This work is now implemented in `blue-electron`:

- `@blue/engine-client` implements the automation command encoding/decoding path.
- `EngineBridge.playCSD()` compiles the orchestra first, then applies fixed parameter values and automation definitions through the engine.
- Automation point times are converted from Blue beat-space into the elapsed-seconds domain currently used by `blue-engine`.
- `clearAutomations()` is called before each playback to avoid stale state.
- Java-parity investigations for mixer automation, effect automation, string channels, and mixer routing were captured in `STATUS.md`.

## User Scenarios & Testing

### User Story 1 — Automated Parameters Drive Audio During Playback (Priority: P0)

When a user plays a project with automated mixer effects (e.g., a volume fade), the effect parameter sweeps correctly through its automation points during playback.

**Independent Test**: Create a Parameter with LINEAR curve and 2 points, send it to the engine via `createAutomation`, verify the engine received it via `listAutomations`.

### User Story 2 — Non-Automated Parameters Use Fixed Values (Priority: P0)

When a parameter has no automation points (or `isAutomationEnabled()` is false), it is either sent as a single-point STEP automation or set via `setChannel` to its fixed value before playback.

### User Story 3 — Clear Automation Between Playbacks (Priority: P1)

When the user stops and replays, stale automation from the previous playback is cleared. `clearAutomations` is called before sending new definitions.

### User Story 4 — All Parameter Types Are Supported (Priority: P1)

STEP, LINEAR, and EXPONENTIAL curves all serialize correctly and match the C++ engine's expected binary format.

## Requirements

### Functional Requirements

- **FR-001**: `EngineClient` MUST implement `createAutomation(name, curve, enabled, resolution, resolutionScale, highPrecision, points)` sending `CMD_CREATE_AUTOMATION` (0x20)
- **FR-002**: `EngineClient` MUST implement `updateAutomation(...)` sending `CMD_UPDATE_AUTOMATION` (0x21)
- **FR-003**: `EngineClient` MUST implement `deleteAutomation(name)` sending `CMD_DELETE_AUTOMATION` (0x22)
- **FR-004**: `EngineClient` MUST implement `enableAutomation(name)` / `disableAutomation(name)` sending 0x23/0x24
- **FR-005**: `EngineClient` MUST implement `listAutomations()` sending `CMD_LIST_AUTOMATIONS` (0x25)
- **FR-006**: `EngineClient` MUST implement `clearAutomations()` sending `CMD_CLEAR_AUTOMATIONS` (0x26)
- **FR-007**: The binary payload format for CREATE/UPDATE MUST match the C++ engine's expected format: `name\0` + `curve(u8)` + `enabled(u8)` + `resolution(f64)` + `resolutionScale(i32)` + `highPrecision(u8)` + `n_points(u32)` + `points[]` (each point: `time(f64)` + `value(f64)`)
- **FR-008**: The `AutomationCurve` enum values MUST map to the C++ engine's expected values: `STEP=0x00`, `LINEAR=0x01`, `EXPONENTIAL=0x02`
- **FR-009**: `EngineBridge.playCSD()` MUST be updated to accept a `Parameter[]` array and send automation definitions during playback setup
- **FR-010**: For each parameter with `isAutomationEnabled() === true`, the bridge MUST send a `createAutomation` with the parameter's compilation var name, curve type, resolution settings, and all points
- **FR-011**: For each parameter with `isAutomationEnabled() === false`, the bridge MUST call `setChannel(compilationVarName, fixedValue)` to set the initial value
- **FR-012**: Before sending new automation definitions, `clearAutomations()` MUST be called to remove stale data from previous playbacks
- **FR-013**: The automation setup MUST happen after the engine is created and after `compileOrc`, so exported channels exist before fixed values and automation definitions are applied

### Key Entities

- **AutomationPayload**: Helper for encoding the binary payload format matching the C++ engine's expectations
- **EngineClient (extended)**: Adds 7 automation methods to the existing ZMQ client
- **EngineBridge (updated)**: `playCSD()` gains a `parameters` parameter and sends automation definitions

## Edge Cases

- Parameters with 0 automation points should use `setChannel` with fixed value, not `createAutomation`
- Parameters with exactly 1 point should be sent as STEP automation (or use `setChannel`)
- Channel names must match the `gk_blue_autoN` compilation variable names exactly
- `resolutionScale` and `highPrecision` affect quantization behavior in the C++ engine — must be passed through even if rarely used

## Success Criteria

- **SC-001**: `EngineClient.createAutomation(...)` produces correct binary payload verified against C++ protocol spec
- **SC-002**: `EngineBridge.playCSD()` sends all automated parameters to the engine before playback starts
- **SC-003**: A project with automated volume fades produces audible changes during playback
- **SC-004**: All existing tests continue to pass (no regressions)
- **SC-005**: New unit tests for automation payload encoding and bridge flow

## Implementation Phases

### Phase 1: EngineClient Automation Methods
- Add binary encoding helpers for the automation payload format
- Implement all 7 automation methods on `EngineClient`
- Add unit tests for payload encoding

### Phase 2: EngineBridge Integration
- Update `playCSD()` to accept `Parameter[]`
- Add `sendAutomationDefinitions()` helper
- Update main.ts to pass parameters from `BlueData` to `EngineBridge.playCSD()`

### Phase 3: Verification
- Manual testing with demo2022.blue (automated volume on channels)
- Verify parameter values change during playback via `listAutomations`
