/**
 * SoundObjectLibrary — library of reusable sound objects.
 * Mirrors the Java SoundObjectLibrary class.
 *
 * For Phase 3, this is a simple stub — stores sound objects by name.
 */
import { SoundObject } from './sound-object';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';

export class SoundObjectLibrary {
  private objects = new Map<string, SoundObject>();

  addObject(name: string, obj: SoundObject): void {
    this.objects.set(name, obj);
  }

  getObject(name: string): SoundObject | undefined {
    return this.objects.get(name);
  }

  getAllObjects(): SoundObject[] {
    return Array.from(this.objects.values());
  }

  // ─── XML ───

  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObjectLibrary');
    for (const [name, obj] of this.objects) {
      const sObjElem = obj.saveAsXML(_objRefMap);
      sObjElem.setAttribute('name', name);
      elem.addElement(sObjElem);
    }
    return elem;
  }

  static loadFromXML(_data: Element, _objRefMap?: ObjRefLoadMap): SoundObjectLibrary {
    const lib = new SoundObjectLibrary();
    // For Phase 3: stub — full loading when sound object types are implemented
    return lib;
  }
}
