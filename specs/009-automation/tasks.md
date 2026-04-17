# Spec 009: Automation Playback Bridge — Closed

**Status**: Closed — implemented in `blue-electron` (2026-04-17)

Do not execute the original open task list.

This spec was addressed by the completed automation bridge and Java-parity work:

- `packages/blue-engine-client/src/protocol.ts`
  encodes and decodes automation payloads for the engine protocol.
- `packages/blue-engine-client/src/engine-client.ts`
  implements the automation command methods (`create`, `update`, `delete`, `enable`, `disable`, `list`, `clear`).
- `packages/blue-app/src/main/engine-bridge.ts`
  now uses the compile-first flow:
  1. create engine
  2. compile orchestra
  3. apply fixed values
  4. send automation definitions
  5. read score
  6. start
- `packages/blue-app/src/main/main.ts`
  collects parameters and passes render timing context into the bridge.
- `packages/blue-data/src/automation/parameter-runtime.ts`
  converts Blue beat-time automation points into engine-local elapsed seconds.
- `packages/blue-data/src/blue-data.ts`
  generates standard `chnexport`-based automation channels used by the bridge.
- `packages/blue-data/tests/automation/parameter-runtime.test.ts`
  covers beat-time to engine-time conversion.
- `packages/blue-engine-client/tests/protocol.test.ts`
  covers automation protocol encoding/decoding.

Follow-up parity work that was required to make spec 009 sound correct in practice is documented in [STATUS.md](/Users/stevenyi/work/blue-electron/STATUS.md), including:

- Java-style mixer parameter collection and rendering
- string-channel substitution for `BSBFileSelector`
- arrangement instrument `blueMixerOut` routing into `ga_bluemix_*`

Spec 009 is considered complete with the current `chnexport` + engine-side channel bridge architecture.
