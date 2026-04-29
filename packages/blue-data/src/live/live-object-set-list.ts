import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { LiveObjectSet } from './live-object-set';
import { LiveObjectBins } from './live-object-bins';

export class LiveObjectSetList implements BlueDataObject {
  private _sets: LiveObjectSet[] = [];

  constructor() {}

  getSets(): LiveObjectSet[] {
    return this._sets;
  }

  add(set: LiveObjectSet): void {
    this._sets.push(set);
  }

  removeAt(index: number): void {
    this._sets.splice(index, 1);
  }

  rename(index: number, name: string): void {
    if (index >= 0 && index < this._sets.length) {
      this._sets[index].setName(name);
    }
  }

  move(from: number, to: number): void {
    if (from < 0 || from >= this._sets.length) return;
    if (to < 0 || to >= this._sets.length) return;
    const [item] = this._sets.splice(from, 1);
    this._sets.splice(to, 0, item);
  }

  captureEnabledSet(bins: LiveObjectBins, name: string): LiveObjectSet {
    const set = new LiveObjectSet();
    set.setName(name);
    const enabled = bins.getEnabledLiveObjectSet();
    set.setLiveObjectIds(enabled.map((o) => o.getUniqueId()));
    this._sets.push(set);
    return set;
  }

  applySet(index: number, bins: LiveObjectBins): boolean {
    if (index < 0 || index >= this._sets.length) return false;
    const objects = this._sets[index].resolveLiveObjects(bins);
    bins.setEnabledFromLiveObjectSet(objects);
    return true;
  }

  saveAsXML(): Element {
    const elem = new Element('liveObjectSetList');
    for (const set of this._sets) {
      elem.addElement(set.saveAsXML());
    }
    return elem;
  }

  static loadFromXML(data: Element, bins: LiveObjectBins): LiveObjectSetList {
    const list = new LiveObjectSetList();
    const nodes = data.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      if (node.getName() === 'liveObjectSet') {
        list._sets.push(LiveObjectSet.loadFromXML(node, bins));
      }
    }
    return list;
  }

  deepCopy(): BlueDataObject {
    const copy = new LiveObjectSetList();
    for (const set of this._sets) {
      copy._sets.push(set.deepCopy() as LiveObjectSet);
    }
    return copy;
  }
}
