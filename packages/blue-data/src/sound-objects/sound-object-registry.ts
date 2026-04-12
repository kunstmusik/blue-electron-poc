/**
 * SoundObjectRegistry — central dispatch for SoundObject XML deserialization.
 * Maps type names to their loadFromXML functions.
 */
import { Element } from '../serialization/xml-reader';
import { ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { GenericScore } from './generic-score';
import { PolyObject } from './poly-object';
import { PythonObject } from './python-object';
import { JavaScriptObject } from './javascript-object';
import { CSDSoundObject } from './csd-sound-object';
import { Comment } from './comment';
import { AudioFile } from './audio-file';
import { Sound } from './sound';
import { External } from './external';
import { Instance } from './instance';
import { LineObject } from './line-object';
import { ZakLineObject } from './zak-line-object';
import { PatternObject } from './pattern-object';
import { PianoRoll } from './piano-roll';
import { JMask } from './j-mask';
import { TrackerObject } from './tracker-object';
import { NotationObject } from './notation-object';
import { FrozenSoundObject } from './frozen-sound-object';

type SoundObjectLoader = (data: Element, objRefMap?: ObjRefLoadMap) => SoundObject | null;

const registry = new Map<string, SoundObjectLoader>();

/**
 * Register a SoundObject type for XML deserialization.
 */
export function registerSoundObjectType(typeName: string, loader: SoundObjectLoader): void {
  registry.set(typeName, loader);
}

/**
 * Load a SoundObject from XML by dispatching to the registered loader.
 */
export function loadSoundObjectFromXML(data: Element, objRefMap?: ObjRefLoadMap): SoundObject | null {
  const type = data.getAttribute('type');
  if (!type) return null;

  const loader = registry.get(type);
  if (loader) {
    return loader(data, objRefMap);
  }

  console.warn(`Unknown SoundObject type: ${type}`);
  return null;
}

// Register all built-in SoundObject types at module load time
registerSoundObjectType('GenericScore', GenericScore.loadFromXML);
registerSoundObjectType('PolyObject', PolyObject.loadFromXML);
registerSoundObjectType('PythonObject', PythonObject.loadFromXML);
registerSoundObjectType('JavaScriptObject', JavaScriptObject.loadFromXML);
registerSoundObjectType('CSDSoundObject', CSDSoundObject.loadFromXML);
registerSoundObjectType('Comment', Comment.loadFromXML);
registerSoundObjectType('AudioFile', AudioFile.loadFromXML);
registerSoundObjectType('Sound', Sound.loadFromXML);
registerSoundObjectType('External', External.loadFromXML);
registerSoundObjectType('Instance', Instance.loadFromXML);
registerSoundObjectType('LineObject', LineObject.loadFromXML);
registerSoundObjectType('ZakLineObject', ZakLineObject.loadFromXML);
registerSoundObjectType('PatternObject', PatternObject.loadFromXML);
registerSoundObjectType('PianoRoll', PianoRoll.loadFromXML);
registerSoundObjectType('JMask', JMask.loadFromXML);
registerSoundObjectType('TrackerObject', TrackerObject.loadFromXML);
registerSoundObjectType('NotationObject', NotationObject.loadFromXML);
registerSoundObjectType('FrozenSoundObject', FrozenSoundObject.loadFromXML);
