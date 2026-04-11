/**
 * PolyObjectLayerGroupProvider — factory for PolyObject layer groups.
 * Mirrors the Java PolyObjectLayerGroupProvider class.
 */
import { LayerGroupProvider } from '../score/layers/layer-group-provider';
import { LayerGroup } from '../score/layers/layer-group';
import { Layer } from '../score/layers/layer';
import { Element } from '../serialization/xml-reader';
import { PolyObject } from './poly-object';

export class PolyObjectLayerGroupProvider implements LayerGroupProvider {
  getLayerGroupName(): string {
    return 'SoundObject Layer Group';
  }

  createLayerGroup(): LayerGroup<Layer> {
    const pObj = new PolyObject(true);
    return pObj;
  }

  loadFromXML(
    element: Element,
    objRefMap: ObjRefLoadMap,
  ): LayerGroup<Layer> | null {
    if (element.getName() === 'polyObject' || element.getName() === 'soundObject') {
      // Check if this is actually a PolyObject
      const typeAttr = element.getAttribute('type');
      if (typeAttr === 'PolyObject' || element.getName() === 'polyObject' || element.hasElement('soundLayer')) {
        return PolyObject.loadFromXML(element, objRefMap);
      }
    }
    return null;
  }
}

import { ObjRefLoadMap } from '../serialization/obj-ref-map';
