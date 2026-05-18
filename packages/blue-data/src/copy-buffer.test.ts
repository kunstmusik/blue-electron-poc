import { afterEach, describe, expect, it } from 'vitest';

import { Element } from './serialization/xml-reader';
import { clear, getCopy, setCopy } from './copy-buffer';
import { BlueSynthBuilder } from './instruments/blue-synth-builder';
import { collectBsbWidgetIds } from './instruments/blue-synth-builder/bsb-identity';

function createBuilder(): BlueSynthBuilder {
  return BlueSynthBuilder.loadFromXML(Element.parse(`<instrument type="blue.orchestra.BlueSynthBuilder" editEnabled="true">
    <name>Clipboard</name>
    <comment></comment>
    <globalOrc></globalOrc>
    <globalSco></globalSco>
    <instrumentText>instr 1\n  outc &lt;gain&gt;, &lt;gain&gt;\nendin</instrumentText>
    <alwaysOnInstrumentText></alwaysOnInstrumentText>
    <graphicInterface>
      <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob" version="2" uniqueId="widget-knob">
        <objectName>gain</objectName>
        <x>10</x>
        <y>20</y>
        <value>0.5</value>
        <minimum>0</minimum>
        <maximum>1</maximum>
        <automationAllowed>true</automationAllowed>
      </bsbObject>
    </graphicInterface>
    <parameterList>
      <parameter uniqueId="gain-param" name="gain" label="Gain" min="0.0" max="1.0" automationEnabled="false" value="0.5">
        <line>
          <linePoint x="0.0" y="0.5"/>
        </line>
      </parameter>
    </parameterList>
    <opcodeList/>
  </instrument>`));
}

describe('copy buffer', () => {
  afterEach(() => {
    clear();
  });

  it('returns clone-safe duplicated BlueSynthBuilder clipboard entries', () => {
    const original = createBuilder();
    setCopy(original);

    const copy = getCopy() as BlueSynthBuilder;

    expect(copy).toBeInstanceOf(BlueSynthBuilder);
    expect(copy).not.toBe(original);
    expect(collectBsbWidgetIds(copy.getGraphicInterface().getRootGroup())).not.toEqual(
      collectBsbWidgetIds(original.getGraphicInterface().getRootGroup()),
    );
    expect(copy.getParameters().map((parameter) => parameter.getUniqueId())).not.toEqual(
      original.getParameters().map((parameter) => parameter.getUniqueId()),
    );
    expect(copy.getParameters().map((parameter) => parameter.getName())).toEqual(
      original.getParameters().map((parameter) => parameter.getName()),
    );
  });
});
