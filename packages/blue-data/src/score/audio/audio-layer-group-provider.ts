/**
 * AudioLayerGroupProvider — factory for AudioLayerGroup.
 * Mirrors the Java AudioLayerGroupProvider class.
 */
import { AudioLayerGroup } from './audio-layer-group';
import { LayerGroupProvider } from '../../score/layers/layer-group-provider';
import { LayerGroup } from '../../score/layers/layer-group';
import { Layer } from '../../score/layers/layer';
import { Element } from '../../serialization/xml-reader';
import { ObjRefLoadMap } from '../../serialization/obj-ref-map';

export class AudioLayerGroupProvider implements LayerGroupProvider {
  getLayerGroupName(): string {
    return 'Audio';
  }

  createLayerGroup(): LayerGroup<Layer> {
    const group = new AudioLayerGroup();
    group.newLayerAt(0);
    return group;
  }

  loadFromXML(
    element: Element,
    objRefMap: ObjRefLoadMap,
  ): LayerGroup<Layer> | null {
    if (element.getName() === 'audioLayerGroup') {
      return AudioLayerGroup.loadFromXML(element);
    }
    return null;
  }
}
