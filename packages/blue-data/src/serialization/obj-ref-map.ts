/**
 * ObjRefMap — bidirectional mapping for shared object references.
 *
 * During serialization (save):
 *   - Objects are assigned string IDs on first encounter
 *   - Subsequent references to the same object use the ID string
 *   - Map<Object, string> maps JS objects to their reference IDs
 *
 * During deserialization (load):
 *   - String IDs resolve to actual object instances
 *   - Map<string, Object> maps reference IDs to JS objects
 *
 * This mirrors the Java pattern where objRefMap is used in both directions
 * depending on whether we're saving or loading.
 */

/** Save-side: Object → string ID mapping */
export class ObjRefSaveMap {
  private _map = new Map<object, string>();
  private _counter = 0;

  /** Get existing ID or assign a new one. */
  getId(obj: object): string {
    let id = this._map.get(obj);
    if (!id) {
      id = `ref_${++this._counter}`;
      this._map.set(obj, id);
    }
    return id;
  }

  /** Check if an object already has an ID. */
  hasId(obj: object): boolean {
    return this._map.has(obj);
  }
}

/** Load-side: string ID → Object mapping */
export class ObjRefLoadMap {
  private _map = new Map<string, object>();

  /** Register an object with its reference ID. */
  register(id: string, obj: object): void {
    this._map.set(id, obj);
  }

  /** Resolve a reference ID to an object. */
  get(id: string): object | undefined {
    return this._map.get(id);
  }

  /** Check if a reference ID exists. */
  has(id: string): boolean {
    return this._map.has(id);
  }

  /** Clear all registered references. */
  clear(): void {
    this._map.clear();
  }
}
