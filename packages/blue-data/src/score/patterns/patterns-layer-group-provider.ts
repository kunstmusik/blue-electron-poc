/**
 * PatternsLayerGroupProvider — factory for PatternsLayerGroup.
 * Mirrors the Java PatternsLayerGroupProvider class.
 */
import { PatternsLayerGroup } from './patterns-layer-group';
import { LayerGroupProvider } from '../../score/layers/layer-group-provider';
import { LayerGroup } from '../../score/layers/layer-group';
import { Layer } from '../../score/layers/layer';
import { Element } from '../../serialization/xml-reader';
import { ObjRefLoadMap } from '../../serialization/obj-ref-map';

export class PatternsLayerGroupProvider implements LayerGroupProvider {
  getLayerGroupName(): string {
    return 'Patterns';
  }

  createLayerGroup(): LayerGroup<Layer> {
    const group = new PatternsLayerGroup();
    group.newLayerAt(0);
    return group;
  }

  loadFromXML(
    element: Element,
    _objRefMap: ObjRefLoadMap,
  ): LayerGroup<Layer> | null {
    if (element.getName() === 'patternsLayerGroup') {
      return PatternsLayerGroup.loadFromXML(element);
    }
    return null;
  }
}
