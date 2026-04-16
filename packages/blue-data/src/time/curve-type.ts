/**
 * CurveType — how tempo changes between points.
 * Mirrors the Java CurveType enum.
 */
export enum CurveType {
  /** Jump to new tempo at the next point (no interpolation). */
  CONSTANT = 'CONSTANT',
  /** Linear interpolation between this point and the next. */
  LINEAR = 'LINEAR',
}

/**
 * Parse a curve type string, defaulting to LINEAR for unknown values
 * (matching Java's fromString behavior).
 */
export function parseCurveType(value: string | null): CurveType {
  if (value === 'CONSTANT') return CurveType.CONSTANT;
  return CurveType.LINEAR;
}
