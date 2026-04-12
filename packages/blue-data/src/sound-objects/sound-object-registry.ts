/**
 * SoundObjectRegistry — central dispatch for SoundObject XML deserialization.
 * Maps type names to their loadFromXML functions.
 * Uses lazy initialization to handle circular dependencies.
 */
import { Element } from '../serialization/xml-reader';
import { ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';

type SoundObjectLoader = (data: Element, objRefMap?: ObjRefLoadMap) => SoundObject | null;

const registry = new Map<string, SoundObjectLoader>();
let initPromise: Promise<void> | null = null;

/**
 * Register a SoundObject type for XML deserialization.
 */
export function registerSoundObjectType(typeName: string, loader: SoundObjectLoader): void {
  registry.set(typeName, loader);
}

/**
 * Lazy initialization: load all built-in types on first call.
 */
async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const [{ GenericScore }, { PolyObject }, { PythonObject }, { JavaScriptObject }, { CSDSoundObject }, { Comment }] = await Promise.all([
      import('./generic-score'),
      import('./poly-object'),
      import('./python-object'),
      import('./javascript-object'),
      import('./csd-sound-object'),
      import('./comment'),
    ]);

    registerSoundObjectType('GenericScore', GenericScore.loadFromXML);
    registerSoundObjectType('PolyObject', PolyObject.loadFromXML);
    registerSoundObjectType('PythonObject', PythonObject.loadFromXML);
    registerSoundObjectType('JavaScriptObject', JavaScriptObject.loadFromXML);
    registerSoundObjectType('CSDSoundObject', CSDSoundObject.loadFromXML);
    registerSoundObjectType('Comment', Comment.loadFromXML);
  })();
  return initPromise;
}

/**
 * Load a SoundObject from XML. Initializes registry on first call.
 * Returns null for unknown types.
 */
export async function loadSoundObjectFromXML(data: Element, objRefMap?: ObjRefLoadMap): Promise<SoundObject | null> {
  await ensureInitialized();
  const type = data.getAttribute('type');
  if (!type) return null;

  const loader = registry.get(type);
  if (loader) {
    return loader(data, objRefMap);
  }

  console.warn(`Unknown SoundObject type: ${type}`);
  return null;
}

/**
 * Synchronous version — requires initSoundObjectRegistry() to be called first.
 */
export function loadSoundObjectFromXMLSync(data: Element, objRefMap?: ObjRefLoadMap): SoundObject | null {
  const type = data.getAttribute('type');
  if (!type) return null;

  const loader = registry.get(type);
  if (loader) {
    return loader(data, objRefMap);
  }

  console.warn(`Unknown SoundObject type: ${type}`);
  return null;
}

/**
 * Synchronously initialize all built-in SoundObject types.
 * Must be called before using loadSoundObjectFromXMLSync().
 */
export function initSoundObjectRegistry(): void {
  if (registry.size > 0) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = (p: string) => require(p);
  const gs = mod('./generic-score') as { GenericScore: { loadFromXML: SoundObjectLoader } };
  registerSoundObjectType('GenericScore', gs.GenericScore.loadFromXML);

  const po = mod('./poly-object') as { PolyObject: { loadFromXML: SoundObjectLoader } };
  registerSoundObjectType('PolyObject', po.PolyObject.loadFromXML);

  const py = mod('./python-object') as { PythonObject: { loadFromXML: SoundObjectLoader } };
  registerSoundObjectType('PythonObject', py.PythonObject.loadFromXML);

  const js = mod('./javascript-object') as { JavaScriptObject: { loadFromXML: SoundObjectLoader } };
  registerSoundObjectType('JavaScriptObject', js.JavaScriptObject.loadFromXML);

  const csd = mod('./csd-sound-object') as { CSDSoundObject: { loadFromXML: SoundObjectLoader } };
  registerSoundObjectType('CSDSoundObject', csd.CSDSoundObject.loadFromXML);

  const cm = mod('./comment') as { Comment: { loadFromXML: SoundObjectLoader } };
  registerSoundObjectType('Comment', cm.Comment.loadFromXML);
}
