/**
 * SoundLayer — a layer within a PolyObject that contains SoundObjects.
 * Mirrors the Java SoundLayer class.
 */
import { Layer, LAYER_HEIGHT } from '../score/layers/layer';
import { ScoreObject } from '../score/score-object';
import { SoundObject } from '../sound-objects/sound-object';

export class SoundLayer extends Array<SoundObject> implements Layer {
  private _name = '';

  constructor() {
    super();
  }

  // ─── Layer implementation ───

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }

  getLayerHeight(): number {
    return LAYER_HEIGHT;
  }

  accepts(object: ScoreObject): boolean {
    // SoundLayer accepts any SoundObject
    return 'generateForCSD' in object;
  }

  contains(object: ScoreObject): boolean {
    return (this as SoundObject[]).includes(object as SoundObject);
  }

  remove(object: ScoreObject): boolean {
    const idx = this.indexOf(object as SoundObject);
    if (idx !== -1) {
      this.splice(idx, 1);
      return true;
    }
    return false;
  }

  clearScoreObjects(): void {
    this.length = 0;
  }

  deepCopy(): SoundLayer {
    // SoundLayers are deep-copied by their containing PolyObject
    throw new Error('SoundLayer deepCopy should be called via PolyObject');
  }
}
