/**
 * Text utilities — string utility functions.
 * Mirrors the Java TextUtilities class.
 */

/**
 * Replace all occurrences of a search string with a replacement string.
 * Simpler and more reliable than regex for literal string replacement.
 */
export function replaceAll(input: string, search: string, replacement: string): string {
  return input.split(search).join(replacement);
}

/**
 * Strip a single-line comment from a string.
 * Removes everything from // or ; to end of line.
 */
export function stripSingleLineComments(line: string): string {
  const doubleSlashIdx = line.indexOf('//');
  const semicolonIdx = line.indexOf(';');

  let idx = -1;
  if (doubleSlashIdx !== -1) {
    idx = doubleSlashIdx;
  }
  if (semicolonIdx !== -1 && (idx === -1 || semicolonIdx < idx)) {
    idx = semicolonIdx;
  }

  if (idx === -1) return line;
  return line.substring(0, idx);
}

/**
 * Strip block comments from a string.
 * Removes /* ... * / blocks.
 */
export function stripBlockComments(input: string): string {
  let result = '';
  let inBlock = false;
  let i = 0;

  while (i < input.length) {
    if (!inBlock && input[i] === '/' && input[i + 1] === '*') {
      inBlock = true;
      i += 2;
      continue;
    }
    if (inBlock && input[i] === '*' && input[i + 1] === '/') {
      inBlock = false;
      i += 2;
      continue;
    }
    if (!inBlock) {
      result += input[i];
    }
    i++;
  }

  return result;
}
