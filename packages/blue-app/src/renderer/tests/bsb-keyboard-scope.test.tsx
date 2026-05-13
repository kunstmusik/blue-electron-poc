// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbWidgetNodeSnapshot,
} from '../../shared/project-editor';
import BSBInterfaceCanvas from '../components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function makeWidgetNode(overrides: Partial<BsbWidgetNodeSnapshot> = {}): BsbWidgetNodeSnapshot {
  return {
    id: 'w1',
    type: 'BSBKnob',
    objectName: 'amp',
    x: 10,
    y: 20,
    width: 60,
    height: 60,
    value: 0.5,
    minimum: 0,
    maximum: 1,
    editable: true,
    properties: {},
    ...overrides,
  };
}

function makeInstrument(): BlueSynthBuilderInstrumentSnapshot {
  return {
    assignmentId: '1',
    type: 'blueSynthBuilder',
    name: 'Test BSB',
    enabled: true,
    comment: '',
    instrumentText: 'aout oscili <amp>, 440',
    alwaysOnInstrumentText: '',
    globalOrc: '',
    globalSco: '',
    objectNames: ['amp'],
    widgets: [{ objectName: 'amp', widgetType: 'BSBKnob', value: 0.5, minimum: 0, maximum: 1 }],
    editEnabled: true,
    gridSettings: { enabled: true, snapEnabled: true, width: 10, height: 10 },
    widgetTree: {
      id: 'root',
      type: 'BSBRootGroup',
      objectName: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      editable: true,
      properties: {},
      children: [makeWidgetNode()],
    },
  };
}

function renderRoot(element: React.ReactElement): { container: HTMLDivElement; unmount: () => void } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
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

describe('BSB keyboard shortcut scoping', () => {
  it('handles Delete on the canvas without falling through to window listeners', () => {
    const onWidgetSelect = vi.fn();
    const onBsbInterfacePatch = vi.fn();
    const onInstrumentPatch = vi.fn();
    const windowHandler = vi.fn();

    let cleanup: (() => void) | undefined;
    window.addEventListener('keydown', windowHandler);

    try {
      const rendered = renderRoot(
        <BSBInterfaceCanvas
          instrument={makeInstrument()}
          selectedWidgetIds={new Set(['w1'])}
          editEnabled
          onWidgetSelect={onWidgetSelect}
          onBsbInterfacePatch={onBsbInterfacePatch}
          onInstrumentPatch={onInstrumentPatch}
        />,
      );
      cleanup = rendered.unmount;

      const canvas = rendered.container.querySelector('[data-shortcut-scope="bsb-interface-canvas"]') as HTMLDivElement | null;
      expect(canvas).not.toBeNull();

      act(() => {
        canvas?.focus();
      });

      const event = new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        canvas?.dispatchEvent(event);
      });

      expect(onBsbInterfacePatch).toHaveBeenCalledWith({ type: 'removeWidget', widgetId: 'w1' });
      expect(onWidgetSelect).toHaveBeenCalledWith(null);
      expect(windowHandler).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('keydown', windowHandler);
      cleanup?.();
    }
  });
});