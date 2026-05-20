# Quickstart: Meter Map Parity

## Prerequisites

- Work from a dedicated `046-meter-map-parity` branch when implementation begins. This planning pass intentionally did not create that branch.
- Review Java Blue sources listed in `/Users/stevenyi/work/blue-electron/specs/046-meter-map-parity/research.md`.
- If Spec 045 has already implemented shared tempo row/dialog utilities, review them for reuse before creating meter-specific components.

## Focused Automated Validation

Run focused meter tests as they are added:

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/meter-map-contract.test.ts src/renderer/tests/meter-row-parity.test.tsx src/renderer/tests/meter-map-modal.test.tsx --browser.enabled=false
```

Run `@blue/data` meter tests if meter model behavior changes:

```bash
pnpm --filter @blue/data test -- --maxWorkers=1 packages/blue-data/src/time/meter-map.test.ts
```

Run broader app validation before closeout:

```bash
pnpm --filter @blue/app test
pnpm --filter @blue/app build
pnpm --filter @blue/data test -- --maxWorkers=1
git diff --check
```

## Manual Scenarios

### Scenario 1: Meter Row Rendering

1. Open a project with a single 4/4 meter at measure 1.
2. Show the time signature row in the Score panel.
3. Confirm the row is 20px high and displays `4/4`.
4. Hover the row and confirm tooltip text shows measure and time signature.

### Scenario 2: Mixed-Meter Boundary Math

1. Create or load entries:
   - measure 1: 4/4
   - measure 5: 3/4
   - measure 9: 7/8
2. Confirm each region starts at the accumulated beat boundary matching Java Blue.
3. Confirm BBT, BBST, and BBF ruler labels remain aligned with the visible meter regions.

### Scenario 3: Row Add/Edit/Delete

1. Double-click an empty meter-row location.
2. Confirm a new default 4/4 entry appears at the clicked measure.
3. Double-click the same region or choose `Edit Time Signature...`.
4. Change the signature and confirm the row updates.
5. Right-click a non-first entry and delete it.
6. Confirm the first entry cannot be deleted.

### Scenario 4: Project Menu Modal

1. Open Project -> Edit Time Signature Map...
2. Confirm the table contains Measure, Time Signature, and Delete columns.
3. Add a row and confirm it appears at last measure + 8 with 4/4.
4. Enter invalid data and confirm OK is blocked or validation is shown.
5. Cancel and confirm the project is unchanged.
6. Reopen, edit values, OK, save, reload, and confirm the same map is restored.

## Completion Criteria

- All functional requirements in `spec.md` are covered by tasks and tests.
- Focused meter tests pass.
- `@blue/app` and `@blue/data` suites pass if affected.
- Manual scenarios are recorded in closeout status.
