import { describe, it, expect } from 'vitest';
import { MidiInputProcessor } from './midi-input-processor';
import { Element } from '../serialization/xml-reader';

describe('MidiInputProcessor', () => {
  describe('default state', () => {
    it('has default key mapping', () => {
      const mip = new MidiInputProcessor();
      expect(mip.getKeyMapping()).toBe('PCH');
    });

    it('has default velocity mapping', () => {
      const mip = new MidiInputProcessor();
      expect(mip.getVelocityMapping()).toBe('MIDI');
    });

    it('has empty pitch constant', () => {
      const mip = new MidiInputProcessor();
      expect(mip.getPitchConstant()).toBe('');
    });

    it('has empty amp constant', () => {
      const mip = new MidiInputProcessor();
      expect(mip.getAmpConstant()).toBe('');
    });
  });

  describe('loadFromXML', () => {
    it('loads keyMapping', () => {
      const xml = '<midiInputProcessor><keyMapping>MIDI</keyMapping></midiInputProcessor>';
      const elem = Element.parse(xml);
      const mip = MidiInputProcessor.loadFromXML(elem);
      expect(mip.getKeyMapping()).toBe('MIDI');
    });

    it('loads velMapping', () => {
      const xml = '<midiInputProcessor><velMapping>RAW</velMapping></midiInputProcessor>';
      const elem = Element.parse(xml);
      const mip = MidiInputProcessor.loadFromXML(elem);
      expect(mip.getVelocityMapping()).toBe('RAW');
    });

    it('loads pitchConstant', () => {
      const xml = '<midiInputProcessor><pitchConstant>gk_pitch</pitchConstant></midiInputProcessor>';
      const elem = Element.parse(xml);
      const mip = MidiInputProcessor.loadFromXML(elem);
      expect(mip.getPitchConstant()).toBe('gk_pitch');
    });

    it('loads ampConstant', () => {
      const xml = '<midiInputProcessor><ampConstant>gk_amp</ampConstant></midiInputProcessor>';
      const elem = Element.parse(xml);
      const mip = MidiInputProcessor.loadFromXML(elem);
      expect(mip.getAmpConstant()).toBe('gk_amp');
    });
  });

  describe('saveAsXML', () => {
    it('saves all fields', () => {
      const mip = new MidiInputProcessor();
      mip.setKeyMapping('MIDI');
      mip.setVelocityMapping('RAW');
      mip.setPitchConstant('gk_pitch');
      mip.setAmpConstant('gk_amp');

      const xml = mip.saveAsXML();
      expect(xml.getName()).toBe('midiInputProcessor');
      expect(xml.getElement('keyMapping')?.getTextString()).toBe('MIDI');
      expect(xml.getElement('velMapping')?.getTextString()).toBe('RAW');
      expect(xml.getElement('pitchConstant')?.getTextString()).toBe('gk_pitch');
      expect(xml.getElement('ampConstant')?.getTextString()).toBe('gk_amp');
    });
  });

  describe('round-trip', () => {
    it('preserves data through save/load', () => {
      const original = new MidiInputProcessor();
      original.setKeyMapping('MIDI');
      original.setVelocityMapping('RAW');
      original.setPitchConstant('gk_pitch');
      original.setAmpConstant('gk_amp');

      const xml = original.saveAsXML();
      const loaded = MidiInputProcessor.loadFromXML(xml);

      expect(loaded.getKeyMapping()).toBe('MIDI');
      expect(loaded.getVelocityMapping()).toBe('RAW');
      expect(loaded.getPitchConstant()).toBe('gk_pitch');
      expect(loaded.getAmpConstant()).toBe('gk_amp');
    });
  });

  describe('deepCopy', () => {
    it('copies all fields', () => {
      const original = new MidiInputProcessor();
      original.setKeyMapping('MIDI');
      original.setVelocityMapping('RAW');
      original.setPitchConstant('gk_pitch');

      const copy = original.deepCopy() as MidiInputProcessor;
      expect(copy.getKeyMapping()).toBe('MIDI');
      expect(copy.getVelocityMapping()).toBe('RAW');
      expect(copy.getPitchConstant()).toBe('gk_pitch');
    });
  });
});
