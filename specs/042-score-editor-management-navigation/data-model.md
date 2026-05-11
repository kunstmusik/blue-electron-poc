# Data Model: Score Editor Management and Navigation

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

## Entity: LayerGroupManagerSnapshot

- **Purpose**: Renderer-facing manager payload for one layer group's layers.
- **Fields**:
  - `groupId: string`
  - `groupName: string`
  - `layers: Array<{ layerId: string; name: string; muted: boolean; solo: boolean; heightIndex: number }>`

## Entity: ScoreNavigationTarget

- **Purpose**: One marker or navigator destination that can reposition the visible score shell.
- **Fields**:
  - `targetId: string`
  - `label: string`
  - `startBeats: number`
  - `endBeats?: number`
  - `source: 'marker' | 'navigator' | 'playback'`

## Entity: ScoreFollowState

- **Purpose**: Shell-local follow/pointer state used while playback is active.
- **Fields**:
  - `enabled: boolean`
  - `lastVisibleStartBeats: number`
  - `lastVisibleEndBeats: number`
  - `pointerBeats?: number | null`

## State Flows

### Manage Flow

1. Renderer opens a manager workflow from the score shell.
2. Main or shared helpers provide the current score-manager snapshot.
3. Renderer emits supported `ScoreManagementOperation` patches.
4. Canonical score data mutates and the shell refreshes in place.

### Navigation Flow

1. Renderer loads marker and navigator targets.
2. User selects a target.
3. Shell scrolls or recenters to the requested region.
4. Any related panels update against the new visible region.

### Follow Playback Flow

1. Follow playback is enabled.
2. Playback updates deliver the current score position.
3. The shell updates pointer state and scroll position as needed.
4. The score view stays coherent without excessive global-store churn.