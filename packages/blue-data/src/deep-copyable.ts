/**
 * DeepCopyable interface — any type that can produce a deep copy of itself.
 * Mirrors the Java DeepCopyable<T> interface.
 */
export interface DeepCopyable<T> {
  deepCopy(): T;
}
