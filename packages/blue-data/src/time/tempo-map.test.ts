import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { CurveType } from './curve-type';
import { TempoMap } from './tempo-map';
import { TempoPoint } from './tempo-point';

describe('TempoMap compatibility', () => {
  it('sorts out-of-order tempo points during accumulation', () => {
    const tempoMap = new TempoMap();
    tempoMap.setEnabled(true);
    tempoMap.addTempoPoint(new TempoPoint(8, 120, CurveType.CONSTANT));
    tempoMap.addTempoPoint(new TempoPoint(0, 60, CurveType.CONSTANT));

    expect(tempoMap.getBeat(0)).toBeCloseTo(0, 6);
    expect(tempoMap.getBeat(2)).toBeCloseTo(8, 6);
    expect(tempoMap.beatsToSeconds(4)).toBeCloseTo(4, 6);
  });

  it('round-trips XML with enabled and visible flags', () => {
    const tempoMap = new TempoMap();
    tempoMap.setEnabled(true);
    tempoMap.setVisible(true);
    tempoMap.setTempoPoint(0, 0, 90, CurveType.CONSTANT);
    tempoMap.addTempoPoint(new TempoPoint(8, 120, CurveType.LINEAR));

    const savedXml = tempoMap.saveAsXML().toXml();
    const reloaded = TempoMap.loadFromXML(Element.parse(savedXml));

    expect(reloaded.isEnabled()).toBe(true);
    expect(reloaded.isVisible()).toBe(true);
    expect(reloaded.size()).toBe(2);
    expect(reloaded.getTempo(0)).toBeCloseTo(90, 6);
  });
});