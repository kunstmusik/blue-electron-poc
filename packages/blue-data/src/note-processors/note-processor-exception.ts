/**
 * NoteProcessorException — thrown when a note processor encounters an error.
 * Mirrors the Java NoteProcessorException class.
 */
export class NoteProcessorException extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NoteProcessorException';
    if (cause) this.cause = cause;
  }
}
