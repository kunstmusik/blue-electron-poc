# Research: blue_shm_export Opcode Bridge

**Date**: 2026-04-16
**Source**: blue-engine (`~/work/csound/blue-engine/`), blue-electron CSD generation

## Closure Note

This research note documents an abandoned direction.

Final decision on 2026-04-17:

- do not pursue `blue_shm_export`
- keep generated CSD on `chnexport`
- move synchronization responsibility into `blue-engine`
- use shared memory only as a read mirror of native control-channel state

See [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md) for the current implementation status.

## Problem

The generated CSD uses Csound's built-in `chnexport` to expose `gk_blue_autoN` automation variables. In Java blue, the host directly writes to Csound channels via JNI (`csoundSetChannel`), which aliases the channel to the Csound global variable. But blue-engine uses a **separate shared memory system** with custom `blue_shm_get`/`blue_shm_set` opcodes. The automation manager writes to shared memory, but `chnexport` reads from Csound's internal channel map — the two systems never connect.

## Channel Usage in Generated CSD

| Opcode | Count | Purpose | Needs shm? |
|--------|-------|---------|------------|
| `chnexport` (k-rate) | ~96 | `gk_blue_autoN` automation variables | **Yes** |
| `chnexport` (string) | ~6 | `gS_blue_strN` file path constants | No |
| `chnget` (i-rate) | 6 | BSB internal table handles (`lfo2_sine`, `tokbox.*`) | No |
| `chnset` (i-rate) | 6 | BSB internal table handles | No |

The i-rate `chnget`/`chnset` calls are BSB UDO internal plumbing (passing function table numbers). They don't need the shm bridge — Csound's built-in channels work fine for these.

The string `chnexport` calls expose file paths to the host UI. These are write-once constants — no k-rate updates needed.

Only the k-rate `chnexport` calls for `gk_blue_autoN` need the shm bridge.

## Proposed Solution

Add a `blue_shm_export` opcode to blue-engine that mirrors `chnexport` semantics but reads from shared memory:

```
; Existing (Csound built-in):
gk_blue_auto0 chnexport "gk_blue_auto0", 3

; Replacement (shared memory backed):
gk_blue_auto0 blue_shm_export "gk_blue_auto0", 3
```

**Behavior:**
- **i-rate init**: gets or creates the shared memory channel, reads current value into the output variable
- **k-rate perf**: atomically reads from shared memory every k-cycle and updates the output variable
- **imode=1** (write): output variable → shared memory (not needed for automation, but useful for UI feedback)
- **imode=2** (read): shared memory → output variable (automation path)
- **imode=3** (read+write): bidirectional

The opcode is a **1:1 drop-in replacement** for `chnexport` in the generated CSD. All instrument code that reads `gk_blue_autoN` as a global variable continues to work unchanged.

## Existing blue_shm Opcodes

The blue-engine already has:
- `blue_shm_get` (i-rate and k-rate): returns value from shared memory
- `blue_shm_set` (i-rate and k-rate): writes value to shared memory

`blue_shm_export` is different from `blue_shm_get` because it works as a **statement** (like `chnexport`), updating a named output variable in-place rather than returning a value. This matches how `chnexport` is used in the CSD.

## Shared Memory Layout

Current `ChannelEntry`: 64-byte name + 8-byte double value + 4-byte flags + 4-byte reserved = 80 bytes.

String channels are not supported in shared memory (double-only). The `gS_blue_strN` channels should keep using `chnexport` since they don't need shm bridging.
