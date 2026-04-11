/**
 * ScoreObjectLayerGroup — a LayerGroup that contains layers of ScoreObjects.
 * Mirrors the Java ScoreObjectLayerGroup<T> interface.
 */
import { LayerGroup } from './layer-group';
import { Layer } from './layer';
import { ScoreObject } from '../score-object';

export interface ScoreObjectLayerGroup<T extends Layer> extends LayerGroup<T> {}
