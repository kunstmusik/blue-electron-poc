// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuxiliarySlideout from '../components/workbench/AuxiliarySlideout';
import type { AuxiliarySlideoutView } from '../components/workbench/auxiliary-layout';

vi.mock('../components/workbench/panels/output/OutputPanel', () => ({
  default: () => React.createElement('div', { 'data-testid': 'output-panel' }),
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderRoot(element: React.ReactElement): {
  container: HTMLDivElement;
  root: Root;
  unmount: () => void;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    root,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('AuxiliarySlideout', () => {
  it('renders the output panel for the output slideout', () => {
    const slideout: AuxiliarySlideoutView = {
      edge: 'right',
      groupInstanceId: 'output-main',
      panelId: 'OutputTopComponent',
      size: 320,
    };

    const tree = renderRoot(
      <AuxiliarySlideout
        slideout={slideout}
        onClose={vi.fn()}
        onDock={vi.fn()}
        onResize={vi.fn()}
      />,
    );

    expect(tree.container.querySelector('[data-testid="output-panel"]')).not.toBeNull();
    expect(tree.container.textContent).not.toContain('Placeholder — to be implemented');

    tree.unmount();
  });

  it('keeps placeholder content for non-output slideouts', () => {
    const slideout: AuxiliarySlideoutView = {
      edge: 'right',
      groupInstanceId: 'properties-main',
      panelId: 'AudioFilePlayerTopComponent',
      size: 320,
    };

    const tree = renderRoot(
      <AuxiliarySlideout
        slideout={slideout}
        onClose={vi.fn()}
        onDock={vi.fn()}
        onResize={vi.fn()}
      />,
    );

    expect(tree.container.querySelector('[data-testid="output-panel"]')).toBeNull();
    expect(tree.container.textContent).toContain('Placeholder — to be implemented');

    tree.unmount();
  });
});