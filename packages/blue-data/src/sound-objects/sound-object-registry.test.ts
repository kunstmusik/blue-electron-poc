import { describe, it, expect } from 'vitest';
import { normalizeClassName, registerSoundObjectType, loadSoundObjectFromXML } from './sound-object-registry';
import { Element } from '../serialization/xml-reader';
import './register-sound-object-types';

describe('SoundObjectRegistry', () => {
  describe('normalizeClassName', () => {
    it('strips Java package prefix', () => {
      expect(normalizeClassName('blue.soundObject.GenericScore')).toBe('GenericScore');
    });

    it('handles nested packages', () => {
      expect(normalizeClassName('blue.soundObject.PolyObject')).toBe('PolyObject');
    });

    it('returns short name as-is', () => {
      expect(normalizeClassName('GenericScore')).toBe('GenericScore');
    });

    it('handles null', () => {
      expect(normalizeClassName(null)).toBe('');
    });

    it('handles empty string', () => {
      expect(normalizeClassName('')).toBe('');
    });
  });

  describe('loadSoundObjectFromXML', () => {
    it('loads GenericScore by short name', () => {
      const xml = '<soundObject type="GenericScore"><name>Test</name><scoreText>i1 0 1 440</scoreText></soundObject>';
      const elem = Element.parse(xml);
      const obj = loadSoundObjectFromXML(elem);
      expect(obj).not.toBeNull();
      expect(obj?.getName()).toBe('Test');
    });

    it('loads GenericScore by Java full class name', () => {
      const xml = '<soundObject type="blue.soundObject.GenericScore"><name>Test</name><scoreText>i1 0 1 440</scoreText></soundObject>';
      const elem = Element.parse(xml);
      const obj = loadSoundObjectFromXML(elem);
      expect(obj).not.toBeNull();
      expect(obj?.getName()).toBe('Test');
    });

    it('returns null for unknown type', () => {
      const xml = '<soundObject type="UnknownType"><name>Test</name></soundObject>';
      const elem = Element.parse(xml);
      const obj = loadSoundObjectFromXML(elem);
      expect(obj).toBeNull();
    });

    it('returns null for missing type', () => {
      const xml = '<soundObject><name>Test</name></soundObject>';
      const elem = Element.parse(xml);
      const obj = loadSoundObjectFromXML(elem);
      expect(obj).toBeNull();
    });
  });
});
