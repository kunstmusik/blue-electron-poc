/**
 * SoundObjectRegistry — static dispatch for SoundObject XML deserialization.
 * Maps type names to their loadFromXML functions via direct imports.
 *
 * No dynamic imports, no require(). All types are statically imported
 * and registered at module load time.
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

// Register all built-in types at module load time
registerSoundObjectType('GenericScore', GenericScore.loadFromXML);
registerSoundObjectType('PolyObject', PolyObject.loadFromXML);
registerSoundObjectType('PythonObject', PythonObject.loadFromXML);
registerSoundObjectType('JavaScriptObject', JavaScriptObject.loadFromXML);
registerSoundObjectType('CSDSoundObject', CSDSoundObject.loadFromXML);
registerSoundObjectType('Comment', Comment.loadFromXML);
