/**
 * MarkersList — holds timeline markers.
 * Mirrors the Java MarkersList class.
 *
 * Preserves marker child elements losslessly for round-trip compatibility.
 */
import { Element } from './serialization/xml-reader';
import { BlueDataObject } from './blue-data-object';

export class MarkersList implements BlueDataObject {
  private _rawChildren: Element[] = [];

  constructor(other?: MarkersList) {
    if (other) {
      this._rawChildren = other._rawChildren.map(e => e.clone());
    }
  }

  getMarkers(): Element[] {
    return [...this._rawChildren];
  }

  saveAsXML(): Element {
    const elem = new Element('markersList');
    for (const child of this._rawChildren) {
      elem.addElement(child);
    }
    return elem;
  }

  static loadFromXML(data: Element): MarkersList {
    const list = new MarkersList();
    const children = data.getElements();
    while (children.hasMoreElements()) {
      list._rawChildren.push(children.next());
    }
    return list;
  }

  deepCopy(): BlueDataObject {
    return new MarkersList(this);
  }
}
