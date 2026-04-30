/**
 * SoundObjectRegistry — central dispatch for SoundObject XML deserialization.
 * Maps type names (including Java full class names) to their loadFromXML functions.
 * Uses self-registration to avoid circular dependencies.
 */
import { Element } from '../serialization/xml-reader';
import { ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';

type SoundObjectLoader = (data: Element, objRefMap?: ObjRefLoadMap) => SoundObject | null;

const registry = new Map<string, SoundObjectLoader>();

/**
 * Normalize a Java full class name to its short name.
 * E.g., "blue.soundObject.GenericScore" → "GenericScore"
 */
export function normalizeClassName(type: string | null): string {
  if (!type) return '';
  const shortName = type.split('.').pop() || type;
  return shortName;
}

/**
 * Register a SoundObject type for XML deserialization.
 */
export function registerSoundObjectType(typeName: string, loader: SoundObjectLoader): void {
  registry.set(typeName, loader);
}

/**
 * Load a SoundObject from XML by dispatching to the registered loader.
 * Accepts both short names and Java full class names.
 */
export function loadSoundObjectFromXML(data: Element, objRefMap?: ObjRefLoadMap): SoundObject | null {
  const rawType = data.getAttribute('type');
  if (!rawType) return null;

  // Try exact match first, then normalized short name
  const loader = registry.get(rawType) ?? registry.get(normalizeClassName(rawType));
  if (loader) {
    return loader(data, objRefMap);
  }

  console.warn(`Unknown SoundObject type: ${rawType}`);
  return null;
}
