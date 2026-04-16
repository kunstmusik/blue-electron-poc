/**
 * UDOStyle — enum for Csound User Defined Opcode declaration style.
 * Mirrors the Java UDOStyle enum.
 *
 * CLASSIC: traditional `opcode name,outTypes,inTypes` syntax
 * MODERN: newer `opcode name(args):outTypes` syntax
 */
export enum UDOStyle {
  CLASSIC = 'CLASSIC',
  MODERN = 'MODERN',
}
