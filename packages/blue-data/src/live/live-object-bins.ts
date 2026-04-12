/**
 * LiveObjectBins — bin configuration for live objects.
 * Mirrors the Java LiveObjectBins class.
 *
 * Phase 9: data preservation (load/save XML).
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class LiveObjectBins implements BlueDataObject {
  private _binSize = 1;
  private _numBins = 16;

  getBinSize(): number { return this._binSize; }
  setBinSize(s: number): void { this._binSize = s; }

  getNumBins(): number { return this._numBins; }
  setNumBins(n: number): void { this._numBins = n; }

  saveAsXML(): Element {
    const elem = new Element('liveObjectBins');
    elem.addElement('binSize').setText(this._binSize.toString());
    elem.addElement('numBins').setText(this._numBins.toString());
    return elem;
  }

  static loadFromXML(data: Element): LiveObjectBins {
    const bins = new LiveObjectBins();
    const bs = data.getTextString('binSize');
    if (bs) bins._binSize = parseFloat(bs);
    const nb = data.getTextString('numBins');
    if (nb) bins._numBins = parseInt(nb, 10);
    return bins;
  }

  deepCopy(): BlueDataObject {
    const copy = new LiveObjectBins();
    copy._binSize = this._binSize;
    copy._numBins = this._numBins;
    return copy;
  }
}
