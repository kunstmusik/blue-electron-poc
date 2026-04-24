/**
 * Instrument — abstract base for Csound instruments.
 * Mirrors the Java Instrument class.
 */
import { DeepCopyable } from '../deep-copyable';
import { Element } from '../serialization/xml-reader';

export abstract class Instrument implements DeepCopyable<Instrument> {
  protected _name = '';
  protected _enabled = true;
  protected _comment = '';

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  getComment(): string {
    return this._comment;
  }

  setComment(comment: string): void {
    this._comment = comment ?? '';
  }

  /** Generate global orchestra code (common to all instances). */
  generateGlobalOrc(): string | null {
    return null;
  }

  /** Generate global score code. */
  generateGlobalSco(): string | null {
    return null;
  }

  /** Generate the instrument's orchestra code. */
  abstract generateInstrument(): string;

  /** Generate always-on instrument code (if needed). */
  generateAlwaysOnInstrument(): string | null {
    return null;
  }

  /** Generate user-defined opcodes. */
  generateUserDefinedOpcodes(_udoList: unknown): void {
    // Default: no-op
  }

  /** Generate F-tables. */
  generateFTables(_tables: unknown): void {
    // Default: no-op
  }

  abstract deepCopy(): Instrument;

  abstract saveAsXML(): Element;
}
