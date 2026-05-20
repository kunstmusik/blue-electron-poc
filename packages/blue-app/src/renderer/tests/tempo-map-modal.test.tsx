// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TempoMapPatch, TempoMapSnapshot } from '../../shared/project-editor';
import TempoMapEditorDialog from '../components/workbench/panels/score/TempoMapEditorDialog';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const BASE_TEMPO_MAP: TempoMapSnapshot = {
  enabled: true,
  visible: true,
  points: [
    { beat: 0, tempo: 60, curveType: 'constant' },
    { beat: 4, tempo: 120, curveType: 'linear' },
  ],
};

function setInputValue(input: HTMLInputElement, value: string): void {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function renderDialog(tempoMap: TempoMapSnapshot = BASE_TEMPO_MAP): {
  container: HTMLDivElement;
  root: Root;
  onCommit: ReturnType<typeof vi.fn<(patch: TempoMapPatch) => void>>;
  onClose: ReturnType<typeof vi.fn<() => void>>;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onCommit = vi.fn<(patch: TempoMapPatch) => void>();
  const onClose = vi.fn<() => void>();

  act(() => {
    root.render(
      <TempoMapEditorDialog tempoMap={tempoMap} onCommit={onCommit} onClose={onClose} />,
    );
  });

  return { container, root, onCommit, onClose };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('TempoMapEditorDialog', () => {
  it('adds a new row at last beat plus four with the previous tempo', () => {
    const { container, root } = renderDialog();
    const addButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Add',
    ) as HTMLButtonElement;

    act(() => {
      addButton.click();
    });

    const rows = Array.from(container.querySelectorAll('tbody tr'));
    expect(rows).toHaveLength(3);

    const lastInputs = rows[2]?.querySelectorAll('input[type="number"]') ?? [];
    expect((lastInputs[0] as HTMLInputElement).value).toBe('8');
    expect((lastInputs[1] as HTMLInputElement).value).toBe('120');

    act(() => {
      root.unmount();
    });
  });

  it('disables deletion when only one row remains', () => {
    const { container, root } = renderDialog({
      enabled: true,
      visible: false,
      points: [{ beat: 0, tempo: 72, curveType: 'constant' }],
    });
    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Del',
    ) as HTMLButtonElement;

    expect(deleteButton.disabled).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  it('cancels without committing changes', () => {
    const { container, root, onCommit, onClose } = renderDialog();
    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Cancel',
    ) as HTMLButtonElement;

    act(() => {
      cancelButton.click();
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });

  it('commits a replaceTempoMap patch on OK while preserving enabled and visible flags', () => {
    const { container, root, onCommit, onClose } = renderDialog();
    const inputs = Array.from(container.querySelectorAll('input[type="number"]')) as HTMLInputElement[];

    act(() => {
      setInputValue(inputs[2]!, '6');
      setInputValue(inputs[3]!, '132');
    });

    const okButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'OK',
    ) as HTMLButtonElement;

    act(() => {
      okButton.click();
    });

    expect(onCommit).toHaveBeenCalledWith({
      type: 'replaceTempoMap',
      map: {
        enabled: true,
        visible: true,
        points: [
          { beat: 0, tempo: 60, curveType: 'constant' },
          { beat: 6, tempo: 132, curveType: 'linear' },
        ],
      },
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });
});