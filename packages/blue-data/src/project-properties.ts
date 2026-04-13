/**
 * ProjectProperties — holds project-level settings for CSD generation.
 * Mirrors the Java ProjectProperties class.
 *
 * Contains sample rate, ksmps, nchnls, 0dbfs, Csound command line options,
 * and metadata (title, author, notes).
 */
import { Element } from './serialization/xml-reader';
import { ObjRefSaveMap } from './serialization/obj-ref-map';

export class ProjectProperties {
  title = '';
  author = '';
  notes = '';
  sampleRate = '44100';
  ksmps = '64';
  nchnls = '2';
  oFormat = 'wav';

  // 0dbfs settings (added in 2.1.10)
  useZeroDbFS = false;
  zeroDbFS = '32768';
  diskUseZeroDbFS = false;
  diskZeroDbFS = '32768';

  // Advanced Csound options
  commandLine = '';
  completeOverride = false;
  advancedSettings = '';

  // Audio output
  audioOutput = '';

  constructor(other?: ProjectProperties) {
    if (other) {
      this.title = other.title;
      this.author = other.author;
      this.notes = other.notes;
      this.sampleRate = other.sampleRate;
      this.ksmps = other.ksmps;
      this.nchnls = other.nchnls;
      this.oFormat = other.oFormat;
      this.useZeroDbFS = other.useZeroDbFS;
      this.zeroDbFS = other.zeroDbFS;
      this.diskUseZeroDbFS = other.diskUseZeroDbFS;
      this.diskZeroDbFS = other.diskZeroDbFS;
      this.commandLine = other.commandLine;
      this.completeOverride = other.completeOverride;
      this.advancedSettings = other.advancedSettings;
      this.audioOutput = other.audioOutput;
    }
  }

  /**
   * Generate the CSD options line from these properties.
   */
  toCsoundOptions(): string {
    const options: string[] = [];

    // Real-time audio output (default to -odac for live playback)
    options.push('-odac');
    // Disable text output
    options.push('-d');

    if (this.sampleRate) options.push(`-r ${this.sampleRate}`);
    if (this.ksmps) options.push(`-k ${this.ksmps}`);
    if (this.nchnls) options.push(`-nchnls ${this.nchnls}`);
    // 0dbfs goes in orchestra header, not CsOptions (Csound 7 rejects -0dbfs=1)

    if (this.commandLine && this.completeOverride) {
      return this.commandLine;
    }

    return options.join('\n');
  }

  // ─── XML ───

  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('projectProperties');
    if (this.title) elem.addElement('title').setText(this.title);
    if (this.author) elem.addElement('author').setText(this.author);
    if (this.notes) elem.addElement('notes').setText(this.notes);
    if (this.sampleRate) elem.addElement('sampleRate').setText(this.sampleRate);
    if (this.ksmps) elem.addElement('ksmps').setText(this.ksmps);
    if (this.nchnls) elem.addElement('nchnls').setText(this.nchnls);
    if (this.oFormat) elem.addElement('oFormat').setText(this.oFormat);
    elem.addElement('useZeroDbFS').setText(this.useZeroDbFS.toString());
    if (this.zeroDbFS) elem.addElement('zeroDbFS').setText(this.zeroDbFS);
    elem.addElement('diskUseZeroDbFS').setText(this.diskUseZeroDbFS.toString());
    if (this.diskZeroDbFS) elem.addElement('diskZeroDbFS').setText(this.diskZeroDbFS);
    if (this.commandLine) elem.addElement('commandLine').setText(this.commandLine);
    elem.addElement('completeOverride').setText(this.completeOverride.toString());
    if (this.advancedSettings) elem.addElement('advancedSettings').setText(this.advancedSettings);
    if (this.audioOutput) elem.addElement('audioOutput').setText(this.audioOutput);
    return elem;
  }

  static loadFromXML(data: Element): ProjectProperties {
    const props = new ProjectProperties();

    const title = data.getTextString('title');
    if (title) props.title = title;

    const author = data.getTextString('author');
    if (author) props.author = author;

    const notes = data.getTextString('notes');
    if (notes) props.notes = notes;

    const sr = data.getTextString('sampleRate');
    if (sr) props.sampleRate = sr;

    const ksmps = data.getTextString('ksmps');
    if (ksmps) props.ksmps = ksmps;

    const nchnls = data.getTextString('nchnls');
    if (nchnls) props.nchnls = nchnls;

    const oFormat = data.getTextString('oFormat');
    if (oFormat) props.oFormat = oFormat;

    const udb = data.getTextString('useZeroDbFS');
    if (udb) props.useZeroDbFS = udb.toLowerCase() === 'true';

    const zdb = data.getTextString('zeroDbFS');
    if (zdb) props.zeroDbFS = zdb;

    const ddb = data.getTextString('diskUseZeroDbFS');
    if (ddb) props.diskUseZeroDbFS = ddb.toLowerCase() === 'true';

    const dzdb = data.getTextString('diskZeroDbFS');
    if (dzdb) props.diskZeroDbFS = dzdb;

    const cmd = data.getTextString('commandLine');
    if (cmd) props.commandLine = cmd;

    const co = data.getTextString('completeOverride');
    if (co) props.completeOverride = co.toLowerCase() === 'true';

    const adv = data.getTextString('advancedSettings');
    if (adv) props.advancedSettings = adv;

    const ao = data.getTextString('audioOutput');
    if (ao) props.audioOutput = ao;

    return props;
  }
}
