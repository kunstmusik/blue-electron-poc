/**
 * XML utilities — helper functions for reading/writing common XML patterns.
 * Mirrors the Java XMLUtilities class.
 */
import { Element } from '../serialization/xml-reader';

/**
 * Write an integer value as a named XML element.
 * Creates: <name>value</name>
 */
export function writeInt(name: string, value: number): Element {
  const elem = new Element(name);
  elem.setText(value.toString());
  return elem;
}

/**
 * Read an integer value from a named XML element.
 */
export function readInt(elem: Element): number {
  return parseInt(elem.getTextString(), 10);
}

/**
 * Write a double value as a named XML element.
 * Creates: <name>value</name>
 */
export function writeDouble(name: string, value: number): Element {
  const elem = new Element(name);
  if (!Number.isFinite(value)) {
    elem.setText(value.toString());
    return elem;
  }
  const text = value.toString();
  elem.setText(text.includes('.') || text.includes('e') || text.includes('E') ? text : text + '.0');
  return elem;
}

/**
 * Read a double value from a named XML element.
 */
export function readDouble(elem: Element): number {
  return parseFloat(elem.getTextString());
}

/**
 * Write a boolean value as a named XML element.
 * Creates: <name>true|false</name>
 */
export function writeBoolean(name: string, value: boolean): Element {
  const elem = new Element(name);
  elem.setText(value.toString());
  return elem;
}

/**
 * Read a boolean value from a named XML element.
 */
export function readBoolean(elem: Element): boolean {
  const text = elem.getTextString();
  return text.toLowerCase() === 'true';
}
