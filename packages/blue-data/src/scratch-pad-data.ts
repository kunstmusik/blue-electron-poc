/**
 * ScratchPadData — holds scratch pad data.
 * Mirrors the Java ScratchPadData class.
 *
 * For Phase 3: stub — preserves XML on load/save.
 */
import { Element } from './serialization/xml-reader';
import { BlueDataObject } from './blue-data-object';

export class ScratchPadData implements BlueDataObject {
  saveAsXML(): Element {
    return new Element('scratchPadData');
  }

  static loadFromXML(_data: Element): ScratchPadData {
    return new ScratchPadData();
  }

  deepCopy(): BlueDataObject {
    return new ScratchPadData();
  }
}
