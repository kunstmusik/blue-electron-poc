import React from 'react';
import { useProjectStore } from '../../../../stores/project-store';

export default function OptionsTab(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const blueLive = useProjectStore((state) => state.blueLive);
  const applyBlueLivePatch = useProjectStore((state) => state.applyBlueLivePatch);

  if (!loaded || !blueLive) {
    return <div style={{ color: '#888', padding: '12px' }}>No project loaded.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '11px', color: '#888' }}>Command Line</span>
        <input
          value={blueLive.commandLine}
          onChange={(e) => applyBlueLivePatch({ type: 'updateOptions', patch: { commandLine: e.target.value } })}
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={blueLive.commandLineEnabled}
          onChange={(e) => applyBlueLivePatch({ type: 'updateOptions', patch: { commandLineEnabled: e.target.checked } })}
        />
        <span style={{ fontSize: '12px', color: '#aaa' }}>Command Line Enabled</span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={blueLive.commandLineOverride}
          onChange={(e) => applyBlueLivePatch({ type: 'updateOptions', patch: { commandLineOverride: e.target.checked } })}
        />
        <span style={{ fontSize: '12px', color: '#aaa' }}>Override (replaces CSD options)</span>
      </label>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  fontFamily: 'monospace',
  background: '#0d0d1a',
  color: '#c8c8d8',
  border: '1px solid #333',
  borderRadius: '3px',
};
