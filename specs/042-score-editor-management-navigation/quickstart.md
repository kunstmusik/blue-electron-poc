# Quickstart: Score Editor Management and Navigation

## Goal

Validate that the later score shell follow-up delivers real management/navigation workflows rather than the broader direct-manipulation scope that was already absorbed by Spec 036.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Prepare a project with:
   - multiple score layer groups or nested groups
   - multiple markers spread across the score
   - enough timeline length for navigation and follow-playback behavior to be visible

## Validation Steps

1. Load the project and open `ScoreTopComponent`.
2. Invoke the shell's `Manage` workflow.
3. Confirm a real manager flow opens instead of a stub button.
4. Perform a supported structure-management action and confirm the score shell updates in place.
5. Use the supported marker-navigation workflow.
6. Confirm the shell scrolls or recenters predictably.
7. Use the supported score navigator or overview workflow.
8. Confirm the visible region updates coherently.
9. Enable follow playback and begin playback.
10. Confirm the score shell follows playback or updates a visible time pointer coherently.
11. Open any score-adjacent panels included in this slice, such as markers.
12. Confirm they render real supported workflows or explicit deferred messaging rather than silent placeholders.

## Expected Results

- The shell's `Manage` affordance becomes functional.
- Marker/navigation workflows exist for larger scores.
- Follow playback is visible in the score shell, not only as a global toggle.
- Remaining score-adjacent placeholder gaps claimed by this slice are resolved intentionally.