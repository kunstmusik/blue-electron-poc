# Data Model: Sound Score Object Editor Parity

## Entity: SoundEditorSnapshot

- **Purpose**: Typed auxiliary-editor payload for a selected `Sound` score object.
- **Fields**:
  - `editorFamily: 'Sound'`
  - `availableTabs: Array<'interface' | 'automation' | 'comments'>`
  - `defaultTab: 'interface' | 'automation' | 'comments'`
  - `interfaceSnapshot: SoundInterfaceSnapshot`
  - `automationSnapshot: SoundAutomationSnapshot`
  - `commentText: string`
  - `testAvailable: boolean`
  - `deferredCapabilities: string[]`

## Entity: SoundInterfaceSnapshot

- **Purpose**: Renderer-facing view of the BSB-driven interface content reused by the `Sound` editor.
- **Fields**:
  - `widgetTree: BsbWidgetNodeSnapshot | null`
  - `gridSettings: GridSettingsSnapshot | null`
  - `presetGroup: PresetGroupSnapshot | null`
  - `objectNames: string[]`
  - `editEnabled: boolean`
  - `deferredWidgets: string[]`

## Entity: SoundAutomationSnapshot

- **Purpose**: Renderer-facing automation state for the selected `Sound` object.
- **Fields**:
  - `parameters: Array<{
      parameterId: string;
      label: string;
      channelName: string;
      automationEnabled: boolean;
      pointCount: number;
      curveType: string;
      deferredReason?: string;
    }>`
  - `selectedParameterId: string | null`
  - `visibleStartBeats: number`
  - `visibleEndBeats: number`
  - `lineEditorAvailable: boolean`
  - `deferredCapabilities: string[]`

## Entity: SoundTestPreview

- **Purpose**: Result payload for the editor-side `Sound` test action.
- **Fields**:
  - `generatedScoreText?: string`
  - `errorMessage?: string`
  - `targetLabel: string`

## State Flows

### Interface Edit Flow

1. Main/shared helpers build `SoundEditorSnapshot` from the selected canonical `Sound` object.
2. Renderer opens the Interface tab and reuses existing BSB UI components.
3. Supported widget or preset edits emit canonical score-object patches.
4. The active editor document refreshes against the updated canonical object.

### Automation Edit Flow

1. Renderer opens the Automation tab and shows available parameter lines.
2. User selects a parameter and edits supported line data.
3. Renderer emits canonical `updateTypeSpecificEditor` patches scoped to `Sound` automation.
4. Shared helpers update the object and rebuild `SoundAutomationSnapshot`.

### Test Preview Flow

1. Renderer invokes the editor-side `Sound` test action for the active target.
2. Main/preload helpers generate the score preview or failure state.
3. Renderer shows `SoundTestPreview` in a modal tied to the selected target.
4. Closing the modal leaves canonical score data unchanged.
