import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BlueSynthBuilder } from '@blue/data';
import { Element } from '@blue/data';
import type { BlueSynthBuilderInstrumentSnapshot } from '../../shared/project-editor';
import BSBCodeEditor from '../components/workbench/panels/orchestra/bsb/BSBCodeEditor';
import BSBInterfaceEditor from '../components/workbench/panels/orchestra/bsb/BSBInterfaceEditor';
import { createBsbReplacementKeys } from '../components/workbench/panels/orchestra/bsb/bsb-completions';

const BSB_INSTRUMENT: BlueSynthBuilderInstrumentSnapshot = {
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
};

describe('BlueSynthBuilder editor', () => {
  it('generates instrument text with BSB widget replacement values', () => {
    const instrument = BlueSynthBuilder.loadFromXML(
      Element.parse(`<instrument type="blue.orchestra.BlueSynthBuilder">
        <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
        <graphicInterface>
          <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
            <objectName>amp</objectName>
            <value>0.25</value>
          </bsbObject>
        </graphicInterface>
        <opcodeList/>
      </instrument>`),
    );

    expect(instrument.generateInstrument()).toBe('aout oscili 0.25, 440');
  });

  it('maps BSB object names into Java Blue replacement completion keys', () => {
    expect(createBsbReplacementKeys(['amp'])).toEqual([
      { key: 'amp', objectType: 'BSB object' },
    ]);
  });

  it('renders BSB code editor tabs', () => {
    const html = renderToStaticMarkup(
      <BSBCodeEditor
        instrument={BSB_INSTRUMENT}
        onInstrumentPatch={vi.fn()}
        onOrchestraPatch={vi.fn()}
      />,
    );

    expect(html).toContain('Always On');
    expect(html).toContain('Global Sco');
    expect(html).toContain('aout oscili');
    expect((html.match(/data-editor-language="csound-orc"/g) ?? []).length).toBe(4);
  });

  it('renders BSB interface placeholder and replacement keys', () => {
    const html = renderToStaticMarkup(
      <BSBInterfaceEditor instrument={BSB_INSTRUMENT} onInstrumentPatch={vi.fn()} />,
    );

    expect(html).toContain('Interface');
    expect(html).toContain('&lt;amp&gt;');
    expect(html).toContain('&lt;freq&gt;');
    expect(html).toContain('BSBKnob');
  });
});
