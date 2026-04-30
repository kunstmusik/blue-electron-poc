import { describe, it, expect } from 'vitest';
import { Score } from './score';
import { PolyObject } from '../sound-objects/poly-object';
import { SoundLayer } from '../sound-objects/sound-layer';
import { GenericScore } from '../sound-objects/generic-score';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';

describe('Score model compatibility', () => {
  describe('default score', () => {
    it('has empty layer groups', () => {
      const score = new Score();
      expect(score.length).toBe(0);
    });

    it('has default time context', () => {
      const score = new Score();
      expect(score.getTimeContext()).toBeDefined();
      expect(score.getTimeContext().getTempoMap().getTempo()).toBe(60);
    });
  });

  describe('loadFromXML', () => {
    it('loads polyObject elements', () => {
      const xml = `<score>
        <polyObject type="PolyObject" name="Test">
          <soundLayer name="Layer 1">
            <soundObject type="GenericScore">
              <name>Score 1</name>
              <scoreText>i1 0 1 440</scoreText>
            </soundObject>
          </soundLayer>
        </polyObject>
      </score>`;
      const elem = Element.parse(xml);
      const score = Score.loadFromXML(elem);
      expect(score.length).toBe(1);
    });

    it('loads soundObject with PolyObject type', () => {
      const xml = `<score>
        <soundObject type="PolyObject" name="Legacy">
          <soundLayer name="Layer 1">
            <soundObject type="GenericScore">
              <name>Score 1</name>
              <scoreText>i1 0 1 440</scoreText>
            </soundObject>
          </soundLayer>
        </soundObject>
      </score>`;
      const elem = Element.parse(xml);
      const score = Score.loadFromXML(elem);
      expect(score.length).toBe(1);
    });

    it('loads nested GenericScore with Java full class name', () => {
      const xml = `<score>
        <polyObject type="PolyObject" name="Test">
          <soundLayer name="Layer 1">
            <soundObject type="blue.soundObject.GenericScore">
              <name>Score 1</name>
              <scoreText>i1 0 1 440</scoreText>
            </soundObject>
          </soundLayer>
        </polyObject>
      </score>`;
      const elem = Element.parse(xml);
      const score = Score.loadFromXML(elem);
      expect(score.length).toBe(1);
    });

    it('loads patternsLayerGroup', () => {
      const xml = `<score>
        <patternsLayerGroup name="Patterns">
          <patternBeatsLength>4</patternBeatsLength>
          <patternLayers>
            <patternLayer name="P1">
              <soundObject type="GenericScore">
                <name>Pattern Score</name>
                <scoreText>i1 0 1 440</scoreText>
              </soundObject>
              <patternData/>
            </patternLayer>
          </patternLayers>
        </patternsLayerGroup>
      </score>`;
      const elem = Element.parse(xml);
      const score = Score.loadFromXML(elem);
      expect(score.length).toBe(1);
    });
  });

  describe('saveAsXML', () => {
    it('saves polyObject elements', () => {
      const score = new Score();
      const poly = new PolyObject(false);
      poly.setName('Test Poly');
      const layer = new SoundLayer();
      layer.setName('Layer 1');
      const gs = new GenericScore();
      gs.setName('Score 1');
      gs.setScoreText('i1 0 1 440');
      layer.push(gs);
      poly.push(layer);
      score.push(poly);

      const xml = score.saveAsXML();
      expect(xml.getName()).toBe('score');
      const children = xml.getElements();
      let found = false;
      while (children.hasMoreElements()) {
        const child = children.next();
        if (child.getName() === 'polyObject') {
          found = true;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('deepCopy', () => {
    it('copies nested score tree', () => {
      const score = new Score();
      const poly = new PolyObject(false);
      poly.setName('Original');
      const layer = new SoundLayer();
      layer.setName('Layer 1');
      const gs = new GenericScore();
      gs.setName('Score 1');
      layer.push(gs);
      poly.push(layer);
      score.push(poly);

      const copy = new Score(score);
      expect(copy.length).toBe(1);

      // Mutate copy
      (copy[0] as PolyObject).setName('Modified');
      expect((score[0] as PolyObject).getName()).toBe('Original');
    });
  });
});
