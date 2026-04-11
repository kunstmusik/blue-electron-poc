/**
 * MarkersList — holds timeline markers.
 * Mirrors the Java MarkersList class.
 *
 * For Phase 3: stub — preserves XML on load/save.
 */
import { Element } from './serialization/xml-reader';
import { BlueDataObject } from './blue-data-object';

export class MarkersList implements BlueDataObject {
  saveAsXML(): Element {
    return new Element('markersList');
  }

  static loadFromXML(_data: Element): MarkersList {
    return new MarkersList();
  }

  deepCopy(): BlueDataObject {
    return new MarkersList();
  }
}
