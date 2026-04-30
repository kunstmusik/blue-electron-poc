import { describe, it, expect } from 'vitest';
import { SoundObjectLibrary } from './sound-object-library';
import { GenericScore } from './generic-score';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import './register-sound-object-types';

describe('SoundObjectLibrary', () => {
  describe('default state', () => {
    it('has empty library', () => {
      const lib = new SoundObjectLibrary();
      expect(lib.size()).toBe(0);
      expect(lib.getAllObjects()).toEqual([]);
    });
  });

  describe('addObject', () => {
    it('adds objects and returns id', () => {
      const lib = new SoundObjectLibrary();
      const obj = new GenericScore();
      obj.setName('Test');
      const id = lib.addObject(obj);
      expect(id).toBeTruthy();
      expect(lib.size()).toBe(1);
    });
  });

  describe('loadFromXML', () => {
    it('loads empty library', () => {
      const xml = '<soundObjectLibrary></soundObjectLibrary>';
      const elem = Element.parse(xml);
      const lib = SoundObjectLibrary.loadFromXML(elem);
      expect(lib.size()).toBe(0);
    });

    it('loads library with sound objects', () => {
      const xml = `<soundObjectLibrary>
        <soundObject type="GenericScore" objRefId="lib_0">
          <name>Test Score</name>
          <scoreText>i1 0 1 440</scoreText>
        </soundObject>
      </soundObjectLibrary>`;
      const elem = Element.parse(xml);
      const objRefMap = new ObjRefLoadMap();
      const lib = SoundObjectLibrary.loadFromXML(elem, objRefMap);
      expect(lib.size()).toBe(1);
      expect(lib.getObject(0)?.getName()).toBe('Test Score');
    });

    it('registers objects in objRefMap', () => {
      const xml = `<soundObjectLibrary>
        <soundObject type="GenericScore" objRefId="lib_0">
          <name>Test</name>
          <scoreText>i1 0 1 440</scoreText>
        </soundObject>
      </soundObjectLibrary>`;
      const elem = Element.parse(xml);
      const objRefMap = new ObjRefLoadMap();
      SoundObjectLibrary.loadFromXML(elem, objRefMap);
      expect(objRefMap.has('lib_0')).toBe(true);
    });
  });

  describe('saveAsXML', () => {
    it('saves as soundObjectLibrary element', () => {
      const lib = new SoundObjectLibrary();
      const xml = lib.saveAsXML();
      expect(xml.getName()).toBe('soundObjectLibrary');
    });

    it('saves objects with objRefId', () => {
      const lib = new SoundObjectLibrary();
      const obj = new GenericScore();
      obj.setName('Test');
      lib.addObject(obj);

      const objRefMap = new ObjRefSaveMap();
      const xml = lib.saveAsXML(objRefMap);
      const children = xml.getElements();
      let count = 0;
      while (children.hasMoreElements()) {
        const child = children.next();
        count++;
        expect(child.getAttribute('objRefId')).toBeTruthy();
      }
      expect(count).toBe(1);
    });
  });

  describe('round-trip', () => {
    it('preserves library through save/load', () => {
      const lib = new SoundObjectLibrary();
      const obj = new GenericScore();
      obj.setName('Round Trip Test');
      obj.setScoreText('i1 0 1 440');
      lib.addObject(obj);

      const objRefMap = new ObjRefSaveMap();
      const xml = lib.saveAsXML(objRefMap);

      const loadMap = new ObjRefLoadMap();
      const loaded = SoundObjectLibrary.loadFromXML(xml, loadMap);

      expect(loaded.size()).toBe(1);
      expect(loaded.getObject(0)?.getName()).toBe('Round Trip Test');
    });
  });

  describe('deepCopy', () => {
    it('creates independent copy', () => {
      const lib = new SoundObjectLibrary();
      const obj = new GenericScore();
      obj.setName('Original');
      lib.addObject(obj);

      const copy = lib.deepCopy() as SoundObjectLibrary;
      expect(copy.size()).toBe(1);
      expect(copy).not.toBe(lib);
    });
  });
});
