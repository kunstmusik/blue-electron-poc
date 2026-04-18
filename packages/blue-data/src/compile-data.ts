/**
 * CompileData — compilation context for CSD generation.
 * Mirrors the Java CompileData class.
 *
 * Holds accumulated orchestra code, score events, global orc/sco, F-tables,
 * and channel/mixer assignments during CSD generation.
 */
import { Instrument } from './instruments/instrument';

export class CompileData {
  /** Orchestra code accumulator. */
  private orchestraBuffer = '';

  /** Score events accumulator. */
  private scoreBuffer = '';

  /** Global orc accumulator. */
  private globalOrcBuffer = '';

  /** Global sco accumulator. */
  private globalScoBuffer = '';

  /** F-tables accumulator. */
  private fTablesBuffer = '';

  /** Instrument ID assignments during compilation. */
  private instrumentIdMap = new Map<Instrument, number>();

  /** Channel ID assignments for mixer routing. */
  private channelIdAssignments = new Map<unknown, number>();

  /** Compilation variables (used for caching during CSD gen). */
  private compilationVariables = new Map<string, unknown>();

  // ─── Orchestra code ───

  appendOrchestra(code: string): void {
    this.orchestraBuffer += code + '\n';
  }

  getOrchestra(): string {
    return this.orchestraBuffer;
  }

  // ─── Score events ───

  appendScore(score: string): void {
    this.scoreBuffer += score + '\n';
  }

  getScore(): string {
    return this.scoreBuffer;
  }

  // ─── Global orc/sco ───

  appendGlobalOrc(code: string): void {
    this.globalOrcBuffer += code + '\n';
  }

  getGlobalOrc(): string {
    return this.globalOrcBuffer;
  }

  appendGlobalSco(sco: string): void {
    this.globalScoBuffer += sco + '\n';
  }

  getGlobalSco(): string {
    return this.globalScoBuffer;
  }

  // ─── F-Tables ───

  appendFTables(tables: string): void {
    this.fTablesBuffer += tables + '\n';
  }

  getFTables(): string {
    return this.fTablesBuffer;
  }

  // ─── Instrument ID management ───

  /**
   * Add an instrument and return its assigned ID.
   */
  addInstrument(instr: Instrument): number {
    const id = this.instrumentIdMap.size + 1;
    this.instrumentIdMap.set(instr, id);
    return id;
  }

  /**
   * Get the assigned ID for an instrument.
   */
  getInstrumentId(instr: Instrument): number | undefined {
    return this.instrumentIdMap.get(instr);
  }

  /**
   * Get the instrument that was the source of a generated instrument.
   */
  getInstrSourceId(_instr: Instrument): string | undefined {
    return undefined; // For Phase 2, not used
  }

  /**
   * Add an instrument source ID mapping.
   */
  addInstrSourceId(_generated: Instrument, _sourceId: string): void {
    // For Phase 2, not used
  }

  // ─── Channel assignments ───

  getChannelIdAssignments(): Map<unknown, number> {
    return this.channelIdAssignments;
  }

  // ─── Compilation variables ───

  getCompilationVariable(name: string): unknown {
    return this.compilationVariables.get(name);
  }

  setCompilationVariable(name: string, value: unknown): void {
    this.compilationVariables.set(name, value);
  }

  clearCompilationVariable(name: string): void {
    this.compilationVariables.delete(name);
  }

  // ─── Reset ───

  reset(): void {
    this.orchestraBuffer = '';
    this.scoreBuffer = '';
    this.globalOrcBuffer = '';
    this.globalScoBuffer = '';
    this.fTablesBuffer = '';
    this.instrumentIdMap.clear();
    this.channelIdAssignments.clear();
    this.compilationVariables.clear();
  }

  // ─── Generate complete CSD ───

  /**
   * Assemble all parts into a complete CSD string.
   * Adds an `f 0 <duration>` sustain event at the end of the score
   * so Csound renders audio for the full duration.
   */
  toCSD(options?: {
    commandLine?: string;
    header?: string;
  }): string {
    const header = options?.header ?? '<CsoundSynthesizer>\n<CsOptions>\n';
    const commandLine = options?.commandLine ?? '';
    const footer = '</CsOptions>\n<CsInstruments>\n';
    const instrFooter = '\n</CsInstruments>\n<CsScore>\n';
    const scoreFooter = '\n</CsScore>\n</CsoundSynthesizer>\n';

    // Calculate score duration for sustain event
    let maxTime = 1;
    if (this.scoreBuffer.trim()) {
      const lines = this.scoreBuffer.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const start = parseFloat(parts[1]);
          const dur = parseFloat(parts[2]);
          if (!isNaN(start) && !isNaN(dur)) {
            const end = start + dur;
            if (end > maxTime) maxTime = end;
          }
        }
      }
    }

    // Add sustain event so Csound knows how long to run
    const sustainEvent = `f 0 ${maxTime + 1}`;

    return (
      header +
      commandLine +
      '\n' +
      footer +
      this.globalOrcBuffer +
      this.orchestraBuffer +
      instrFooter +
      this.globalScoBuffer +
      this.scoreBuffer +
      sustainEvent +
      scoreFooter
    );
  }
}
