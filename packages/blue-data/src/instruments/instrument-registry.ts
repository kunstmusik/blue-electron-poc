/**
 * InstrumentTypeRegistry — dispatches XML loading by instrument type attribute.
 * Mirrors the Java instrument type dispatch pattern.
 *
 * Each instrument type (e.g., "blue.orchestra.BlueSynthBuilder") maps
 * to a loader function that returns an Instrument instance.
 */
import { Element } from "../serialization/xml-reader";
import { Instrument } from "./instrument";
import { BlueSynthBuilder } from "./blue-synth-builder";

/** Type for instrument loader functions */
export type InstrumentLoader = (data: Element) => Instrument | null;

const registry = new Map<string, InstrumentLoader>();

export function registerInstrumentType(
  type: string,
  loader: InstrumentLoader,
): void {
  registry.set(type, loader);
}

export function loadInstrumentFromXML(data: Element): Instrument | null {
  const type = data.getAttribute("type");
  if (!type) return null;

  const loader = registry.get(type);
  if (!loader) {
    console.warn(`Unknown instrument type: ${type}`);
    return null;
  }

  return loader(data);
}

/**
 * Initialize the instrument type registry.
 * Called once when this module is first imported.
 */
function init(): void {
  registerInstrumentType("blue.orchestra.BlueSynthBuilder", (data: Element) => {
    return BlueSynthBuilder.loadFromXML(data);
  });
}

// Run initialization
init();
