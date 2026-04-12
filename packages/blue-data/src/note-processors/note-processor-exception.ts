/**
 * NoteProcessorException — thrown when a note processor encounters an error.
 * Mirrors the Java NoteProcessorException class.
 */
export class NoteProcessorException extends Error {
  public readonly pfield: number;

  constructor(message: string, pfield: number, cause?: Error) {
    super(message);
    this.name = 'NoteProcessorException';
    this.pfield = pfield;
    if (cause) this.cause = cause;
  }
}
