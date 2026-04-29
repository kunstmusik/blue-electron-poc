import { describe, expect, it } from 'vitest';
import { BlueData } from './blue-data';
import { BlueSynthBuilder } from './instruments/blue-synth-builder';
import { GenericInstrument } from './instruments/generic-instrument';
import { OpcodeDefinition } from './opcodes/opcode-definition';

function createProjectWithInstrument(): BlueData {
  const data = new BlueData();
  const instr = new GenericInstrument();
  instr.setName('TestInstr');
  instr.setText('aout oscili p4, p5\n  out aout');
  data.getArrangement().addInstrument(instr, '1');
  return data;
}

describe('Blue Live CSD generation', () => {
  it('generates a valid CSD from a minimal project', () => {
    const data = new BlueData();
    const result = data.toBlueLiveCSD();

    expect(result.csdText).toContain('<CsoundSynthesizer>');
    expect(result.csdText).toContain('</CsoundSynthesizer>');
    expect(result.csdText).toContain('<CsInstruments>');
    expect(result.csdText).toContain('</CsInstruments>');
    expect(result.csdText).toContain('<CsScore>');
    expect(result.csdText).toContain('</CsScore>');
  });

  it('uses 36000 second duration in the score', () => {
    const data = new BlueData();
    const result = data.toBlueLiveCSD();

    expect(result.csdText).toContain('e 36000');
  });

  it('includes always-on instruments in the score when present', () => {
    const data = new BlueData();
    const instr = new BlueSynthBuilder();
    instr.setName('AlwaysOnInstr');
    instr.setInstrumentText('aout oscili 0.25, 440\nout aout');
    instr.setAlwaysOnInstrumentText('aout oscili 0.25, 220\nblueMixerOut aout');
    data.getArrangement().addInstrument(instr, '1');

    const result = data.toBlueLiveCSD();
    expect(result.csdText).toContain('i2 0 36000');
  });

  it('includes blueAllNotesOff instrument in the orchestra', () => {
    const data = createProjectWithInstrument();
    const result = data.toBlueLiveCSD();

    expect(result.csdText).toContain('instr blueAllNotesOff');
    expect(result.csdText).toContain('turnoff2');
  });

  it('blueAllNotesOff turns off numeric instrument IDs', () => {
    const data = createProjectWithInstrument();
    const result = data.toBlueLiveCSD();

    expect(result.csdText).toMatch(/turnoff2 \d+, 0, 1/);
  });

  it('includes orchestra header with sr, ksmps, nchnls', () => {
    const data = new BlueData();
    const result = data.toBlueLiveCSD();

    expect(result.csdText).toMatch(/sr=/);
    expect(result.csdText).toMatch(/ksmps=/);
    expect(result.csdText).toMatch(/nchnls=/);
  });

  it('includes project UDOs in the orchestra', () => {
    const data = new BlueData();
    const udo = new OpcodeDefinition();
    udo.setName('myUDO');
    udo.setOutTypes('a');
    udo.setInTypes('a');
    udo.setCode('xin\n  xout = xin\n  xout');
    data.getOpcodeList().addOpcode(udo);

    const result = data.toBlueLiveCSD();
    expect(result.csdText).toContain('myUDO');
  });

  it('includes global orchestra and score text', () => {
    const data = new BlueData();
    data.getGlobalOrcSco().setGlobalOrc('giGlobal init 1');
    data.getGlobalOrcSco().setGlobalSco('f1 0 1024 10 1');

    const result = data.toBlueLiveCSD();
    expect(result.csdText).toContain('giGlobal init 1');
    expect(result.csdText).toContain('f1 0 1024 10 1');
  });

  it('keeps arrangement global orchestra text in CsInstruments, not CsScore', () => {
    const data = new BlueData();
    const instr = new GenericInstrument();
    instr.setName('HasGlobalOrc');
    instr.setText('aout oscili p4, p5\n  out aout');
    instr.setGlobalOrc('giArr init 2');
    data.getArrangement().addInstrument(instr, '1');

    const result = data.toBlueLiveCSD();
    const instruments = result.csdText.match(/<CsInstruments>([\s\S]*?)<\/CsInstruments>/)?.[1] ?? '';
    const score = result.csdText.match(/<CsScore>([\s\S]*?)<\/CsScore>/)?.[1] ?? '';

    expect(instruments).toContain('giArr init 2');
    expect(score).not.toContain('giArr init 2');
  });

  it('uses named always-on ids for non-numeric arrangement ids', () => {
    const data = new BlueData();
    const instr = new BlueSynthBuilder();
    instr.setName('NamedAlwaysOn');
    instr.setInstrumentText('aout oscili 0.25, 440\nout aout');
    instr.setAlwaysOnInstrumentText('aout oscili 0.25, 330\nblueMixerOut aout');
    data.getArrangement().addInstrument(instr, 'PadBus');

    const result = data.toBlueLiveCSD();
    expect(result.csdText).toContain('instr PadBus_alwaysOn');
    expect(result.csdText).toContain('i "PadBus_alwaysOn" 0 36000');
  });

  it('generates empty CSD for a default BlueData', () => {
    const data = new BlueData();
    const result = data.toBlueLiveCSD();

    expect(result.csdText).toBeDefined();
    expect(result.csdText.length).toBeGreaterThan(0);
    expect(result.parameters).toBeDefined();
    expect(result.stringChannels).toBeDefined();
  });
});
