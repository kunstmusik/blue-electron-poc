/**
 * LayerGroupProvider — factory for creating and loading LayerGroups.
 * Mirrors the Java LayerGroupProvider interface.
 *
 * Each type of LayerGroup (audio, patterns, poly) has a corresponding provider
 * registered with the LayerGroupProviderManager.
 */
import { LayerGroup } from './layer-group';
import { Layer } from './layer';
import { Element } from '../../serialization/xml-reader';
import { ObjRefLoadMap } from '../../serialization/obj-ref-map';

export interface LayerGroupProvider {
  /** Get the display name for this layer group type. */
  getLayerGroupName(): string;

  /** Create a new default layer group. */
  createLayerGroup(): LayerGroup<Layer>;

  /**
   * Load a layer group from XML.
   * Returns null if the XML element doesn't match this provider's type.
   */
  loadFromXML(
    element: Element,
    objRefMap: ObjRefLoadMap,
  ): LayerGroup<Layer> | null;
}
