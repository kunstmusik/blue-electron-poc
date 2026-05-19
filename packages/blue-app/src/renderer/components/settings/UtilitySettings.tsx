import React from 'react';
import type { UtilitySettingsSnapshot } from '../../../shared/program-settings';
import SettingsSection from './SettingsSection';

interface UtilitySettingsProps {
  settings: UtilitySettingsSnapshot;
  onChange: (settings: UtilitySettingsSnapshot) => void;
}

export default function UtilitySettings({
  settings,
  onChange,
}: UtilitySettingsProps): React.ReactElement {
  const set = <K extends keyof UtilitySettingsSnapshot>(
    key: K,
    value: UtilitySettingsSnapshot[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <SettingsSection
      title="Utility"
      dependencyNote="Utility Csound executable and freeze flags are used by SoundObject freeze/unfreeze and SoundFont inspection workflows, which are not yet implemented."
    >
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Csound Executable
        </label>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          Path to Csound executable for utility operations.
        </div>
        <input
          type="text"
          value={settings.csoundExecutable}
          onChange={(e) => set('csoundExecutable', e.target.value)}
          placeholder="/usr/local/bin/csound"
          style={{ width: '100%', maxWidth: '400px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Freeze Flags
        </label>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          Csound flags for SoundObject freeze rendering.
        </div>
        <input
          type="text"
          value={settings.freezeFlags}
          onChange={(e) => set('freezeFlags', e.target.value)}
          placeholder="-Ado"
          style={{ width: '100%', maxWidth: '400px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>
    </SettingsSection>
  );
}
