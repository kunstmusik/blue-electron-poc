import React from 'react';
import type {
  GridSettingsSnapshot,
  BsbInterfacePatch,
} from '../../../../../../shared/project-editor';

interface BSBGridSettingsPanelProps {
  gridSettings: GridSettingsSnapshot;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
}

export default function BSBGridSettingsPanel({
  gridSettings,
  onBsbInterfacePatch,
}: BSBGridSettingsPanelProps): React.ReactElement {
  const update = (partial: Partial<GridSettingsSnapshot>) => {
    onBsbInterfacePatch({ type: 'updateGridSettings', patch: partial });
  };

  return (
    <div className="space-y-2 p-3">
      <div className="mb-2 border-b border-blue-border pb-1 text-[10px] uppercase tracking-[0.16em] text-blue-muted">
        Grid Settings
      </div>

      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <label className="text-[11px] text-blue-muted">Grid Style</label>
        <select
          className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-accent"
          value={gridSettings.gridStyle}
          onChange={(e) => {
            const v = e.target.value as 'NONE' | 'DOT' | 'LINE';
            update({ gridStyle: v, enabled: v !== 'NONE' });
          }}
        >
          <option value="DOT">Dot</option>
          <option value="LINE">Line</option>
          <option value="NONE">None</option>
        </select>
      </div>

      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <label className="text-[11px] text-blue-muted">Snap</label>
        <input
          type="checkbox"
          checked={gridSettings.snapEnabled}
          onChange={(e) => update({ snapEnabled: e.target.checked })}
          className="accent-blue-accent"
        />
      </div>

      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <label className="text-[11px] text-blue-muted">Width</label>
        <input
          className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-accent"
          type="number"
          value={gridSettings.width}
          min={1}
          onChange={(e) => update({ width: parseInt(e.target.value, 10) || 10 })}
        />
      </div>

      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <label className="text-[11px] text-blue-muted">Height</label>
        <input
          className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-accent"
          type="number"
          value={gridSettings.height}
          min={1}
          onChange={(e) => update({ height: parseInt(e.target.value, 10) || 10 })}
        />
      </div>
    </div>
  );
}
