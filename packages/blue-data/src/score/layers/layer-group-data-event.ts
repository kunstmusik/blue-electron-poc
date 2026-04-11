/**
 * LayerGroupDataEvent — events fired when layer group data changes.
 * Mirrors the Java LayerGroupDataEvent class.
 */
import { Layer } from './layer';

export enum LayerGroupDataEventType {
  DATA_ADDED = 'DATA_ADDED',
  DATA_REMOVED = 'DATA_REMOVED',
  DATA_CHANGED = 'DATA_CHANGED',
}

export class LayerGroupDataEvent {
  readonly source: unknown;
  readonly type: LayerGroupDataEventType;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly layers?: Layer[];

  constructor(
    source: unknown,
    type: LayerGroupDataEventType,
    startIndex: number,
    endIndex: number,
    layers?: Layer[],
  ) {
    this.source = source;
    this.type = type;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.layers = layers;
  }
}
