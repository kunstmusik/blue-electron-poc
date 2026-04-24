import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SplitPane from '../components/workbench/panels/orchestra/SplitPane';

describe('Orchestra split panes', () => {
  it('renders nested draggable splitters for the three Orchestra subwindows', () => {
    const html = renderToStaticMarkup(
      <SplitPane
        ariaLabel="Resize outer split"
        orientation="horizontal"
        first={
          <SplitPane
            ariaLabel="Resize inner split"
            orientation="vertical"
            first={<div>Arrangement</div>}
            second={<div>Library</div>}
          />
        }
        second={<div>Instrument editor</div>}
      />
    );

    expect(html).toContain('role="separator"');
    expect(html).toContain('Resize outer split');
    expect(html).toContain('Resize inner split');
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).toContain('aria-orientation="horizontal"');
  });
});