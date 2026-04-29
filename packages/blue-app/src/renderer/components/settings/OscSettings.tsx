import React from 'react';
import { useSettingsStore } from '../../stores/settings-store';
import SettingsField from './SettingsField';

export default function OscSettings(): React.ReactElement {
  const oscInputPort = useSettingsStore((s) => s.oscInputPort);
  const oscOutputPort = useSettingsStore((s) => s.oscOutputPort);
  const oscOutputHost = useSettingsStore((s) => s.oscOutputHost);
  const setOscInputPort = useSettingsStore((s) => s.setOscInputPort);
  const setOscOutputPort = useSettingsStore((s) => s.setOscOutputPort);
  const setOscOutputHost = useSettingsStore((s) => s.setOscOutputHost);

  return (
    <div>
      <h2 style={{ fontSize: '16px', color: '#fff', margin: '0 0 20px 0' }}>
        OSC
      </h2>
      <SettingsField
        label="OSC Input Port"
        value={oscInputPort ? String(oscInputPort) : ''}
        onChange={(v) => setOscInputPort(Number(v) || 0)}
        type="number"
        placeholder="e.g. 7770"
        description="Port for receiving OSC messages in Blue Live."
      />
      <SettingsField
        label="OSC Output Host"
        value={oscOutputHost}
        onChange={setOscOutputHost}
        placeholder="localhost"
        description="Host address for sending OSC messages."
      />
      <SettingsField
        label="OSC Output Port"
        value={oscOutputPort ? String(oscOutputPort) : ''}
        onChange={(v) => setOscOutputPort(Number(v) || 0)}
        type="number"
        placeholder="e.g. 7771"
        description="Port for sending OSC messages."
      />
    </div>
  );
}
