// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import ScoreOverlayLines from '../components/workbench/panels/score/ScoreOverlayLines';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderOverlay(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <ScoreOverlayLines
        renderStartTime={12}
        renderEndTime={16}
        timePointerBeats={14}
        pixelsPerBeat={100}
        totalBeats={80}
        scrollLeft={800}
      />,
    );
  });

  return { container, root };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ScoreOverlayLines', () => {
  it('keeps render and pointer lines inside a full timeline-width layer when scrolled', () => {
    const { container, root } = renderOverlay();

    const viewport = container.querySelector('[data-score-overlay-viewport]');
    const content = container.querySelector('[data-score-overlay-content]') as HTMLDivElement | null;

    expect(viewport).not.toBeNull();
    expect(content).not.toBeNull();
    expect(content?.style.width).toBe('8000px');
    expect(content?.style.transform).toBe('translateX(-800px)');

    const overlayElements = Array.from(content?.children ?? []) as HTMLDivElement[];
    expect(overlayElements.some((element) => element.style.left === '1200px')).toBe(true);
    expect(overlayElements.some((element) => element.style.left === '1400px')).toBe(true);
    expect(overlayElements.some((element) => element.style.left === '1600px')).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
