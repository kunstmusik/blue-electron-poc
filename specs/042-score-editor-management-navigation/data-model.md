# Data Model: Score Editor Management and Navigation

## Entity: RenderRangeSelection

- **Purpose**: Canonical root-score render anchor and optional render range shown on the score ruler.
- **Fields**:
  - `startBeats: number`
  - `endBeats: number | null`
  - `mode: 'point' | 'range'`
  - `snapped: boolean`
  - `rootTimelineOnly: true`

## Entity: MarkerAuthoringTarget

- **Purpose**: Renderer-facing marker entry that can be created, moved, renamed, removed, or used as a navigation target.
- **Fields**:
  - `sourceIndex: number`
  - `name: string`
  - `timeBeats: number`
  - `rootTimelineOnly: true`

## Entity: ScoreManagementOperation

- **Purpose**: Canonical mutation descriptor for supported score-structure changes initiated from manager flows.
- **Fields**:
  - `operationType: string`
  - `targetGroupId?: string`
  - `targetLayerId?: string`
  - `payload: Record<string, unknown>`

## Entity: ScoreManagerSnapshot

- **Purpose**: Renderer-facing view of the root or nested score structure shown in a manager dialog.
- **Fields**:
  - `activeGroupId: string | null`
  - `groups: Array<{ groupId: string; name: string; type: string; layerCount: number }>`
  - `selectedGroupId?: string | null`

## Entity: ScoreNavigationSession

- **Purpose**: Shell-local navigation state used to jump among markers, render anchors, manager selections, and follow targets.
- **Fields**:
  - `visibleStartBeats: number`
  - `visibleEndBeats: number`
  - `activeMarkerIndex?: number | null`
  - `activePanelId?: string | null`
  - `activeSelection?: RenderRangeSelection | null`

## Entity: ScoreFollowState

- **Purpose**: Shell-local follow or pointer state used while playback is active.
- **Fields**:
  - `enabled: boolean`
  - `enableOnRenderStart: boolean`
  - `lastVisibleStartBeats: number`
  - `lastVisibleEndBeats: number`
  - `pointerBeats?: number | null`

## State Flows

### Render Range Flow

1. Renderer receives a root-ruler click or drag gesture.
2. The shell resolves the gesture into a `RenderRangeSelection`, applying snap rules when appropriate.
3. The renderer commits canonical render start or end values through the existing project transport patch path.
4. The shell redraws the start marker, end marker, and range highlight from the refreshed project snapshot.

### Marker Authoring Flow

1. Renderer receives a root marker-row gesture or a project menu or shortcut command.
2. The shell resolves the target time in beats and emits a canonical marker mutation.
3. Shared project snapshot creation rebuilds the ordered marker row for the score shell and any auxiliary marker workflow.
4. Save or reload restores the same marker name and time from project data.

### Manage Flow

1. Renderer opens a manager workflow from the score shell.
2. Shared helpers provide the current score-manager snapshot.
3. Renderer emits supported `ScoreManagementOperation` patches.
4. Canonical score data mutates and the shell refreshes in place.

### Navigation And Follow Flow

1. Renderer loads marker, render-range, and manager-derived navigation targets.
2. User selects a target or playback advances while follow is enabled.
3. The shell scrolls, recenters, or updates the pointer as needed.
4. Any related auxiliary panels update against the same visible region.