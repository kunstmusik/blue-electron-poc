/**
 * Channel — a mixer channel with effects chain and sends.
 * Mirrors the Java Channel class.
 */
import { EffectsChain } from './effects-chain';
import { Send } from './send';
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { Parameter } from '../automation/parameter';

export class Channel implements BlueDataObject {
  static readonly MASTER = 'master';

  private _name = '';
  private _outChannel = '';
  private _muted = false;
  private _solo = false;
  private _level = 0; // in dB
  private _volume = 1.0;
  private _pan = 0.5;
  private _preEffects = new EffectsChain();
  private _postEffects = new EffectsChain();
  private _effectsChain = new EffectsChain();
  private _sends: Send[] = [];
  private _association = '';
  private _parameter: any = null; // Channel-level parameter (volume/send automation)

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getOutChannel(): string { return this._outChannel; }
  setOutChannel(ch: string): void { this._outChannel = ch; }

  isMuted(): boolean { return this._muted; }
  setMuted(m: boolean): void { this._muted = m; }

  isSolo(): boolean { return this._solo; }
  setSolo(s: boolean): void { this._solo = s; }

  getLevel(): number { return this._level; }
  setLevel(v: number): void { this._level = v; }

  getVolume(): number { return this._volume; }
  setVolume(v: number): void { this._volume = v; }

  getPan(): number { return this._pan; }
  setPan(p: number): void { this._pan = p; }

  getPreEffects(): EffectsChain { return this._preEffects; }
  getPostEffects(): EffectsChain { return this._postEffects; }
  getEffectsChain(): EffectsChain { return this._effectsChain; }

  getSends(): Send[] { return this._sends; }

  getAssociation(): string { return this._association; }
  setAssociation(a: string): void { this._association = a; }

  getChannelParameter(): any { return this._parameter; }

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

    // Name: can be attribute or child element
    channel._name = data.getAttribute('name') ?? data.getTextString('name') ?? '';
    channel._muted = (data.getAttribute('muted') ?? data.getTextString('muted')) === 'true';
    channel._solo = (data.getAttribute('solo') ?? data.getTextString('solo')) === 'true';

    // Out channel routing
    const outCh = data.getTextString('outChannel');
    if (outCh) channel._outChannel = outCh;

    // Level (in dB)
    const level = data.getTextString('level');
    if (level) channel._level = parseFloat(level);

    const vol = data.getTextString('volume');
    if (vol) channel._volume = parseFloat(vol);

    const pan = data.getTextString('pan');
    if (pan) channel._pan = parseFloat(pan);

    const assoc = data.getTextString('association');
    if (assoc) channel._association = assoc;

    // Effects chains: <effectsChain bin='pre'> and <effectsChain bin='post'>
    const ecNodes = data.getElements('effectsChain');
    while (ecNodes.hasMoreElements()) {
      const ecNode = ecNodes.next();
      const loaded = EffectsChain.loadFromXML(ecNode);
      const bin = ecNode.getAttribute('bin') ?? '';
      if (bin === 'pre') {
        channel._preEffects = loaded;
      } else if (bin === 'post') {
        channel._postEffects = loaded;
        // Sends are often inside post effects chains
        if (loaded.sends.length > 0) {
          channel._sends.push(...loaded.sends);
        }
      } else {
        channel._effectsChain = loaded;
      }
    }

    // Sends (inside post effects chains or at channel level)
    const sendNodes = data.getElements('send');
    while (sendNodes.hasMoreElements()) {
      channel._sends.push(Send.loadFromXML(sendNodes.next()));
    }

    // Channel-level parameter (volume automation)
    const paramNodes = data.getElements('parameter');
    while (paramNodes.hasMoreElements()) {
      const paramElem = paramNodes.next();
      // Store the first channel parameter (typically volume)
      if (!channel._parameter) {
        const param = new Parameter();
        const pName = paramElem.getAttribute('name');
        if (pName) param.setName(pName);
        const pVal = paramElem.getAttribute('value');
        if (pVal) param.setFixedValue(parseFloat(pVal));
        const pMin = paramElem.getAttribute('min');
        if (pMin) param.setMinimum(parseFloat(pMin));
        const pMax = paramElem.getAttribute('max');
        if (pMax) param.setMaximum(parseFloat(pMax));
        channel._parameter = param;
      }
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
