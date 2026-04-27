import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  GenericInstrumentSnapshot,
  JavaScriptInstrumentSnapshot,
} from '../../shared/project-editor';
import BlueSynthBuilderEditor from '../components/workbench/panels/orchestra/BlueSynthBuilderEditor';
import GenericInstrumentEditor from '../components/workbench/panels/orchestra/GenericInstrumentEditor';
import JavaScriptInstrumentEditor from '../components/workbench/panels/orchestra/JavaScriptInstrumentEditor';

describe('Orchestra code instrument editors', () => {
  it('renders GenericInstrument code tabs with Csound editor metadata', () => {
    const instrument: GenericInstrumentSnapshot = {
      assignmentId: '1',
      type: 'generic',
      name: 'Lead',
      enabled: true,
      comment: '',
      text: 'aout oscili p4, p5',
      globalOrc: 'gi1 ftgen 0, 0, 1024, 10, 1',
      globalSco: '',
    };

    const html = renderToStaticMarkup(
      <GenericInstrumentEditor
        instrument={instrument}
        onInstrumentPatch={vi.fn()}
        onOrchestraPatch={vi.fn()}
      />,
    );

    expect(html).toContain('Instrument');
    expect(html).toContain('UDO');
    expect(html).toContain('Global Orc');
    expect(html).toContain('Embedded opcode-list editing for Generic instruments is deferred');
    expect(html).toContain('data-editor-language="csound-orc"');
    expect(html).toContain('aout oscili');
    expect((html.match(/data-editor-language="csound-orc"/g) ?? []).length).toBe(3);
  });

  it('renders JavaScriptInstrument text editing surface', () => {
    const instrument: JavaScriptInstrumentSnapshot = {
      assignmentId: '2',
      type: 'javascript',
      name: 'Script',
      enabled: true,
      comment: '',
      text: 'instrument = "aout oscili 0.2, 440"',
      globalOrc: '',
      globalSco: '',
    };

    const html = renderToStaticMarkup(
      <JavaScriptInstrumentEditor
        instrument={instrument}
        onInstrumentPatch={vi.fn()}
        onOrchestraPatch={vi.fn()}
      />,
    );

    expect(html).toContain('Script');
    expect(html).toContain('UDO');
    expect(html).toContain('Global Orc');
    expect(html).toContain('Embedded opcode-list editing for JavaScript instruments is deferred');
    expect(html).toContain('instrument = &quot;aout oscili 0.2, 440&quot;');
    expect((html.match(/data-editor-language="csound-orc"/g) ?? []).length).toBe(2);
  });

  it('renders BlueSynthBuilder code and interface entry points', () => {
    const instrument: BlueSynthBuilderInstrumentSnapshot = {
      assignmentId: '3',
      type: 'blueSynthBuilder',
      name: 'Builder',
      enabled: true,
      comment: '',
      instrumentText: 'aout oscili <amp>, <freq>',
      alwaysOnInstrumentText: '',
      globalOrc: '',
      globalSco: '',
      objectNames: ['amp', 'freq'],
      widgets: [
        { objectName: 'amp', widgetType: 'BSBKnob', value: 0.5, minimum: 0, maximum: 1 },
        { objectName: 'freq', widgetType: 'BSBValue', value: 440, minimum: 20, maximum: 20000 },
      ],
      editEnabled: true,
      gridSettings: { enabled: false, snapEnabled: false, width: 10, height: 10 },
      widgetTree: {
        id: 'root',
        type: 'BSBRootGroup',
        objectName: '',
        x: 0, y: 0, width: 0, height: 0,
        value: 0, minimum: 0, maximum: 0,
        editable: true, properties: {},
        children: [
          { id: 'w1', type: 'BSBKnob', objectName: 'amp', x: 0, y: 0, width: 60, height: 60, value: 0.5, minimum: 0, maximum: 1, editable: true, properties: {} },
          { id: 'w2', type: 'BSBValue', objectName: 'freq', x: 0, y: 0, width: 60, height: 24, value: 440, minimum: 20, maximum: 20000, editable: true, properties: {} },
        ],
      },
      udolist: [],
    };

    const html = renderToStaticMarkup(
      <BlueSynthBuilderEditor
        instrument={instrument}
        onInstrumentPatch={vi.fn()}
        onOrchestraPatch={vi.fn()}
      />,
    );

    expect(html).toContain('Builder');
    expect(html).toContain('Code');
    expect(html).toContain('Interface');
    expect(html).toContain('UDO');
    expect(html).toContain('aout oscili');

    const editorTabs = [...html.matchAll(/data-bsb-editor-tab="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(editorTabs).toEqual(['interface', 'code', 'udo']);
  });
});
