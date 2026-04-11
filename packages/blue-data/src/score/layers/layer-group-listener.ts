/**
 * LayerGroupListener — listens for changes to a LayerGroup.
 * Mirrors the Java LayerGroupListener interface.
 */
import { LayerGroupDataEvent } from './layer-group-data-event';

export interface LayerGroupListener {
  layerGroupChanged(event: LayerGroupDataEvent): void;
}
