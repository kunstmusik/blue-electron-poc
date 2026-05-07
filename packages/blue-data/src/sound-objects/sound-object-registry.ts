/**
 * SoundObjectRegistry — central dispatch for SoundObject XML deserialization.
 * Maps type names (including Java full class names) to their loadFromXML functions.
 * Uses self-registration to avoid circular dependencies.
 */
import { Element } from '../serialization/xml-reader';
import { ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';

type SoundObjectLoader = (data: Element, objRefMap?: ObjRefLoadMap) => SoundObject | null;
type SoundObjectFactory = () => SoundObject;

const registry = new Map<string, SoundObjectLoader>();
const factories = new Map<string, SoundObjectFactory>();

export function normalizeClassName(type: string | null): string {
  if (!type) return '';
  const shortName = type.split('.').pop() || type;
  return shortName;
}

export function registerSoundObjectType(typeName: string, loader: SoundObjectLoader): void {
  registry.set(typeName, loader);
}

export function registerSoundObjectFactory(typeName: string, factory: SoundObjectFactory): void {
  factories.set(typeName, factory);
}

export function createSoundObject(typeName: string): SoundObject | null {
  const factory = factories.get(typeName) ?? factories.get(normalizeClassName(typeName));
  return factory ? factory() : null;
}

export function loadSoundObjectFromXML(data: Element, objRefMap?: ObjRefLoadMap): SoundObject | null {
  const rawType = data.getAttribute('type');
  if (!rawType) return null;

  const loader = registry.get(rawType) ?? registry.get(normalizeClassName(rawType));
  if (loader) {
    return loader(data, objRefMap);
  }

  console.warn(`Unknown SoundObject type: ${rawType}`);
  return null;
}
