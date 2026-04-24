# Contract: BSB Interface Parity Surface

This contract describes the renderer/main/shared boundary for Spec 022. It is an internal UI/data contract, not a public HTTP API.

## BlueSynthBuilder Snapshot Extension

`BlueSynthBuilderInstrumentSnapshot` should expand beyond the Spec 021 flat widget summary:

```ts
interface BlueSynthBuilderInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'blueSynthBuilder';
  instrumentText: string;
  alwaysOnInstrumentText: string;
  globalOrc: string;
  globalSco: string;
  objectNames: string[];
  widgets: BsbWidgetSnapshot[];
  editEnabled: boolean;
  gridSettings: GridSettingsSnapshot;
  widgetTree: BsbWidgetNodeSnapshot;
  presetGroup?: PresetGroupSnapshot;
  opcodeListSummary?: OpcodeListSummarySnapshot;
}
```

The existing flat `widgets` summary may remain for code-completion convenience, but the Interface tab requires a hierarchical `widgetTree` and editor-specific settings.

## New Snapshot Shapes

```ts
interface GridSettingsSnapshot {
  enabled: boolean;
  snapEnabled: boolean;
  width: number;
  height: number;
}

interface BsbWidgetNodeSnapshot {
  id: string;
  type: string;
  objectName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  editable: boolean;
  preservedOnly?: boolean;
  properties: Record<string, string | number | boolean | null>;
  children?: BsbWidgetNodeSnapshot[];
}

interface PresetGroupSnapshot {
  name: string;
  currentPresetUniqueId?: string;
  currentPresetModified: boolean;
  subGroups: PresetGroupSnapshot[];
  presets: PresetSnapshot[];
}

interface PresetSnapshot {
  uniqueId: string;
  name: string;
}

interface OpcodeListSummarySnapshot {
  count: number;
  names: string[];
}
```

## Patch Contract

Spec 022 should continue using `ProjectDocumentPatch -> orchestra -> updateInstrument`, but BSB-specific mutations need a structured patch payload.

```ts
type InstrumentPatch =
  | { name?: string; enabled?: boolean; comment?: string }
  | { instrumentText?: string; alwaysOnInstrumentText?: string; globalOrc?: string; globalSco?: string }
  | { bsbWidgetValues?: Record<string, number> }
  | { bsbInterface?: BsbInterfacePatch };

type BsbInterfacePatch =
  | { type: 'setEditEnabled'; value: boolean }
  | { type: 'selectWidget'; widgetId?: string }
  | { type: 'updateWidgetProperties'; widgetId: string; properties: Record<string, string | number | boolean | null> }
  | { type: 'moveWidget'; widgetId: string; x: number; y: number }
  | { type: 'resizeWidget'; widgetId: string; width: number; height: number }
  | { type: 'updateGridSettings'; patch: Partial<GridSettingsSnapshot> }
  | { type: 'applyPreset'; presetUniqueId: string }
  | { type: 'updateEmbeddedOpcodeList'; opcodeList: OpcodeListSnapshot };
```

Exact patch-shape naming can change during implementation, but the contract must preserve the existing optimistic patch flow and keep BSB edits serializable.

## Renderer Routing Contract

- `BlueSynthBuilderEditor` keeps the Spec 021 top-level `Interface`, `Code`, and `UDO` tabs.
- `BSBInterfaceEditor` owns the interface canvas, selection state, property-sheet tabs, grid settings, and preset-application surface.
- `BSBCodeEditor` keeps the Spec 021 code-tab behavior and refreshes completion context from the live interface snapshot.
- `BSBUDOPanel` is replaced by an embedded opcode-list editor bound to the instrument-local opcode list.

## Preservation Rules

- Unsupported widgets or presets must be surfaced as preserved-but-not-fully-editable rather than omitted.
- Renderer components must not depend on `@blue/data` class instances crossing IPC.
- Save/reopen must preserve unsupported BSB structures even when only supported widgets were edited.