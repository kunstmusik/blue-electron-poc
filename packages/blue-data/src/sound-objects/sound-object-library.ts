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

export interface SoundObjectLibraryEntry {
  libraryId: string;
  object: SoundObject;
}

export class SoundObjectLibrary implements BlueDataObject {
  private _objects: SoundObject[] = [];
  private _idMap = new Map<SoundObject, string>();
  private _nextId = 0;

  constructor(other?: SoundObjectLibrary) {
    if (other) {
      for (const obj of other._objects) {
        const copy = obj.deepCopy();
        this._objects.push(copy);
        const id = other._idMap.get(obj);
        if (id) {
          this._idMap.set(copy, id);
        }
      }
      this._nextId = other._nextId;
    }
  }

  addObject(obj: SoundObject): string {
    const id = this.generateId();
    this._objects.push(obj);
    this._idMap.set(obj, id);
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
    for (const [obj, lid] of this._idMap) {
      if (lid === id) return obj;
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
    const obj = this._objects[index];
    this._objects.splice(index, 1);
    this._idMap.delete(obj);
    return true;
  }

  getEntries(): SoundObjectLibraryEntry[] {
    return this._objects.map((obj, i) => ({
      libraryId: this._idMap.get(obj) ?? `lib_${i}`,
      object: obj,
    }));
  }

  findIdForObject(object: SoundObject): string | null {
    return this._idMap.get(object) ?? null;
  }

  containsObject(object: SoundObject): boolean {
    return this._idMap.has(object);
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
    let legacyIndex = 0;
    const children = data.getElements();
    while (children.hasMoreElements()) {
      const node = children.next();
      if (node.getName() === 'soundObject') {
        const sObj = loadSoundObjectFromXML(node, objRefMap);
        if (sObj) {
          lib._objects.push(sObj);
          const objRefId = node.getAttribute('objRefId');
          if (objRefId) {
            lib._idMap.set(sObj, objRefId);
            if (objRefMap) {
              objRefMap.register(objRefId, sObj);
            }
            const numPart = parseInt(objRefId.replace('lib_', ''), 10);
            if (!isNaN(numPart) && numPart >= lib._nextId) {
              lib._nextId = numPart + 1;
            }
          } else {
            // Legacy files (pre-objRefId): register by insertion index so
            // Instance sound objects that store numeric IDs can still resolve.
            if (objRefMap) {
              objRefMap.register(String(legacyIndex), sObj);
            }
            legacyIndex++;
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
