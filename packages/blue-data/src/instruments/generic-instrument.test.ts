import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { GenericInstrument } from './generic-instrument';

describe('GenericInstrument', () => {
  it('round-trips Java-style XML with comments and code fields', () => {
    const xml = `<instrument type="blue.orchestra.GenericInstrument">
      <name>Square</name>
      <comment>lead comment</comment>
      <globalOrc>gi1 ftgen 0, 0, 1024, 10, 1</globalOrc>
      <globalSco>f 1 0 1024 10 1</globalSco>
      <instrumentText>aout oscili p4, p5</instrumentText>
      <opcodeList/>
    </instrument>`;

    const instr = GenericInstrument.loadFromXML(Element.parse(xml));
    expect(instr.getName()).toBe('Square');
    expect(instr.getComment()).toBe('lead comment');
    expect(instr.getGlobalOrc()).toContain('gi1');
    expect(instr.getGlobalSco()).toContain('f 1');
    expect(instr.getText()).toContain('oscili');

    const saved = instr.saveAsXML();
    expect(saved.getName()).toBe('instrument');
    expect(saved.getAttribute('type')).toBe('blue.orchestra.GenericInstrument');
    expect(saved.getTextString('comment')).toBe('lead comment');
    expect(saved.getTextString('instrumentText')).toContain('oscili');
    expect(saved.getElement('opcodeList')).not.toBeNull();
  });
});
