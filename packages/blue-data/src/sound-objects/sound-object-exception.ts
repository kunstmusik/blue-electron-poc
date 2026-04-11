/**
 * SoundObjectException — thrown when a SoundObject encounters an error.
 * Mirrors the Java SoundObjectException class.
 */
export class SoundObjectException extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'SoundObjectException';
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}
