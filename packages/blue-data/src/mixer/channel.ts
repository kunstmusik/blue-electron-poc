/**
 * Channel — a mixer channel with effects chain and sends.
 * Mirrors the Java Channel class.
 */
import { EffectsChain } from './effects-chain';
import { Send } from './send';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';

export class Channel implements BlueDataObject {
  static readonly MASTER = 'master';

  private _name = '';
  private _muted = false;
  private _solo = false;
  private _volume = 1.0;
  private _pan = 0.5;
  private _effectsChain = new EffectsChain();
  private _sends: Send[] = [];
  private _association = '';

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  isMuted(): boolean { return this._muted; }
  setMuted(m: boolean): void { this._muted = m; }

  isSolo(): boolean { return this._solo; }
  setSolo(s: boolean): void { this._solo = s; }

  getVolume(): number { return this._volume; }
  setVolume(v: number): void { this._volume = v; }

  getPan(): number { return this._pan; }
  setPan(p: number): void { this._pan = p; }

  getEffectsChain(): EffectsChain { return this._effectsChain; }

  getSends(): Send[] { return this._sends; }

  getAssociation(): string { return this._association; }
  setAssociation(a: string): void { this._association = a; }

  saveAsXML(): Element {
    const elem = new Element('channel');
    elem.setAttribute('name', this._name);
    elem.setAttribute('muted', this._muted.toString());
    elem.setAttribute('solo', this._solo.toString());
    elem.addElement('volume').setText(this._volume.toString());
    elem.addElement('pan').setText(this._pan.toString());
    elem.addElement(this._effectsChain.saveAsXML().setName('effectsChain'));

    if (this._association) {
      elem.addElement('association').setText(this._association);
    }

    for (const send of this._sends) {
      elem.addElement(send.saveAsXML().setName('send'));
    }

    return elem;
  }

  static loadFromXML(data: Element): Channel {
    const channel = new Channel();
    channel._name = data.getAttribute('name') ?? '';
    channel._muted = data.getAttribute('muted') === 'true';
    channel._solo = data.getAttribute('solo') === 'true';

    const vol = data.getTextString('volume');
    if (vol) channel._volume = parseFloat(vol);

    const pan = data.getTextString('pan');
    if (pan) channel._pan = parseFloat(pan);

    const assoc = data.getTextString('association');
    if (assoc) channel._association = assoc;

    const ecNode = data.getElement('effectsChain');
    if (ecNode) channel._effectsChain = EffectsChain.loadFromXML(ecNode);

    const sendNodes = data.getElements('send');
    while (sendNodes.hasMoreElements()) {
      channel._sends.push(Send.loadFromXML(sendNodes.next()));
    }

    return channel;
  }

  deepCopy(): BlueDataObject {
    const copy = new Channel();
    copy._name = this._name;
    copy._muted = this._muted;
    copy._solo = this._solo;
    copy._volume = this._volume;
    copy._pan = this._pan;
    copy._association = this._association;
    copy._effectsChain = this._effectsChain.deepCopy() as EffectsChain;
    copy._sends = this._sends.map((s) => s.deepCopy() as Send);
    return copy;
  }
}
