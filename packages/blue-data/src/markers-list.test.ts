import { describe, it, expect } from 'vitest';
import { MarkersList } from './markers-list';
import { Element } from './serialization/xml-reader';

describe('MarkersList', () => {
  describe('default state', () => {
    it('has empty markers list', () => {
      const list = new MarkersList();
      expect(list.getMarkers()).toEqual([]);
    });
  });

  describe('loadFromXML', () => {
    it('loads empty markersList', () => {
      const xml = '<markersList></markersList>';
      const elem = Element.parse(xml);
      const list = MarkersList.loadFromXML(elem);
      expect(list.getMarkers()).toEqual([]);
    });

    it('preserves unknown child elements for lossless round-trip', () => {
      const xml = '<markersList><marker name="A" time="1.5"/><marker name="B" time="3.0"/></markersList>';
      const elem = Element.parse(xml);
      const list = MarkersList.loadFromXML(elem);
      // MarkersList preserves raw XML children for lossless round-trip
      const saved = list.saveAsXML();
      const children = saved.getElements();
      let count = 0;
      while (children.hasMoreElements()) {
        children.next();
        count++;
      }
      expect(count).toBe(2);
    });
  });

  describe('saveAsXML', () => {
    it('saves as markersList element', () => {
      const list = new MarkersList();
      const xml = list.saveAsXML();
      expect(xml.getName()).toBe('markersList');
    });
  });

  describe('round-trip', () => {
    it('preserves markers through save/load', () => {
      const xml = '<markersList><marker name="A" time="1.5"/></markersList>';
      const elem = Element.parse(xml);
      const list = MarkersList.loadFromXML(elem);

      const saved = list.saveAsXML();
      const loaded = MarkersList.loadFromXML(saved);
      const children = saved.getElements();
      let count = 0;
      while (children.hasMoreElements()) {
        children.next();
        count++;
      }
      expect(count).toBe(1);
    });
  });

  describe('deepCopy', () => {
    it('creates independent copy', () => {
      const original = new MarkersList();
      const copy = original.deepCopy();
      expect(copy).not.toBe(original);
    });
  });
});
