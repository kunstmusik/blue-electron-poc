/**
 * AutomatableCollectionListener — listens for changes to automatable collections.
 * Mirrors the Java AutomatableCollectionListener interface.
 */
import { Automatable } from './automatable';

export interface AutomatableCollectionListener {
  automatableAdded(automatable: Automatable): void;
  automatableRemoved(automatable: Automatable): void;
}
