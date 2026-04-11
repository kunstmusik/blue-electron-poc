/**
 * LiveData — holds Blue Live mode data.
 * Mirrors the Java LiveData class.
 *
 * For Phase 3: stub — preserves XML on load/save.
 */
import { Element } from './serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from './serialization/obj-ref-map';
import { BlueDataObject } from './blue-data-object';

export class LiveData implements BlueDataObject {
  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    return new Element('liveData');
  }

  static loadFromXML(_data: Element, _objRefMap?: ObjRefLoadMap): LiveData {
    return new LiveData();
  }

  deepCopy(): BlueDataObject {
    return new LiveData();
  }
}
