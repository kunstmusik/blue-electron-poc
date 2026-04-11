/**
 * ScoreGenerationException — thrown during CSD score generation.
 * Mirrors the Java ScoreGenerationException class.
 */
export class ScoreGenerationException extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ScoreGenerationException';
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}
