# Quickstart: Score Editor Management and Navigation

## Goal

Validate that the shell-level score follow-up delivers the Java-style ruler and marker interactions first, then layers the remaining management and navigation workflows on top.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Prepare a project with:
   - a root score long enough for render selection and playback follow to be visible
   - multiple markers spread across the score
   - multiple score layer groups or nested groups for the `Manage` workflow

## Validation Steps

1. Load the project and open `ScoreTopComponent` on the root score.
2. Click the root ruler once.
3. Confirm the score shell shows the new render start position and clears any previous render end selection.
4. Drag across the root ruler.
5. Confirm the score shell shows a visible render range with ordered start and end markers even if the drag direction is reversed.
6. Save the project, reload it, and confirm the same render start or end values remain visible in the score shell and toolbar.
7. Shift-click the marker row on the root ruler.
8. Confirm a new marker appears at the requested time.
9. Use `Project > Add Marker` or `Cmd/Ctrl+M`.
10. Confirm a new marker is created through the menu or shortcut path as well.
11. Drag an existing marker to a new time and rename it from the supported shell workflow.
12. Save and reload the project again, then confirm the marker positions and names persist.
13. Open the marker-related auxiliary workflow included in this slice and invoke a supported marker-centered navigation or set-render-start action.
14. Confirm the score viewport updates predictably.
15. Invoke the shell's `Manage` workflow.
16. Confirm a real manager flow opens instead of a stub button, then perform a supported structure-management action and verify the score shell updates in place.
17. Enable follow playback and the follow-on-render-start option, then begin playback.
18. Confirm the score shell follows playback or updates a visible time pointer coherently instead of leaving either behavior as a placeholder.

## Expected Results

- The root score ruler supports click-to-set render start and drag-to-select render ranges.
- Render start and render end values remain canonical and survive save or reload.
- Markers can be created from the ruler and from the project menu or shortcut, then moved and renamed from the shell.
- A real marker-related auxiliary workflow exists for navigation or set-render-start behavior.
- The shell's `Manage` affordance becomes functional.
- Follow playback and follow-on-render-start behavior are visible in the score shell rather than limited to placeholder menu items.

## Closeout

- Manual validation scenarios were signed off on 2026-05-16.
- Spec 042 is complete after automated validation, build validation, and the manual quickstart pass.
