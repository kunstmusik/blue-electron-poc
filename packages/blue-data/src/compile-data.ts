import { Instrument } from './instruments/instrument';
import { Arrangement } from './arrangement';
import { Tables } from './tables';
import { Channel } from './mixer/channel';
import { Parameter } from './automation/parameter';

interface StringChannelEntry {
  objectName: string;
  value: string;
  channelName: string;
}

export class CompileData {
  private arrangement: Arrangement;
  private tables: Tables;
  private channelIdAssignments = new Map<Channel, number>();
  private instrSourceId = new Map<Instrument, string>();
  private compileMap = new Map<unknown, unknown>();
  private globalOrc = '';
  private stringChannels: StringChannelEntry[] = [];
  private originalParameters: Parameter[] = [];
  private handleParametersAndChannels = false;
  private _parameterNameMap = new Map<string, number>();
  private _stringChannelNameMap = new Map<string, number>();

  constructor();
  constructor(arrangement: Arrangement, tables: Tables, handleParameters?: boolean);
  constructor(arrangement?: Arrangement, tables?: Tables, handleParameters?: boolean) {
    this.arrangement = arrangement ?? new Arrangement();
    this.tables = tables ?? new Tables();
    this.handleParametersAndChannels = handleParameters ?? false;
  }

  static createEmptyCompileData(): CompileData {
    return new CompileData(new Arrangement(), new Tables(), false);
  }

  getArrangement(): Arrangement {
    return this.arrangement;
  }

  getTables(): Tables {
    return this.tables;
  }

  getChannelIdAssignments(): Map<Channel, number> {
    return this.channelIdAssignments;
  }

  addInstrument(instr: Instrument): number {
    const instrId = this.arrangement.addInstrumentAtEnd(instr);
    if (this.handleParametersAndChannels) {
      this.collectStringChannels(instr);
      this.collectParameters(instr);
    }
    return instrId;
  }

  private collectStringChannels(instr: Instrument): void {
    const anyInstr = instr as any;
    if (typeof anyInstr.getStringChannels === 'function') {
      const channels = anyInstr.getStringChannels() as StringChannelEntry[];
      if (channels) {
        for (const sc of channels) {
          const base = sc.objectName || sc.channelName;
          const count = this._stringChannelNameMap.get(base) ?? 0;
          this._stringChannelNameMap.set(base, count + 1);
          const name = count === 0 ? base : `${base}_${count}`;
          this.stringChannels.push({
            objectName: sc.objectName,
            value: sc.value,
            channelName: name,
          });
        }
      }
    }
  }

  private collectParameters(instr: Instrument): void {
    const anyInstr = instr as any;
    if (typeof anyInstr.getParameters === 'function') {
      const params = anyInstr.getParameters() as Parameter[];
      if (params) {
        for (const p of params) {
          this.originalParameters.push(p);
        }
      }
    }
  }

  getStringChannels(): StringChannelEntry[] {
    return this.stringChannels;
  }

  getOriginalParameters(): Parameter[] {
    return this.originalParameters;
  }

  isHandleParametersAndChannels(): boolean {
    return this.handleParametersAndChannels;
  }

  setHandleParametersAndChannels(handleParametersAndChannels: boolean): void {
    this.handleParametersAndChannels = handleParametersAndChannels;
  }

  getCompilationVariable(key: unknown): unknown {
    return this.compileMap.get(key);
  }

  setCompilationVariable(key: unknown, value: unknown): void {
    this.compileMap.set(key, value);
  }

  clearCompilationVariable(key: unknown): void {
    this.compileMap.delete(key);
  }

  getOpenFTableNumber(): number {
    return this.tables.getOpenFTableNumber();
  }

  appendTables(text: string): void {
    const current = this.tables.getTables();
    this.tables.setTables(current ? current + '\n' + text : text);
  }

  addInstrSourceId(generated: Instrument, sourceId: string): void {
    this.instrSourceId.set(generated, sourceId);
  }

  getInstrSourceId(instr: Instrument): string | undefined {
    return this.instrSourceId.get(instr);
  }

  appendGlobalOrc(code: string): void {
    if (!code) {
      return;
    }
    this.globalOrc += code;
    if (!code.endsWith('\n')) {
      this.globalOrc += '\n';
    }
  }

  getGlobalOrc(): string {
    return this.globalOrc;
  }

  reset(): void {
    this.arrangement = new Arrangement();
    this.tables = new Tables();
    this.channelIdAssignments.clear();
    this.instrSourceId.clear();
    this.compileMap.clear();
    this.globalOrc = '';
    this.stringChannels = [];
    this.originalParameters = [];
    this._parameterNameMap.clear();
    this._stringChannelNameMap.clear();
  }
}
