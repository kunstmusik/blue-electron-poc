/**
 * LiveObjectSet — a set of LiveObjects.
 * Mirrors the Java LiveObjectSet class.
 */
import { LiveObject } from './live-object';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class LiveObjectSet extends Array<LiveObject> implements BlueDataObject {
  saveAsXML(): Element {
    const elem = new Element('liveObjectSet');
    for (const obj of this) {
      elem.addElement(obj.saveAsXML().setName('liveObject'));
    }
    return elem;
  }

  static loadFromXML(data: Element): LiveObjectSet {
    const set = new LiveObjectSet();
    const objs = data.getElements('liveObject');
    while (objs.hasMoreElements()) {
      set.push(LiveObject.loadFromXML(objs.next()));
    }
    return set;
  }

  deepCopy(): BlueDataObject {
    const copy = new LiveObjectSet();
    for (const obj of this) {
      copy.push(obj.deepCopy() as LiveObject);
    }
    return copy;
  }
}
