# Research: Automation Playback Bridge — Closed

**Date**: 2026-04-17
**Status**: Closed — implementation landed, see [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md)

## Implemented Architecture

The automation bridge now works with three coordinated layers:

1. **blue-data**
   - loads Java parameter XML correctly
   - assigns `gk_blue_autoN` compilation variable names
   - emits standard `chnexport` statements for numeric automation channels
2. **blue-engine-client / blue-app**
   - clears stale automation before each playback
   - compiles the orchestra first
   - applies fixed values and automation definitions after `compileOrc`
   - converts Blue beat-time points into engine-local elapsed seconds
3. **blue-engine**
   - owns the live Csound channel state
   - interpolates automation per k-cycle
   - mirrors live scalar control values into shared memory for external reads

## Key Corrections To The Original Research

The original research direction was too optimistic in several places:

- Automation setup does **not** happen before `compileOrc`.
  The working path is compile-first so the exported Csound channels exist before values are applied.
- The product path does **not** rely on `blue_shm_*` opcodes.
  Numeric automation channels stay on standard `chnexport`.
- The important runtime mismatch with Java was the time domain:
  Java automation points are authored in beat time, while `blue-engine` currently evaluates automation in elapsed seconds.
  `blue-app` now converts those point times before sending them.

## Supporting Parity Work That Was Required

Getting spec 009 to work audibly also required non-trivial Java parity fixes in `blue-electron`:

- mixer volume/send/master parameter collection
- ordered mixer pre/post effect rendering
- `BSBFileSelector` string-channel substitution into instrument text
- arrangement instrument `blueMixerOut` / `blueMixerIn` routing into `ga_bluemix_*`

Those findings are documented in detail in [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md).

## Result

Spec 009 is complete under the current architecture:

- generated CSD uses `chnexport`
- `blue-app` sends automation definitions over ZMQ
- `blue-engine` drives the live channel values during playback
