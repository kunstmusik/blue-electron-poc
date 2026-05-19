import React from 'react';
import type { ProjectDefaultsSettingsSnapshot } from '../../../shared/program-settings';
import {
  TIME_BASE_CHOICES,
  SNAP_VALUE_CHOICES,
  SMPTE_FRAME_RATES,
  LAYER_HEIGHT_CHOICES,
  UDO_STYLE_CHOICES,
} from '../../../shared/program-settings';
import SettingsSection from './SettingsSection';

interface ProjectDefaultsSettingsProps {
  settings: ProjectDefaultsSettingsSnapshot;
  onChange: (settings: ProjectDefaultsSettingsSnapshot) => void;
}

export default function ProjectDefaultsSettings({
  settings,
  onChange,
}: ProjectDefaultsSettingsProps): React.ReactElement {
  const set = <K extends keyof ProjectDefaultsSettingsSnapshot>(
    key: K,
    value: ProjectDefaultsSettingsSnapshot[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <SettingsSection title="Project Defaults">
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Default Author
        </label>
        <input
          type="text"
          value={settings.defaultAuthor}
          onChange={(e) => set('defaultAuthor', e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.mixerEnabled} onChange={(e) => set('mixerEnabled', e.target.checked)} />
          Mixer Enabled
        </label>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Default Layer Height
        </label>
        <select
          value={settings.layerHeightDefault}
          onChange={(e) => set('layerHeightDefault', parseInt(e.target.value, 10))}
          style={{ padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        >
          {LAYER_HEIGHT_CHOICES.map((h, i) => (
            <option key={h} value={i}>{h}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Default UDO Style
        </label>
        <select
          value={settings.defaultUdoStyle}
          onChange={(e) => set('defaultUdoStyle', e.target.value as 'CLASSIC' | 'MODERN')}
          style={{ padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        >
          {UDO_STYLE_CHOICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Primary Ruler
        </label>
        <select
          value={settings.defaultPrimaryTimeBase}
          onChange={(e) => set('defaultPrimaryTimeBase', e.target.value)}
          style={{ padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        >
          {TIME_BASE_CHOICES.map((tb) => (
            <option key={tb} value={tb}>{tb}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.defaultSecondaryRulerEnabled} onChange={(e) => set('defaultSecondaryRulerEnabled', e.target.checked)} />
          Secondary Ruler Enabled
        </label>
      </div>

      <div style={{ marginBottom: '16px', marginLeft: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Secondary Ruler
        </label>
        <select
          value={settings.defaultSecondaryTimeBase}
          onChange={(e) => set('defaultSecondaryTimeBase', e.target.value)}
          disabled={!settings.defaultSecondaryRulerEnabled}
          style={{ padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        >
          {TIME_BASE_CHOICES.map((tb) => (
            <option key={tb} value={tb}>{tb}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.defaultSnapEnabled} onChange={(e) => set('defaultSnapEnabled', e.target.checked)} />
          Snap Enabled
        </label>
      </div>

      <div style={{ marginBottom: '16px', marginLeft: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Snap Value
        </label>
        <select
          value={settings.defaultSnapValue}
          onChange={(e) => set('defaultSnapValue', e.target.value)}
          disabled={!settings.defaultSnapEnabled}
          style={{ padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        >
          {SNAP_VALUE_CHOICES.map((sv) => (
            <option key={sv} value={sv}>{sv}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          SMPTE Frame Rate
        </label>
        <select
          value={settings.defaultSmpteFrameRate}
          onChange={(e) => set('defaultSmpteFrameRate', parseFloat(e.target.value))}
          style={{ padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        >
          {SMPTE_FRAME_RATES.map((fr) => (
            <option key={fr} value={fr}>{fr}</option>
          ))}
        </select>
      </div>
    </SettingsSection>
  );
}
