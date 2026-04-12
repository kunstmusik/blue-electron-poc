/**
 * NoteProcessor — abstract base class for note processors.
 * Mirrors the Java NoteProcessor class.
 */
import { NoteList } from '../sound-objects/note-list';
import { NoteProcessorException } from './note-processor-exception';

export abstract class NoteProcessor {
  /**
   * Process a NoteList, potentially modifying or replacing notes.
   */
  abstract process(notes: NoteList): NoteList;

  /**
   * Get the display name for this processor.
   */
  abstract getDisplayName(): string;

  /**
   * Deep copy this processor.
   */
  abstract deepCopy(): NoteProcessor;

  /**
   * Process with exception handling.
   */
  processSafe(notes: NoteList): NoteList {
    try {
      return this.process(notes);
    } catch (e: unknown) {
      throw new NoteProcessorException(
        `Error in ${this.getDisplayName()}: ${e instanceof Error ? e.message : String(e)}`,
        e as Error,
      );
    }
  }
}
