import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { BlueX7InstrumentSnapshot } from '../../shared/project-editor';
import BlueX7Editor from '../components/workbench/panels/orchestra/BlueX7Editor';

describe('BlueX7 editor baseline', () => {
  it('renders preservation-focused BlueX7 editor state', () => {
    const instrument: BlueX7InstrumentSnapshot = {
      assignmentId: 'x7',
      type: 'blueX7',
      name: 'FM Bass',
      enabled: true,
      comment: '',
    };

    const html = renderToStaticMarkup(
      <BlueX7Editor
        instrument={instrument}
        onInstrumentPatch={vi.fn()}
        onOrchestraPatch={vi.fn()}
      />,
    );

    expect(html).toContain('BlueX7 project data is preserved');
  });
});

