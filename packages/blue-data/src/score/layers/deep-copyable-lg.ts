/**
 * DeepCopyableLG — deep copy interface for LayerGroups.
 * Separate from DeepCopyable because LayerGroup extends List<T>.
 * Mirrors the Java DeepCopyableLG interface.
 */
export interface DeepCopyableLG<T> {
  deepCopyLG(): T;
}
