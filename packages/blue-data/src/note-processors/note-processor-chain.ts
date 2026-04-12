/**
 * NoteProcessorChain — ordered chain of note processors applied to a NoteList.
 * Mirrors the Java NoteProcessorChain class.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';
import { AddProcessor } from './add-processor';
import { MultiplyProcessor } from './multiply-processor';
import { Code } from './code';
import { RandomAddProcessor } from './random-add-processor';
import { RandomMultiplyProcessor } from './random-multiply-processor';
import { LineAddProcessor } from './line-add-processor';
import { LineMultiplyProcessor } from './line-multiply-processor';
import { PchAddProcessor } from './pch-add-processor';
import { PchInversionProcessor } from './pch-inversion-processor';
import { InversionProcessor } from './inversion-processor';
import { RetrogradeProcessor } from './retrograde-processor';
import { RotateProcessor } from './rotate-processor';
import { TimeWarpProcessor } from './time-warp-processor';
import { TuningProcessor } from './tuning-processor';
import { SwitchProcessor } from './switch-processor';
import { SubListProcessor } from './sublist-processor';
import { EqualsProcessor } from './equals-processor';
import { ValueTimeMapper } from './value-time-mapper';

export class NoteProcessorChain {
  private _processors: NoteProcessor[] = [];

  constructor(other?: NoteProcessorChain) {
    if (other) {
      this._processors = other._processors.map((p) => p.deepCopy());
    }
  }

  getProcessors(): NoteProcessor[] {
    return [...this._processors];
  }

  addProcessor(proc: NoteProcessor): void {
    this._processors.push(proc);
  }

  clear(): void {
    this._processors = [];
  }

  /**
   * Apply this chain of processors to a NoteList.
   */
  apply(notes: NoteList): NoteList {
    let result = notes;
    for (const proc of this._processors) {
      try {
        result = proc.process(result);
      } catch (e: unknown) {
        if (e instanceof NoteProcessorException) {
          throw e;
        }
        throw new NoteProcessorException(
          `Error in ${proc.getDisplayName()}: ${e instanceof Error ? e.message : String(e)}`,
          -1,
          e as Error,
        );
      }
    }
    return result;
  }

  /** Save to XML. */
  saveAsXML(): Element {
    const elem = new Element('noteProcessorChain');
    for (const proc of this._processors) {
      elem.addElement(proc.saveAsXML().setName('noteProcessor'));
    }
    return elem;
  }

  /** Load from XML. */
  static loadFromXML(data: Element): NoteProcessorChain {
    const chain = new NoteProcessorChain();
    const procNodes = data.getElements('noteProcessor');
    while (procNodes.hasMoreElements()) {
      const node = procNodes.next();
      const type = node.getAttribute('type') ?? '';
      const proc = createProcessorFromXML(type, node);
      if (proc) {
        chain.addProcessor(proc);
      }
    }
    return chain;
  }

  /** Deep copy. */
  deepCopy(): NoteProcessorChain {
    return new NoteProcessorChain(this);
  }
}

/**
 * Factory function to create a NoteProcessor from XML based on type attribute.
 */
function createProcessorFromXML(type: string, data: Element): NoteProcessor | null {
  switch (type) {
    case 'AddProcessor':
      return AddProcessor.loadFromXML(data);
    case 'MultiplyProcessor':
      return MultiplyProcessor.loadFromXML(data);
    case 'Code':
      return Code.loadFromXML(data);
    case 'RandomAddProcessor':
      return RandomAddProcessor.loadFromXML(data);
    case 'RandomMultiplyProcessor':
      return RandomMultiplyProcessor.loadFromXML(data);
    case 'LineAddProcessor':
      return LineAddProcessor.loadFromXML(data);
    case 'LineMultiplyProcessor':
      return LineMultiplyProcessor.loadFromXML(data);
    case 'PchAddProcessor':
      return PchAddProcessor.loadFromXML(data);
    case 'PchInversionProcessor':
      return PchInversionProcessor.loadFromXML(data);
    case 'InversionProcessor':
      return InversionProcessor.loadFromXML(data);
    case 'RetrogradeProcessor':
      return RetrogradeProcessor.loadFromXML(data);
    case 'RotateProcessor':
      return RotateProcessor.loadFromXML(data);
    case 'TimeWarpProcessor':
      return TimeWarpProcessor.loadFromXML(data);
    case 'TuningProcessor':
      return TuningProcessor.loadFromXML(data);
    case 'SwitchProcessor':
      return SwitchProcessor.loadFromXML(data);
    case 'SubListProcessor':
      return SubListProcessor.loadFromXML(data);
    case 'EqualsProcessor':
      return EqualsProcessor.loadFromXML(data);
    case 'ValueTimeMapper':
      return ValueTimeMapper.loadFromXML(data);
    default:
      console.warn(`Unknown NoteProcessor type: ${type}`);
      return null;
  }
}
