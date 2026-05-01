/**
 * MidiInputProcessor — holds MIDI input configuration.
 * Mirrors the Java MidiInputProcessor class.
 *
 * Stores key mapping, velocity mapping, pitch/amp constants, and scale data
 * for MIDI input processing.
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { Scale } from '../sound-objects/piano-roll/scale';

export class MidiInputProcessor implements BlueDataObject {
  private _keyMapping = 'PCH';
  private _velMapping = 'MIDI';
  private _pitchConstant = '';
  private _ampConstant = '';
  private _scale: Scale | null = new Scale();

  constructor(other?: MidiInputProcessor) {
    if (other) {
      this._keyMapping = other._keyMapping;
      this._velMapping = other._velMapping;
      this._pitchConstant = other._pitchConstant;
      this._ampConstant = other._ampConstant;
      this._scale = other._scale ? new Scale(other._scale) : null;
    }
  }

  getKeyMapping(): string {
    return this._keyMapping;
  }

  setKeyMapping(mapping: string): void {
    this._keyMapping = mapping;
  }

  getVelocityMapping(): string {
    return this._velMapping;
  }

  setVelocityMapping(mapping: string): void {
    this._velMapping = mapping;
  }

  getPitchConstant(): string {
    return this._pitchConstant;
  }

  setPitchConstant(value: string): void {
    this._pitchConstant = value;
  }

  getAmpConstant(): string {
    return this._ampConstant;
  }

  setAmpConstant(value: string): void {
    this._ampConstant = value;
  }

  getScale(): Scale | null {
    return this._scale;
  }

  setScale(scale: Scale | null): void {
    this._scale = scale ? new Scale(scale) : null;
  }

  saveAsXML(): Element {
    const elem = new Element('midiInputProcessor');
    elem.addElement('keyMapping').setText(this._keyMapping);
    elem.addElement('velMapping').setText(this._velMapping);
    elem.addElement('pitchConstant').setText(this._pitchConstant);
    elem.addElement('ampConstant').setText(this._ampConstant);
    elem.addElement((this._scale ?? new Scale()).saveAsXML());
    return elem;
  }

  static loadFromXML(data: Element): MidiInputProcessor {
    const mip = new MidiInputProcessor();

    const keyMapping = data.getTextString('keyMapping');
    if (keyMapping !== null) {
      mip._keyMapping = keyMapping;
    }

    const velMapping = data.getTextString('velMapping');
    if (velMapping !== null) {
      mip._velMapping = velMapping;
    }

    const pitchConstant = data.getTextString('pitchConstant');
    if (pitchConstant !== null) {
      mip._pitchConstant = pitchConstant;
    }

    const ampConstant = data.getTextString('ampConstant');
    if (ampConstant !== null) {
      mip._ampConstant = ampConstant;
    }

    const scaleElem = data.getElement('scale');
    if (scaleElem) {
      mip._scale = Scale.loadFromXML(scaleElem);
    }

    return mip;
  }

  deepCopy(): BlueDataObject {
    return new MidiInputProcessor(this);
  }
}
