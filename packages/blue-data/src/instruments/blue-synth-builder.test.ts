import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { BlueSynthBuilder } from './blue-synth-builder';

describe('BlueSynthBuilder', () => {
  it('preserves loaded graphic interface XML and opcode lists', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Builder</name>
      <comment>builder comment</comment>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x>
          <y>20</y>
          <value>0.5</value>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const savedXml = instrument.saveAsXML().toXml();

    expect(instrument.getName()).toBe('Builder');
    expect(instrument.getComment()).toBe('builder comment');
    expect(savedXml).toContain('<graphicInterface>');
    expect(savedXml).toContain('blue.orchestra.blueSynthBuilder.BSBKnob');
    expect(savedXml).toContain('<objectName>amp</objectName>');
    expect(savedXml).toContain('<opcodeList/>');
  });

  it('updates loaded widget values and serializes the edited interface', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Builder</name>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x>
          <y>20</y>
          <value>0.5</value>
          <minimum>0</minimum>
          <maximum>1</maximum>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    expect(instrument.updateWidgetValue('amp', 0.75)).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<objectName>amp</objectName>');
    expect(savedXml).toContain('<value>0.75</value>');
  });
});
