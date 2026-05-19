import React from 'react';
import type { PlaybackSettingsSnapshot } from '../../../shared/program-settings';
import SettingsSection from './SettingsSection';

interface PlaybackSettingsProps {
  settings: PlaybackSettingsSnapshot;
  onChange: (settings: PlaybackSettingsSnapshot) => void;
}

export default function PlaybackSettings({
  settings,
  onChange,
}: PlaybackSettingsProps): React.ReactElement {
  const set = <K extends keyof PlaybackSettingsSnapshot>(
    key: K,
    value: PlaybackSettingsSnapshot[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <SettingsSection title="Playback">
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Time Pointer Animation FPS
        </label>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          Frames per second for playhead animation (1-120).
        </div>
        <input
          type="number"
          min={1}
          max={120}
          value={settings.playbackFps}
          onChange={(e) => set('playbackFps', parseInt(e.target.value, 10) || 24)}
          style={{ width: '120px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '4px' }}>
          Latency Correction (seconds)
        </label>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          Offset applied to playhead position for display latency.
        </div>
        <input
          type="number"
          step={0.01}
          value={settings.playbackLatencyCorrection}
          onChange={(e) => set('playbackLatencyCorrection', parseFloat(e.target.value) || 0)}
          style={{ width: '120px', padding: '6px 10px', background: '#0d0d1a', color: '#e0e0e0', border: '1px solid #0f3460', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.followPlayback} onChange={(e) => set('followPlayback', e.target.checked)} />
          Score Follows Playback
        </label>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c8c8d8', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.followPlaybackOnStart} onChange={(e) => set('followPlaybackOnStart', e.target.checked)} />
          Enable Follows Playback on Render Start
        </label>
      </div>
    </SettingsSection>
  );
}
