import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { LiveObject } from './live-object';
import { LiveObjectBins } from './live-object-bins';

export class LiveObjectSet implements BlueDataObject {
  private _name = '';
  private _liveObjectIds: string[] = [];

  constructor() {}

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }

  getLiveObjectIds(): string[] {
    return this._liveObjectIds;
  }

  setLiveObjectIds(ids: string[]): void {
    this._liveObjectIds = ids;
  }

  saveAsXML(): Element {
    const elem = new Element('liveObjectSet');
    elem.setAttribute('name', this._name);
    for (const id of this._liveObjectIds) {
      elem.addElement('liveObjectRef').setText(id);
    }
    return elem;
  }

  static loadFromXML(data: Element, bins: LiveObjectBins): LiveObjectSet {
    const set = new LiveObjectSet();
    const val = data.getAttribute('name');
    if (val) {
      set._name = val;
    }

    const ids: string[] = [];
    const nodes = data.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      if (node.getName() === 'liveObjectRef') {
        const uniqueId = node.getTextString();
        const lObj = bins.getLiveObjectByUniqueId(uniqueId);
        if (lObj) {
          ids.push(uniqueId);
        }
      }
    }
    set._liveObjectIds = ids;
    return set;
  }

  deepCopy(): BlueDataObject {
    const copy = new LiveObjectSet();
    copy._name = this._name;
    copy._liveObjectIds = [...this._liveObjectIds];
    return copy;
  }

  resolveLiveObjects(bins: LiveObjectBins): LiveObject[] {
    const result: LiveObject[] = [];
    for (const id of this._liveObjectIds) {
      const obj = bins.getLiveObjectByUniqueId(id);
      if (obj) result.push(obj);
    }
    return result;
  }
}
