# Research Notes: Demo2026 Compile Investigation

## Status: CLOSED

The demo2026 investigation is complete. `~/work/blue/demo2026/01.blue` now compiles cleanly, renders through the normal `blue-electron` playback path, and matches the Java reference `~/work/blue/demo2026/01.csd` byte-for-byte.

---

## Final Outcome

- normal playback/render path is green for `01.blue`
- standalone `csound -n` validation is green for generated output
- raw generated output matches the Java reference `01.csd` exactly
- regression coverage protects the relevant parity-sensitive behavior in `blue-data`

---

## Confirmed Root Causes And Fix Areas

### Initial Compile / Semantic Failures

- `blueDuration` was injected incorrectly for JavaScript sound objects; fixed in `packages/blue-data/src/sound-objects/javascript-object.ts`
- JavaScript sound objects lacked Java-style shared execution context; fixed in `javascript-object.ts`
- `TimeDuration` / `TimePosition` XML tags diverged from Java (`bars` / `beats`, `totalSeconds`, `frameCount`); fixed in `packages/blue-data/src/time/time-duration.ts` and `packages/blue-data/src/time/time-position.ts`
- raw score parsing stored `i1` as p1 and produced `ii1`; fixed in `packages/blue-data/src/sound-objects/generic-score.ts` and `packages/blue-data/src/sound-objects/javascript-object.ts`
- mixer effect UDOs were emitted after arrangement instruments; fixed in `packages/blue-data/src/blue-data.ts`

### Final Java-Parity Cleanup

- always-on render duration now matches Java for all always-on events, not just `BlueMixer`
- `NoteList.merge()` now preserves Java append order instead of re-sorting on merge
- `GenericScore` and `JavaScriptObject` now apply Java-aligned timing, note processors, and start offsets
- number formatting now mirrors Java's split behavior: `NumberUtilities.formatDouble()`-style output for parameter-like values and `Double.toString()`-style output for tempo / note start times
- mixer effect UDO formatting, parameter/string init formatting, mixer routing spacing, and score-wrapper whitespace now match the Java renderer exactly

---

## Validation

### Build And Tests

- `pnpm --filter @blue/data build` passes
- `pnpm --filter @blue/data test -- --maxWorkers=1` passes with **31 test files / 424 tests**

### Exact Reference Check

```bash
node -e "const fs=require('fs'); const {BlueData}=require('./packages/blue-data/dist/cjs/index.js'); (async()=>{ const xml=fs.readFileSync('/Users/stevenyi/work/blue/demo2026/01.blue','utf8'); const data=await BlueData.loadFromString(xml); fs.writeFileSync('/tmp/01_generated.csd', data.toCSD(), 'utf8'); })();"
diff -u /Users/stevenyi/work/blue/demo2026/01.csd /tmp/01_generated.csd | wc -l
```

Observed result: `0`

### Runtime Sign-Off

- `csound -n -o /dev/null -m135 /tmp/01_generated.csd` succeeds
- `01.blue` renders successfully through the current `blue-electron` playback path

---

## Investigation Guidance Retained From This Spec

- Consult the Java implementation first for behavior, XML, render-order, or formatting issues.
- Primary Java references for this area are `~/work/nbprojects/blue/blue-core` and `~/work/nbprojects/blue/blue-ui-core`.
- Validate suspected fixes against Java-generated artifacts, especially `~/work/blue/demo2026/01.csd`.

---

## Non-Blocking Follow-On

1. Consider replacing the current Node `vm` usage with `quickjs-emscripten` for browser-compatible JavaScript sound-object execution.
2. Decide whether `test-csd.js` should be promoted into a maintained repo-level validation utility or removed in favor of test-suite coverage.
