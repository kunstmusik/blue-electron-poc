/**
 * ScratchPadData — holds scratch pad data.
 * Mirrors the Java ScratchPadData class.
 *
 * Stores scratch text and word-wrap setting for the project's scratch pad.
 */
import { Element } from './serialization/xml-reader';
import { BlueDataObject } from './blue-data-object';

export class ScratchPadData implements BlueDataObject {
  private _scratchText = '';
  private _wordWrapEnabled = true;

  constructor(other?: ScratchPadData) {
    if (other) {
      this._scratchText = other._scratchText;
      this._wordWrapEnabled = other._wordWrapEnabled;
    }
  }

  getScratchText(): string {
    return this._scratchText;
  }

  setScratchText(text: string): void {
    this._scratchText = text;
  }

  isWordWrapEnabled(): boolean {
    return this._wordWrapEnabled;
  }

  setWordWrapEnabled(enabled: boolean): void {
    this._wordWrapEnabled = enabled;
  }

  saveAsXML(): Element {
    const elem = new Element('scratchPadData');
    elem.addElement('isWordWrapEnabled').setText(this._wordWrapEnabled.toString());
    elem.addElement('scratchText').setText(this._scratchText);
    return elem;
  }

  static loadFromXML(data: Element): ScratchPadData {
    const result = new ScratchPadData();

    const wrapElem = data.getTextString('isWordWrapEnabled');
    if (wrapElem !== null) {
      result._wordWrapEnabled = wrapElem.toLowerCase() === 'true';
    }

    const textElem = data.getTextString('scratchText');
    if (textElem !== null) {
      result._scratchText = textElem;
    }

    return result;
  }

  deepCopy(): BlueDataObject {
    return new ScratchPadData(this);
  }
}
