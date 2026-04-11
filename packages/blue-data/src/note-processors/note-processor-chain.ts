/**
 * NoteProcessorChain — ordered chain of note processors applied to notes.
 * Mirrors the Java NoteProcessorChain class.
 *
 * NoteProcessors transform notes in a NoteList (transpose, scale, randomize, etc.).
 * A chain applies them in sequence.
 *
 * For Phase 3, this is a stub — full implementation in Phase 9.
 */
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class NoteProcessorChain {
  private processors: unknown[] = [];

  constructor(other?: NoteProcessorChain) {
    if (other) {
      this.processors = [...other.processors];
    }
  }

  /** Apply this chain of processors to a NoteList. */
  apply(notes: NoteList): NoteList {
    // For Phase 3: return notes unchanged
    // Full implementation when NoteProcessors are ported (Phase 9)
    return notes;
  }

  /** Add a processor to this chain. */
  addProcessor(processor: unknown): void {
    this.processors.push(processor);
  }

  /** Clear all processors. */
  clear(): void {
    this.processors = [];
  }

  /** Serialize to XML. */
  saveAsXML(): Element {
    const elem = new Element('noteProcessorChain');
    // Processors serialized by individual types
    return elem;
  }

  /** Load from XML. */
  static loadFromXML(data: Element): NoteProcessorChain {
    return new NoteProcessorChain();
  }

  /** Deep copy. */
  deepCopy(): NoteProcessorChain {
    return new NoteProcessorChain(this);
  }
}
