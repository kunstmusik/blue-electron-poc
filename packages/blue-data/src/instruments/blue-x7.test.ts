import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { BlueX7 } from './blue-x7';

describe('BlueX7', () => {
  it('preserves unknown BlueX7 child XML while exposing name and comment', () => {
    const xml = `<instrument type="blue.orchestra.BlueX7">
      <name>DX Bass</name>
      <comment>x7 comment</comment>
      <algorithm>12</algorithm>
      <lfo><speed>22</speed></lfo>
    </instrument>`;

    const instr = BlueX7.loadFromXML(Element.parse(xml));
    expect(instr.getName()).toBe('DX Bass');
    expect(instr.getComment()).toBe('x7 comment');

    const savedXml = instr.saveAsXML().toXml();
    expect(savedXml).toContain('type="blue.orchestra.BlueX7"');
    expect(savedXml).toContain('<algorithm>12</algorithm>');
    expect(savedXml).toContain('<speed>22</speed>');
  });
});
