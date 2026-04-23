import { CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { EditorSelection, EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { describe, expect, it } from 'vitest';

import {
  copySelectionToClipboard,
  cutSelectionToClipboard,
  pasteClipboardText,
  replaceSelectionWithText,
} from '../components/workbench/panels/editors/csound-editor-actions';
import {
  createJavaBlueCsoundCompletionSource,
  findDocumentLocalCsoundVariables,
} from '../components/workbench/panels/editors/csound-java-blue-completions';
import { createJavaBlueCsoundEditorMenuItems } from '../components/workbench/panels/editors/csound-editor-menu';

function createFakeEditorView(doc: string, selection: EditorSelection): {
  view: EditorView;
  getState: () => EditorState;
  focus: () => unknown;
} {
  let state = EditorState.create({ doc, selection });
  const focus = vi.fn();

  const view = {
    get state() {
      return state;
    },
    dispatch(spec) {
      state = state.update(spec).state;
    },
    focus,
  } as unknown as EditorView;

  return {
    view,
    getState: () => state,
    focus,
  };
}

function getCompletionResult(doc: string, explicit = true): CompletionResult | null {
  const source = createJavaBlueCsoundCompletionSource({
    bsbReplacementKeys: [
      {
        key: 'freq',
        objectType: 'BSBKnob',
      },
    ],
    projectOpcodeNames: ['ProjectUDO'],
  });
  const state = EditorState.create({ doc });
  const context = new CompletionContext(state, state.doc.length, explicit);
  const result = source(context);

  if (result instanceof Promise) {
    throw new Error('Java Blue completion source should be synchronous');
  }

  return result;
}

describe('Csound editor parity completions', () => {
  it('returns Java Blue-style opcode completions with manual summary text', () => {
    const result = getCompletionResult('asig = osci');
    const oscil = result?.options.find((completion) => completion.label === 'oscil');

    expect(result?.from).toBe('asig = '.length);
    expect(oscil).toMatchObject({
      label: 'oscil',
      detail: 'opcode',
      type: 'function',
    });
    expect(oscil?.apply).toContain('oscil');
    expect(oscil?.info).toContain('A simple oscillator');
    expect(oscil?.info).toContain('Syntax');
  });

  it('scans document-local Csound variables before the current word like Java Blue', () => {
    const variables = findDocumentLocalCsoundVariables(
      'asig = oscil 0.5, 440\nksig = init 0\n',
      'as',
    );

    expect(variables).toContainEqual({
      label: 'asig',
      type: 'variable',
      detail: 'variable',
      boost: 30,
    });
  });

  it('offers Blue Variables after an angled replacement prefix', () => {
    const result = getCompletionResult('<RENDER');

    expect(result?.from).toBe(0);
    expect(result?.options).toContainEqual({
      label: '<RENDER_START>',
      type: 'constant',
      detail: 'Blue variable',
      info: '<RENDER_START>\n\nBlue runtime variable replacement token.',
      boost: 35,
    });
  });

  it('supports BSB replacement-key completions as editor context', () => {
    const result = getCompletionResult('<fr');

    expect(result?.options).toContainEqual({
      label: '<freq>',
      displayLabel: 'freq',
      type: 'variable',
      detail: 'BSBKnob',
      apply: '<freq>',
      boost: 40,
    });
  });

  it('offers Blue opcodes as completion entries', () => {
    const result = getCompletionResult('blueMixer');

    expect(result?.options).toContainEqual({
      label: 'blueMixerOut',
      type: 'function',
      detail: 'Blue opcode',
      apply: 'blueMixerOut asig1 [, asig2...]',
      info: 'blueMixerOut\n\nRoutes audio-rate signals to the Blue mixer.',
      boost: 25,
    });
  });

  it('adds document and project UDO names without duplicating opcode labels', () => {
    const result = getCompletionResult('opcode LocalUDO, a, a\nendop\nLocal');
    const projectResult = getCompletionResult('Proj');

    expect(result?.options).toContainEqual({
      label: 'LocalUDO',
      type: 'function',
      detail: 'UDO',
      boost: 22,
    });
    expect(result?.options.filter((completion) => completion.label === 'LocalUDO')).toHaveLength(1);
    expect(projectResult?.options).toContainEqual({
      label: 'ProjectUDO',
      type: 'function',
      detail: 'project UDO',
      boost: 21,
    });
  });
});

describe('Csound editor parity menu and clipboard helpers', () => {
  it('builds the Java Blue-style context menu shape with the required items', () => {
    const menuItems = createJavaBlueCsoundEditorMenuItems();

    expect(
      menuItems.map((item) => (item.kind === 'separator' ? 'separator' : item.label)),
    ).toEqual([
      'Blue Variables',
      'Opcodes',
      'Blue Opcodes',
      'separator',
      'Custom',
      'Add to Code Repository',
      'separator',
      'Cut',
      'Copy',
      'Paste',
    ]);

    const blueVariables = menuItems[0];
    const blueOpcodes = menuItems[2];

    if (blueVariables.kind !== 'submenu' || blueOpcodes.kind !== 'submenu') {
      throw new Error('Expected Blue Variables and Blue Opcodes submenus');
    }

    expect(blueVariables.items.map((item) => item.label)).toEqual([
      '<TOTAL_DUR>',
      '<RENDER_START>',
      '<PROCESSING_START>',
      '<INSTR_ID>',
      '<INSTR_NAME>',
    ]);
    expect(blueOpcodes.items.map((item) => item.insertText)).toEqual([
      'blueMixerOut asig1 [, asig2...]',
      'blueMixerOut "subchannelName", asig1 ,asig2 [, asig3...]',
      'asig1 [, asig2...] blueMixerIn',
    ]);

    expect(menuItems[1]).toMatchObject({
      kind: 'disabled',
      label: 'Opcodes',
    });
    expect(menuItems[4]).toMatchObject({
      kind: 'disabled',
      label: 'Custom',
    });
    expect(menuItems[5]).toMatchObject({
      kind: 'disabled',
      label: 'Add to Code Repository',
    });
  });

  it('replaces the selected range when inserting text', () => {
    const state = EditorState.create({
      doc: 'abc',
      selection: EditorSelection.range(1, 2),
    });

    const transaction = state.update(replaceSelectionWithText(state, 'XYZ'));

    expect(transaction.state.doc.toString()).toBe('aXYZc');
  });

  it('copies, cuts, and pastes through the clipboard bridge', async () => {
    const clipboardBridge = {
      readText: vi.fn().mockResolvedValue('PASTE'),
      writeText: vi.fn().mockResolvedValue(undefined),
    };

    const copyEditor = createFakeEditorView('hello world', EditorSelection.range(0, 5));
    const copied = await copySelectionToClipboard(copyEditor.view, clipboardBridge);

    expect(copied).toBe(true);
    expect(clipboardBridge.writeText).toHaveBeenCalledWith('hello');
    expect(copyEditor.focus).toHaveBeenCalled();
    expect(copyEditor.getState().doc.toString()).toBe('hello world');

    const cutEditor = createFakeEditorView('hello world', EditorSelection.range(6, 11));
    const cut = await cutSelectionToClipboard(cutEditor.view, clipboardBridge);

    expect(cut).toBe(true);
    expect(clipboardBridge.writeText).toHaveBeenCalledWith('world');
    expect(cutEditor.getState().doc.toString()).toBe('hello ');

    const pasteEditor = createFakeEditorView('hello ', EditorSelection.cursor(6));
    const pasted = await pasteClipboardText(pasteEditor.view, clipboardBridge);

    expect(pasted).toBe(true);
    expect(clipboardBridge.readText).toHaveBeenCalled();
    expect(pasteEditor.getState().doc.toString()).toBe('hello PASTE');
  });
});
