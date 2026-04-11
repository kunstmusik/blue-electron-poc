/**
 * LayerGroupProviderManager — manages the registry of LayerGroupProviders.
 * Mirrors the Java LayerGroupProviderManager class.
 *
 * During XML loading, the manager iterates through registered providers to find
 * one that can handle the XML element.
 */
import { LayerGroupProvider } from './layer-group-provider';
import { LayerGroup } from './layer-group';
import { Layer } from './layer';
import { Element } from '../../serialization/xml-reader';

import { ObjRefLoadMap } from '../../serialization/obj-ref-map';

export class LayerGroupProviderManager extends Array<LayerGroupProvider> {
  private static instance: LayerGroupProviderManager | null = null;

  constructor() {
    super();
    // No built-in providers — registered by modules (audio, patterns, poly)
  }

  static getInstance(): LayerGroupProviderManager {
    if (!LayerGroupProviderManager.instance) {
      LayerGroupProviderManager.instance = new LayerGroupProviderManager();
    }
    return LayerGroupProviderManager.instance;
  }

  /**
   * Update the provider list with external providers.
   * Always keeps the built-in PolyObject provider.
   */
  updateProviders(providers: LayerGroupProvider[]): void {
    this.length = 0;
    this.push(...providers);
  }

  /**
   * Load a LayerGroup from XML by trying each registered provider.
   */
  loadFromXML(
    node: Element,
    objRefMap: ObjRefLoadMap,
  ): LayerGroup<Layer> | null {
    for (const provider of this) {
      const result = provider.loadFromXML(node, objRefMap);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }
}
