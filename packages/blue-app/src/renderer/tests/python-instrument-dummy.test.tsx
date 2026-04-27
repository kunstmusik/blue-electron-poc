import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { PythonInstrumentSnapshot } from '../../shared/project-editor';
import PythonInstrumentDummyPanel from '../components/workbench/panels/orchestra/PythonInstrumentDummyPanel';

describe('Python instrument dummy panel', () => {
  it('states that Python editor parity is deferred while preserving data', () => {
    const instrument: PythonInstrumentSnapshot = {
      assignmentId: 'py',
      type: 'python',
      name: 'PythonInstrument',
      enabled: true,
      comment: '',
      text: 'instrument = ""',
      globalOrc: '',
      globalSco: '',
    };

    const html = renderToStaticMarkup(
      <PythonInstrumentDummyPanel
        instrument={instrument}
        onInstrumentPatch={vi.fn()}
        onOrchestraPatch={vi.fn()}
      />,
    );

    expect(html).toContain('Python editor deferred');
    expect(html).toContain('Python instrument XML is preserved');
  });
});

