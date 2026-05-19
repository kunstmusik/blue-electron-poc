import React from 'react';
import type { DiskRenderSettingsSnapshot } from '../../../shared/program-settings';
import { FILE_FORMAT_CHOICES, SAMPLE_FORMAT_CHOICES } from '../../../shared/program-settings';
import SettingsSection from './SettingsSection';

interface DiskRenderSettingsProps {
  settings: DiskRenderSettingsSnapshot;
  onChange: (settings: DiskRenderSettingsSnapshot) => void;
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

export default function DiskRenderSettings({
  settings,
  onChange,
}: DiskRenderSettingsProps): React.ReactElement {
  const set = <K extends keyof DiskRenderSettingsSnapshot>(
    key: K,
    value: DiskRenderSettingsSnapshot[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <SettingsSection
      title="Disk Render"
      dependencyNote="Disk render execution, render-and-play, and render-and-open workflows are not yet implemented. File and sample format settings will be used when disk rendering is available."
    >
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
        Project Setting Defaults
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
        <input type="text" value={settings.zeroDbfs} onChange={(e) => set('zeroDbfs', e.target.value)} style={inputStyle} />
      </Field>

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        File Output Settings
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.fileFormatEnabled} onChange={(e) => set('fileFormatEnabled', e.target.checked)} />
        File Format Enabled
      </label>
      <Field label="File Format">
        <select value={settings.fileFormat} onChange={(e) => set('fileFormat', e.target.value)} style={selectStyle}>
          {FILE_FORMAT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.sampleFormatEnabled} onChange={(e) => set('sampleFormatEnabled', e.target.checked)} />
        Sample Format Enabled
      </label>
      <Field label="Sample Format">
        <select value={settings.sampleFormat} onChange={(e) => set('sampleFormat', e.target.value)} style={selectStyle}>
          {SAMPLE_FORMAT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.savePeakInformation} onChange={(e) => set('savePeakInformation', e.target.checked)} />
        Save Peak Information in Header
      </label>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.ditherOutput} onChange={(e) => set('ditherOutput', e.target.checked)} />
        Dither Output
      </label>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.rewriteHeader} onChange={(e) => set('rewriteHeader', e.target.checked)} />
        Rewrite Header While Rendering
      </label>

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

      <h3 style={{ fontSize: '14px', color: '#ddd', margin: '20px 0 12px 0', borderBottom: '1px solid #0f3460', paddingBottom: '4px' }}>
        Render and Play / Open
      </h3>

      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={settings.externalPlayCommandEnabled} onChange={(e) => set('externalPlayCommandEnabled', e.target.checked)} />
        Render and Play Enabled
      </label>
      <Field label="Render and Play Command">
        <input
          type="text"
          value={settings.externalPlayCommand}
          onChange={(e) => set('externalPlayCommand', e.target.value)}
          placeholder="command $outfile"
          style={{ ...inputStyle, width: '100%', maxWidth: '400px' }}
        />
      </Field>

      <Field label="Render and Open Command">
        <input
          type="text"
          value={settings.externalOpenCommand}
          onChange={(e) => set('externalOpenCommand', e.target.value)}
          placeholder="command $outfile"
          style={{ ...inputStyle, width: '100%', maxWidth: '400px' }}
        />
      </Field>
    </SettingsSection>
  );
}
