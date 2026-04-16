/**
 * Pattern — a single row/layer in the PatternObject step sequencer.
 * Mirrors the Java blue.soundObject.pattern.Pattern class.
 *
 * Each Pattern has a boolean values array (which steps are active),
 * a patternScore (Csound score text emitted for each active step),
 * and muted/solo flags.
 */
import { Element } from '../../serialization/xml-reader';

export class Pattern {
  values: boolean[];
  patternName = 'pattern';
  patternScore = '';
  muted = false;
  solo = false;

  constructor(numSteps: number) {
    this.values = new Array(numSteps).fill(false);
  }

  static copyFrom(other: Pattern): Pattern {
    const p = new Pattern(other.values.length);
    p.values = [...other.values];
    p.patternName = other.patternName;
    p.patternScore = other.patternScore;
    p.muted = other.muted;
    p.solo = other.solo;
    return p;
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('pattern');
    elem.addElement('patternName').setText(this.patternName);
    elem.addElement('patternScore').setText(this.patternScore);
    elem.addElement('muted').setText(this.muted.toString());
    elem.addElement('solo').setText(this.solo.toString());

    const buffer: string[] = [];
    for (const v of this.values) {
      buffer.push(v ? '1' : '0');
    }
    elem.addElement('values').setText(buffer.join(''));

    return elem;
  }

  static loadFromXML(data: Element): Pattern {
    let name = '';
    let score = '';
    let muted = false;
    let solo = false;
    let values = new Array(16).fill(false);

    const nodes = data.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      const nodeName = node.getName();
      switch (nodeName) {
        case 'patternName':
          name = node.getTextString() ?? '';
          break;
        case 'patternScore':
          score = node.getTextString() ?? '';
          break;
        case 'muted':
          muted = node.getTextString() === 'true';
          break;
        case 'solo':
          solo = node.getTextString() === 'true';
          break;
        case 'values': {
          const valStr = node.getTextString() ?? '';
          values = new Array(valStr.length).fill(false);
          for (let i = 0; i < valStr.length; i++) {
            values[i] = valStr[i] === '1';
          }
          break;
        }
      }
    }

    const p = new Pattern(values.length);
    p.patternName = name;
    p.patternScore = score;
    p.muted = muted;
    p.solo = solo;
    p.values = values;
    return p;
  }
}
