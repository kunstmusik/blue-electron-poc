/**
 * SoundObjectLibrary — library of reusable sound objects.
 * Mirrors the Java SoundObjectLibrary class.
 *
 * Stores sound objects with stable objRefId values for cross-reference
 * resolution (e.g., Instance sound objects reference library entries by id).
 */
import { SoundObject } from './sound-object';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { BlueDataObject } from '../blue-data-object';
import { loadSoundObjectFromXML } from './sound-object-registry';

export class SoundObjectLibrary implements BlueDataObject {
  private _objects: SoundObject[] = [];
  private _nextId = 0;

  constructor(other?: SoundObjectLibrary) {
    if (other) {
      this._objects = other._objects.map(obj => obj.deepCopy());
      this._nextId = other._nextId;
    }
  }

  addObject(obj: SoundObject): string {
    const id = this.generateId();
    this._objects.push(obj);
    return id;
  }

  getObject(index: number): SoundObject | undefined {
    return this._objects[index];
  }

  getObjectById(id: string, objRefMap?: ObjRefLoadMap): SoundObject | undefined {
    if (objRefMap) {
      const obj = objRefMap.get(id);
      if (obj && obj instanceof Object && 'generateForCSD' in obj) {
        return obj as SoundObject;
      }
    }
    return undefined;
  }

  getAllObjects(): SoundObject[] {
    return [...this._objects];
  }

  size(): number {
    return this._objects.length;
  }

  removeObject(index: number): boolean {
    if (index < 0 || index >= this._objects.length) return false;
    this._objects.splice(index, 1);
    return true;
  }

  private generateId(): string {
    return `lib_${this._nextId++}`;
  }

  // ─── XML ───

  saveAsXML(objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObjectLibrary');
    for (let i = 0; i < this._objects.length; i++) {
      const obj = this._objects[i];
      const sObjElem = obj.saveAsXML(objRefMap);
      // Assign stable objRefId for cross-reference resolution
      const id = objRefMap ? objRefMap.getId(obj) : `lib_${i}`;
      sObjElem.setAttribute('objRefId', id);
      elem.addElement(sObjElem);
    }
    return elem;
  }

  static loadFromXML(data: Element, objRefMap?: ObjRefLoadMap): SoundObjectLibrary {
    const lib = new SoundObjectLibrary();
    const children = data.getElements();
    while (children.hasMoreElements()) {
      const node = children.next();
      if (node.getName() === 'soundObject') {
        const sObj = loadSoundObjectFromXML(node, objRefMap);
        if (sObj) {
          lib._objects.push(sObj);
          // Register in objRefMap for cross-reference resolution
          const objRefId = node.getAttribute('objRefId');
          if (objRefId && objRefMap) {
            objRefMap.register(objRefId, sObj);
          }
        }
      }
    }
    return lib;
  }

  deepCopy(): BlueDataObject {
    return new SoundObjectLibrary(this);
  }
}
