import React from 'react';
import type { GeneralSettingsSnapshot } from '../../../shared/program-settings';
import SettingsSection from './SettingsSection';

interface GeneralSettingsProps {
  settings: GeneralSettingsSnapshot;
  onChange: (settings: GeneralSettingsSnapshot) => void;
}

export default function GeneralSettings({
  settings,
  onChange,
}: GeneralSettingsProps): React.ReactElement {
  const set = <K extends keyof GeneralSettingsSnapshot>(
    key: K,
    value: GeneralSettingsSnapshot[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <SettingsSection title="General">
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Work Directory
        </label>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          Default directory for file choosers and import/export operations.
        </div>
        <input
          type="text"
          value={settings.workDirectory}
          onChange={(e) => set('workDirectory', e.target.value)}
          placeholder="(default user directory)"
          style={{ width: '100%', maxWidth: '400px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.newUserDefaultsEnabled} onChange={(e) => set('newUserDefaultsEnabled', e.target.checked)} />
          New User Defaults Enabled
        </label>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.drawAlphaBackgroundOnMarquee} onChange={(e) => set('drawAlphaBackgroundOnMarquee', e.target.checked)} />
          Draw Alpha Background on Marquee
        </label>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.messageColorsEnabled} onChange={(e) => set('messageColorsEnabled', e.target.checked)} />
          Message Colors Enabled
        </label>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.csoundErrorWarningEnabled} onChange={(e) => set('csoundErrorWarningEnabled', e.target.checked)} />
          Csound Error Warning Enabled
        </label>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Max Temp Files per Directory
        </label>
        <input
          type="number"
          min={1}
          value={settings.directoryTempFileLimit}
          onChange={(e) => set('directoryTempFileLimit', parseInt(e.target.value, 10) || 3)}
          style={{ width: '120px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>
    </SettingsSection>
  );
}
