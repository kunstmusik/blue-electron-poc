# Spec 010: blue_shm_export Bridge — Closed

**Status**: Closed — superseded by native Csound channel bridge + return to `chnexport` (2026-04-17)

Do not execute the original `blue_shm_export` task list.

The spec was closed by implementing the opposite product decision:

- keep generated CSD on `chnexport`
- remove `blue_shm_*` opcodes from the `blue-engine` product path
- write native Csound control channels from `blue-engine`
- mirror live scalar control-channel values into shared memory for external reads

Replacement work completed:

- `blue-electron`
  - `packages/blue-data/src/blue-data.ts` returned to `chnexport`
  - `packages/blue-app/src/main/engine-bridge.ts` uses compile-first, then sends fixed values and automations
  - targeted tests and package builds passed
- `blue-engine`
  - native control-channel bridge implemented
  - `blue_shm_*` opcode files removed
  - examples/docs/tests updated
  - `ChannelBridgeTests` added and passing

See [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md) for the resume-ready project summary.
