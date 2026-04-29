// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import SettingsApp from '../components/settings/SettingsApp';
import { useSettingsStore } from '../stores/settings-store';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  useSettingsStore.setState({
    enginePath: 'blue-engine',
    recentFiles: [],
    windowBounds: null,
    midiInputDevice: '',
    midiOutputDevice: '',
    oscInputPort: 0,
    oscOutputPort: 0,
    oscOutputHost: 'localhost',
  });

  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('settings renderer', () => {
  it('shows the category sidebar and general editor by default', () => {
    act(() => {
      root.render(<SettingsApp />);
    });

    expect(container.textContent).toContain('General');
    expect(container.textContent).toContain('MIDI');
    expect(container.textContent).toContain('OSC');
    expect(container.textContent).toContain('Csound Engine Path');
  });

  it('switches between MIDI and OSC placeholders', () => {
    act(() => {
      root.render(<SettingsApp />);
    });

    const buttons = Array.from(container.querySelectorAll('button'));
    const midiButton = buttons.find((button) => button.textContent === 'MIDI');
    const oscButton = buttons.find((button) => button.textContent === 'OSC');

    act(() => {
      midiButton?.click();
    });

    expect(container.textContent).toContain('MIDI Input Device');
    expect(container.textContent).toContain('Device enumeration coming in a future update.');

    act(() => {
      oscButton?.click();
    });

    expect(container.textContent).toContain('OSC Output Host');
    expect(container.textContent).toContain('Port for sending OSC messages.');
  });
});