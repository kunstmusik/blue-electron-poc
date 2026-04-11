/**
 * CopyBuffer — static clipboard buffer for copy/paste operations.
 * Mirrors the Java CopyBuffer class.
 *
 * Holds a single clipboard entry at a time. In the full app, this would
 * be used for copy/paste of score objects, instruments, etc.
 */
import { BlueDataObject } from './blue-data-object';

let clipboard: BlueDataObject | null = null;

/**
 * Store an object in the clipboard.
 */
export function setCopy(obj: BlueDataObject): void {
  clipboard = obj;
}

/**
 * Retrieve and deep-copy the clipboard contents.
 * Returns null if clipboard is empty.
 */
export function getCopy(): BlueDataObject | null {
  return clipboard?.deepCopy() ?? null;
}

/**
 * Check if the clipboard has content.
 */
export function hasContent(): boolean {
  return clipboard !== null;
}

/**
 * Clear the clipboard.
 */
export function clear(): void {
  clipboard = null;
}
