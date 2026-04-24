import { describe, expect, it } from 'vitest';
import { Element } from './serialization/xml-reader';
import { Arrangement } from './arrangement';
import { GenericInstrument } from './instruments/generic-instrument';
import { JavaScriptInstrument } from './instruments/javascript-instrument';

describe('Arrangement', () => {
  it('round-trips Java-style instrument assignments with embedded instruments', () => {
    const xml = `<arrangement>
      <instrumentAssignment arrangementId="1" isEnabled="true">
        <instrument type="blue.orchestra.GenericInstrument">
          <name>Lead</name>
          <comment>lead comment</comment>
          <globalOrc/>
          <globalSco/>
          <instrumentText>aout oscili p4, p5</instrumentText>
          <opcodeList/>
        </instrument>
      </instrumentAssignment>
      <instrumentAssignment arrangementId="bus" isEnabled="false">
        <instrument type="blue.orchestra.JavaScriptInstrument">
          <name>Script</name>
          <comment>js comment</comment>
          <globalOrc/>
          <globalSco/>
          <instrumentText>instrument = "";</instrumentText>
          <opcodeList/>
        </instrument>
      </instrumentAssignment>
    </arrangement>`;

    const arrangement = Arrangement.loadFromXML(Element.parse(xml));
    expect(arrangement.size()).toBe(2);
    expect(arrangement.getInstrument(0)).toBeInstanceOf(GenericInstrument);
    expect(arrangement.getArrangement()[1].enabled).toBe(false);
    expect(arrangement.getInstrument(1)).toBeInstanceOf(JavaScriptInstrument);

    const savedXml = arrangement.saveAsXML().toXml();
    expect(savedXml).toContain('arrangementId="1"');
    expect(savedXml).toContain('isEnabled="false"');
    expect(savedXml).toContain('blue.orchestra.GenericInstrument');
    expect(savedXml).toContain('blue.orchestra.JavaScriptInstrument');
  });

  it('supports replacement and assignment updates by arrangement id', () => {
    const arrangement = new Arrangement();
    const first = new GenericInstrument();
    first.setName('A');
    arrangement.addInstrument(first, '1');

    const replacement = new JavaScriptInstrument();
    replacement.setName('B');
    expect(arrangement.replaceInstrument('1', replacement)).toBe(true);
    expect(arrangement.getInstrumentById('1')).toBe(replacement);

    expect(arrangement.updateAssignment('1', {
      enabled: false,
      nextArrangementId: '2',
    })).toBe(true);
    expect(arrangement.getArrangement()[0].arrangementId).toBe('2');
    expect(arrangement.getArrangement()[0].enabled).toBe(false);
  });

  it('rejects blank and duplicate arrangement id updates', () => {
    const arrangement = new Arrangement();
    arrangement.addInstrument(new GenericInstrument(), '1');
    arrangement.addInstrument(new JavaScriptInstrument(), '2');

    expect(arrangement.updateAssignment('1', { nextArrangementId: '' })).toBe(false);
    expect(arrangement.getArrangement()[0].arrangementId).toBe('1');
    expect(arrangement.updateAssignment('1', { nextArrangementId: '2' })).toBe(false);
    expect(arrangement.getArrangement()[0].arrangementId).toBe('1');
  });
});
