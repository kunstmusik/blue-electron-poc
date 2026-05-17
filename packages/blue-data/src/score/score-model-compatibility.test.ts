import { describe, it, expect } from 'vitest';
import { Score } from './score';
import { PolyObject } from '../sound-objects/poly-object';
import { SoundLayer } from '../sound-objects/sound-layer';
import { GenericScore } from '../sound-objects/generic-score';
import { TimeDuration } from '../time/time-duration';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';

describe('Score model compatibility', () => {
  describe('default score', () => {
    it('has one root PolyObject layer group', () => {
      const score = new Score();
      expect(score.length).toBe(1);
      expect(score[0]).toBeInstanceOf(PolyObject);
      expect((score[0] as PolyObject).getName()).toBe('SoundObject Layer Group');
    });

    it('root PolyObject has one default SoundLayer', () => {
      const score = new Score();
      const root = score[0] as PolyObject;
      expect(root.length).toBe(1);
      expect(root[0]).toBeInstanceOf(SoundLayer);
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

    it('loads soundObject with Java fully-qualified PolyObject type', () => {
      const xml = `<score>
        <soundObject type="blue.soundObject.PolyObject" name="Java Poly">
          <startTime type="BEATS"><csoundBeats>0.0</csoundBeats></startTime>
          <subjectiveDuration type="BEATS"><csoundBeats>4.0</csoundBeats></subjectiveDuration>
          <name>Java Poly</name>
          <backgroundColor>-16777216</backgroundColor>
          <soundLayer name="Layer 1">
            <soundObject type="blue.soundObject.GenericScore">
              <name>Score 1</name>
              <scoreText>i1 0 1 440</scoreText>
            </soundObject>
          </soundLayer>
        </soundObject>
      </score>`;
      const elem = Element.parse(xml);
      const score = Score.loadFromXML(elem);
      expect(score.length).toBe(1);
      expect((score[0] as PolyObject).getName()).toBe('Java Poly');
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
        if (child.getName() === 'soundObject' && child.getAttribute('type') === 'blue.soundObject.PolyObject') {
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
      expect(copy.length).toBe(2);

      (copy[1] as PolyObject).setName('Modified');
      expect((score[1] as PolyObject).getName()).toBe('Original');
    });
  });

  describe('generateForCSD render window', () => {
    it('filters root PolyObject notes after the render end', () => {
      const score = new Score();
      score.length = 0;

      const poly = new PolyObject(true);
      const layer = new SoundLayer();
      const gs = new GenericScore();
      gs.setSubjectiveDuration(TimeDuration.beats(16));
      gs.setScoreText('i1 0 1 440\ni1 8 1 440\ni1 12 1 440');
      layer.push(gs);
      poly.push(layer);
      score.push(poly);

      const notes = score.generateForCSD(new CompileData(), 0, 10);

      const startTimes = [...notes].map((note) => note.getStartTime());
      expect(startTimes).toHaveLength(2);
      expect(Math.max(...startTimes)).toBeLessThanOrEqual(10);
    });
  });
});
