/**
 * AudioLayerListener — listens for AudioClip add/remove events.
 * Mirrors the Java AudioLayerListener interface.
 */
import { AudioLayer } from './audio-layer';
import { AudioClip } from './audio-clip';

export interface AudioLayerListener {
  audioClipAdded(layer: AudioLayer, clip: AudioClip): void;
  audioClipRemoved(layer: AudioLayer, clip: AudioClip): void;
}
