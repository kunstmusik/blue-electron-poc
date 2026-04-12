/**
 * ParameterNameManager — manages named parameter mappings.
 * Mirrors the Java ParameterNameManager class.
 */
import { ParameterList } from './parameter-list';

export class ParameterNameManager {
  private _nameToIndex = new Map<string, number>();
  private _indexToName = new Map<number, string>();
  private _parameters: ParameterList | null = null;

  setParameterList(params: ParameterList): void {
    this._parameters = params;
    this._nameToIndex.clear();
    this._indexToName.clear();
    for (let i = 0; i < params.length; i++) {
      const name = params[i].getName();
      this._nameToIndex.set(name, i);
      this._indexToName.set(i, name);
    }
  }

  getIndex(name: string): number {
    return this._nameToIndex.get(name) ?? -1;
  }

  getName(index: number): string | undefined {
    return this._indexToName.get(index);
  }
}
