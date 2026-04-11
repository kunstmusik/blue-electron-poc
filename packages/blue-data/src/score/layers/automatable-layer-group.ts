/**
 * AutomatableLayerGroup — a LayerGroup with automation support.
 * Mirrors the Java AutomatableLayerGroup interface.
 */
import { LayerGroup } from './layer-group';
import { Layer } from './layer';

export interface AutomatableLayerGroup extends LayerGroup<Layer> {}
