/**
 * MidiInputProcessor — holds MIDI input configuration.
 * Mirrors the Java MidiInputProcessor class.
 *
 * For Phase 3: stub — preserves XML on load/save.
 */
import { Element } from '../serialization/xml-reader';

export class MidiInputProcessor {
  saveAsXML(): Element {
    return new Element('midiInputProcessor');
  }

  static loadFromXML(_data: Element): MidiInputProcessor {
    return new MidiInputProcessor();
  }
}
