import React from 'react';
import type { RealtimeRenderSettingsSnapshot } from '../../../shared/program-settings';
import { getAudioDrivers, getMidiDrivers } from '../../../shared/program-settings';
import SettingsSection from './SettingsSection';

interface RealtimeRenderSettingsProps {
  settings: RealtimeRenderSettingsSnapshot;
  onChange: (settings: RealtimeRenderSettingsSnapshot) => void;
}

const inputStyle: React.CSSProperties = {
  width: '120px',
  padding: '6px 10px',
  background: '#0d0d1a',
  color: '#e0e0e0',
  border: '1px solid #0f3460',
  borderRadius: '4px',
  fontSize: '13px',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: '#0d0d1a',
  color: '#e0e0e0',
  border: '1px solid #0f3460',
  borderRadius: '4px',
  fontSize: '13px',
  outline: 'none',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: '#c8c8d8',
  cursor: 'pointer',
  marginBottom: '12px',
};

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#aaa',
  marginBottom: '4px',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function RealtimeRenderSettings({
  settings,
  onChange,
}: RealtimeRenderSettingsProps): React.ReactElement {
  const set = <K extends keyof RealtimeRenderSettingsSnapshot>(
    key: K,
    value: RealtimeRenderSettingsSnapshot[K],
  ) => onChange({ ...settings, [key]: value });

  const platform = navigator.platform.toLowerCase().includes('mac') ? 'darwin'
    : navigator.platform.toLowerCase().includes('win') ? 'win32'
    : 'linux';
  const audioDrivers = getAudioDrivers(platform);
  const midiDrivers = getMidiDrivers(platform);

  return (
    <SettingsSection title="Realtime Render">
      <Field label="Csound Executable">
        <input
          type="text"
          value={settings.csoundExecutable}
          onChange={(e) => set('csoundExecutable', e.target.value)}
          placeholder="/usr/local/bin/csound"
          style={{ ...inputStyle, width: '100%', maxWidth: '400px' }}
        />
      </Field>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        Project Settings
      </h3>

      <Field label="Default Sample Rate (sr)">
        <input type="text" value={settings.defaultSr} onChange={(e) => set('defaultSr', e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Default ksmps">
        <input type="text" value={settings.defaultKsmps} onChange={(e) => set('defaultKsmps', e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Default nchnls">
        <input type="text" value={settings.defaultNchnls} onChange={(e) => set('defaultNchnls', e.target.value)} style={inputStyle} />
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.useZeroDbfs} onChange={(e) => set('useZeroDbfs', e.target.checked)} />
        Use 0dbfs
      </label>
      <Field label="0dbfs Value">
        <input type="text" value={settings.zeroDbfs} onChange={(e) => set('zeroDbfs', e.target.value)} style={inputStyle} disabled={!settings.useZeroDbfs} />
      </Field>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        Audio
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.audioDriverEnabled} onChange={(e) => set('audioDriverEnabled', e.target.checked)} />
        Audio Driver Enabled
      </label>
      <Field label="Audio Driver">
        <select value={settings.audioDriver} onChange={(e) => set('audioDriver', e.target.value)} style={selectStyle} disabled={!settings.audioDriverEnabled}>
          {audioDrivers.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.audioOutEnabled} onChange={(e) => set('audioOutEnabled', e.target.checked)} />
        Audio Out Enabled
      </label>
      <Field label="Audio Out">
        <input type="text" value={settings.audioOutText} onChange={(e) => set('audioOutText', e.target.value)} style={{ ...inputStyle, maxWidth: '300px' }} />
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.audioInEnabled} onChange={(e) => set('audioInEnabled', e.target.checked)} />
        Audio In Enabled
      </label>
      <Field label="Audio In">
        <input type="text" value={settings.audioInText} onChange={(e) => set('audioInText', e.target.value)} style={{ ...inputStyle, maxWidth: '300px' }} />
      </Field>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        MIDI
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.midiDriverEnabled} onChange={(e) => set('midiDriverEnabled', e.target.checked)} />
        MIDI Driver Enabled
      </label>
      <Field label="MIDI Driver">
        <select value={settings.midiDriver} onChange={(e) => set('midiDriver', e.target.value)} style={selectStyle} disabled={!settings.midiDriverEnabled}>
          {midiDrivers.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.midiOutEnabled} onChange={(e) => set('midiOutEnabled', e.target.checked)} />
        MIDI Out Enabled
      </label>
      <Field label="MIDI Out">
        <input type="text" value={settings.midiOutText} onChange={(e) => set('midiOutText', e.target.value)} style={{ ...inputStyle, maxWidth: '300px' }} />
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.midiInEnabled} onChange={(e) => set('midiInEnabled', e.target.checked)} />
        MIDI In Enabled
      </label>
      <Field label="MIDI In">
        <input type="text" value={settings.midiInText} onChange={(e) => set('midiInText', e.target.value)} style={{ ...inputStyle, maxWidth: '300px' }} />
      </Field>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        Buffer Settings
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.softwareBufferEnabled} onChange={(e) => set('softwareBufferEnabled', e.target.checked)} />
        Software Buffer Enabled
      </label>
      <Field label="Software Buffer Size">
        <input type="number" value={settings.softwareBufferSize} onChange={(e) => set('softwareBufferSize', parseInt(e.target.value, 10) || 1024)} style={inputStyle} disabled={!settings.softwareBufferEnabled} />
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.hardwareBufferEnabled} onChange={(e) => set('hardwareBufferEnabled', e.target.checked)} />
        Hardware Buffer Enabled
      </label>
      <Field label="Hardware Buffer Size">
        <input type="number" value={settings.hardwareBufferSize} onChange={(e) => set('hardwareBufferSize', parseInt(e.target.value, 10) || 4096)} style={inputStyle} disabled={!settings.hardwareBufferEnabled} />
      </Field>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        Message Level
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.noteAmpsEnabled} onChange={(e) => set('noteAmpsEnabled', e.target.checked)} />
        Note Amplitudes
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.outOfRangeEnabled} onChange={(e) => set('outOfRangeEnabled', e.target.checked)} />
        Out-of-Range Messages
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.warningsEnabled} onChange={(e) => set('warningsEnabled', e.target.checked)} />
        Warnings
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.benchmarkEnabled} onChange={(e) => set('benchmarkEnabled', e.target.checked)} />
        Benchmark Information
      </label>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        Other Settings
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.displaysDisabled} onChange={(e) => set('displaysDisabled', e.target.checked)} />
        Disable Displays
      </label>

      <Field label="Advanced Settings">
        <input
          type="text"
          value={settings.advancedSettings}
          onChange={(e) => set('advancedSettings', e.target.value)}
          placeholder="Additional Csound command-line options"
          style={{ ...inputStyle, width: '100%', maxWidth: '400px' }}
        />
      </Field>
    </SettingsSection>
  );
}
