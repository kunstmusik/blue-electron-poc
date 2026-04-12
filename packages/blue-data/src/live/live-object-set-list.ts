/**
 * LiveObjectSetList — list of LiveObjectSets.
 * Mirrors the Java LiveObjectSetList class.
 */
import { LiveObjectSet } from './live-object-set';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class LiveObjectSetList extends Array<LiveObjectSet> implements BlueDataObject {
  saveAsXML(): Element {
    const elem = new Element('liveObjectSetList');
    for (const set of this) {
      elem.addElement(set.saveAsXML().setName('liveObjectSet'));
    }
    return elem;
  }

  static loadFromXML(data: Element): LiveObjectSetList {
    const list = new LiveObjectSetList();
    const sets = data.getElements('liveObjectSet');
    while (sets.hasMoreElements()) {
      list.push(LiveObjectSet.loadFromXML(sets.next()));
    }
    return list;
  }

  deepCopy(): BlueDataObject {
    const copy = new LiveObjectSetList();
    for (const set of this) {
      copy.push(set.deepCopy() as LiveObjectSet);
    }
    return copy;
  }
}
