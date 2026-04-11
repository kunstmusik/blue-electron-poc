/**
 * InstrumentAssignment — maps an instrument to an arrangement ID.
 * Mirrors the Java InstrumentAssignment class.
 */
import { Instrument } from './instrument';

export class InstrumentAssignment {
  arrangementId = '0';
  instr!: Instrument;
  enabled = true;

  constructor(other?: InstrumentAssignment) {
    if (other) {
      this.arrangementId = other.arrangementId;
      this.enabled = other.enabled;
      // Instrument reference is shared, not deep-copied
      this.instr = other.instr;
    }
  }

  compareTo(other: InstrumentAssignment): number {
    // Compare arrangement IDs numerically if possible
    const a = parseInt(this.arrangementId, 10);
    const b = parseInt(other.arrangementId, 10);
    if (!isNaN(a) && !isNaN(b)) {
      return a - b;
    }
    return this.arrangementId.localeCompare(other.arrangementId);
  }
}
