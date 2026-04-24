import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TemporaryInstrumentLibraryPanel from '../components/workbench/panels/orchestra/TemporaryInstrumentLibraryPanel';

describe('Temporary instrument library panel', () => {
  it('keeps the Java layout insertion point visible while deferring library parity', () => {
    const html = renderToStaticMarkup(
      <TemporaryInstrumentLibraryPanel
        library={{
          status: 'deferred',
          message: 'Program-wide orchestra library is deferred for this slice.',
        }}
      />,
    );

    expect(html).toContain('Instrument Library');
    expect(html).toContain('Program-wide orchestra library is deferred');
  });
});

