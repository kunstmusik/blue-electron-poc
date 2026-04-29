import { describe, it, expect } from 'vitest';
import { Mixer } from './mixer';
import { Element } from '../serialization/xml-reader';

describe('Mixer', () => {
  describe('default state', () => {
    it('is enabled by default', () => {
      const mixer = new Mixer();
      expect(mixer.isEnabled()).toBe(true);
    });

    it('has master channel named Master', () => {
      const mixer = new Mixer();
      expect(mixer.getMaster().getName()).toBe('Master');
    });
  });

  describe('omitted-mixer semantics (Java compatibility)', () => {
    it('loading an empty mixer element keeps it enabled', () => {
      const xml = '<mixer></mixer>';
      const elem = Element.parse(xml);
      const mixer = Mixer.loadFromXML(elem);
      expect(mixer.isEnabled()).toBe(true);
    });

    it('loading mixer with enabled="false" disables it', () => {
      const xml = '<mixer enabled="false"></mixer>';
      const elem = Element.parse(xml);
      const mixer = Mixer.loadFromXML(elem);
      expect(mixer.isEnabled()).toBe(false);
    });
  });

  describe('save/load round-trip', () => {
    it('preserves enabled state', () => {
      const mixer = new Mixer();
      mixer.setEnabled(false);
      const xml = mixer.saveAsXML();
      const loaded = Mixer.loadFromXML(xml);
      expect(loaded.isEnabled()).toBe(false);
    });
  });

  describe('deepCopy', () => {
    it('creates independent copy', () => {
      const original = new Mixer();
      const copy = original.deepCopy() as Mixer;
      expect(copy).not.toBe(original);
      expect(copy.isEnabled()).toBe(original.isEnabled());
    });

    it('mutation does not leak', () => {
      const original = new Mixer();
      original.setEnabled(true);
      const copy = original.deepCopy() as Mixer;
      copy.setEnabled(false);
      expect(original.isEnabled()).toBe(true);
    });
  });
});
