import React, { useState } from 'react';
import GeneralSettings from './GeneralSettings';
import MidiSettings from './MidiSettings';
import OscSettings from './OscSettings';

type Category = 'general' | 'midi' | 'osc';

const categories: { id: Category; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'midi', label: 'MIDI' },
  { id: 'osc', label: 'OSC' },
];

export default function SettingsApp(): React.ReactElement {
  const [active, setActive] = useState<Category>('general');

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--color-blue-bg, #1a1a2e)',
      color: '#c8c8d8',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: '13px',
    }}>
      <nav style={{
        width: '160px',
        flexShrink: 0,
        background: 'var(--color-blue-surface, #16213e)',
        borderRight: '1px solid var(--color-blue-border, #0f3460)',
        padding: '12px 0',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              borderLeft: active === cat.id ? '2px solid var(--color-blue-accent, #e94560)' : '2px solid transparent',
              background: active === cat.id ? 'rgba(233,69,96,0.08)' : 'transparent',
              color: active === cat.id ? '#fff' : 'var(--color-blue-muted, #888)',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            {cat.label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        {active === 'general' && <GeneralSettings />}
        {active === 'midi' && <MidiSettings />}
        {active === 'osc' && <OscSettings />}
      </div>
    </div>
  );
}
