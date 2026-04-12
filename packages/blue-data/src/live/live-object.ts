/**
 * LiveObject — an object in Blue Live mode.
 * Mirrors the Java LiveObject class.
 *
 * Phase 9: data preservation (load/save XML).
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class LiveObject implements BlueDataObject {
  private _name = '';
  private _scoreText = '';

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getScoreText(): string { return this._scoreText; }
  setScoreText(text: string): void { this._scoreText = text; }

  saveAsXML(): Element {
    const elem = new Element('liveObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('scoreText').setText(this._scoreText);
    return elem;
  }

  static loadFromXML(data: Element): LiveObject {
    const obj = new LiveObject();
    const name = data.getTextString('name');
    if (name) obj._name = name;
    const score = data.getTextString('scoreText');
    if (score !== null) obj._scoreText = score;
    return obj;
  }

  deepCopy(): BlueDataObject {
    const copy = new LiveObject();
    copy._name = this._name;
    copy._scoreText = this._scoreText;
    return copy;
  }
}
