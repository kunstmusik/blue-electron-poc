/**
 * ScoreObjectLayer — a Layer that contains ScoreObjects.
 * Mirrors the Java ScoreObjectLayer<T> interface.
 *
 * This extends Layer and Array<T> where T extends ScoreObject, allowing
 * layers to be both layers and lists of their contained objects.
 */
import { Layer } from './layer';
import { ScoreObject } from '../score-object';

export interface ScoreObjectLayer<T extends ScoreObject> extends Layer, Array<T> {}
