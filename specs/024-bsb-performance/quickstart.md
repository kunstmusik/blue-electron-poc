# Quickstart: Validate BlueSynthBuilder Performance Improvements

## Prerequisites

- A BSB-heavy project with multiple widgets, ideally including sliders, knobs, XY controllers, and slider banks
- React DevTools Profiler available in the Electron renderer workflow you use for manual checks
- Normal project test/build commands from the repository root

## Automated Validation

Run from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/app test
pnpm --filter @blue/app build
pnpm --filter @blue/data test
```

Focus on the new Spec 024 coverage:

- store identity tests
- BSB render isolation tests
- transport and failure-recovery tests

## Manual Validation

### 1. Non-playing render isolation

1. Open a project with a large BlueSynthBuilder interface.
2. Open the Orchestra panel and select the BSB instrument.
3. Start a React Profiler recording.
4. Change one slider or knob value.
5. Confirm that unrelated widgets and the arrangement panel do not re-render.

### 2. Live playback latency

1. Start playback.
2. Drag a slider continuously.
3. Confirm audio responds during the drag rather than only after the pointer stops.
4. Repeat for a knob, XY controller, and slider-bank value.

### 3. Failure recovery sanity check

1. Simulate or force a commit failure during a batched document update.
2. Confirm the renderer surfaces the error.
3. Confirm the renderer performs an explicit resync instead of silently drifting.

### 4. Save/reopen correctness

1. Edit several BSB values and structural properties.
2. Save the project.
3. Reopen it.
4. Confirm the persisted state matches the final UI state.

## Expected Outcomes

- one widget edit no longer causes a double render cascade from optimistic update plus canonical echo
- live control updates are no longer blocked behind the generic 100 ms trailing document flush
- unrelated widgets and arrangement state preserve identity across single-widget edits