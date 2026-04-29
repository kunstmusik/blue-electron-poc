import React from 'react';
import { useSettingsStore } from '../../stores/settings-store';
import SettingsField from './SettingsField';

export default function GeneralSettings(): React.ReactElement {
  const enginePath = useSettingsStore((s) => s.enginePath);
  const setEnginePath = useSettingsStore((s) => s.setEnginePath);

  return (
    <div>
      <h2 style={{ fontSize: '16px', color: '#fff', margin: '0 0 20px 0' }}>
        General
      </h2>
      <SettingsField
        label="Csound Engine Path"
        value={enginePath}
        onChange={setEnginePath}
        placeholder="csound or /usr/local/bin/csound"
        description="Path to the Csound executable used for playback and Blue Live."
      />
    </div>
  );
}
