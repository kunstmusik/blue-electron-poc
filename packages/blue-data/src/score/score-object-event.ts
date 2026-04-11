/**
 * ScoreObjectEvent — events fired when a ScoreObject changes.
 * Mirrors the Java ScoreObjectEvent class.
 */
export enum ScoreEventType {
  NAME = 'NAME',
  START_TIME = 'START_TIME',
  DURATION = 'DURATION',
  COLOR = 'COLOR',
  REPEAT_POINT = 'REPEAT_POINT',
  NOTES = 'NOTES',
  TIME_BEHAVIOR = 'TIME_BEHAVIOR',
}

export class ScoreObjectEvent {
  readonly type: ScoreEventType;

  constructor(type: ScoreEventType) {
    this.type = type;
  }
}

/**
 * ScoreObjectListener — listens for changes to a ScoreObject.
 * Mirrors the Java ScoreObjectListener interface.
 */
export interface ScoreObjectListener {
  scoreObjectChanged(event: ScoreObjectEvent): void;
}
