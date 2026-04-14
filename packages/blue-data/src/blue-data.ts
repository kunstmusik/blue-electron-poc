/**
 * BlueData — the root data class for a Blue project.
 * Mirrors the Java BlueData class.
 *
 * BlueData aggregates all project data: arrangement, mixer, project properties,
 * sound object library, score, tables, global orc/sco, opcodes, live data,
 * markers, MIDI input, scratch pad data, and plugin data.
 *
 * Loading/saving is done via XML strings compatible with the Java .blue file format.
 */
import { Element } from './serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from './serialization/obj-ref-map';
import { UpgradeManager } from './migration/upgrade-manager';
import { BLUE_VERSION } from './blue-constants';
import { Arrangement } from './arrangement';
import { ProjectProperties } from './project-properties';
import { SoundObjectLibrary } from './sound-objects/sound-object-library';
import { GlobalOrcSco } from './global-orc-sco';
import { Tables } from './tables';
import { LiveData } from './live-data';
import { Score } from './score/score';
import { ScratchPadData } from './scratch-pad-data';
import { NoteProcessorChainMap } from './note-processors/note-processor-chain-map';
import { MarkersList } from './markers-list';
import { MidiInputProcessor } from './midi/midi-input-processor';
import { InstrumentLibrary } from './instruments/instrument-library';
import { CompileData } from './compile-data';
import { BlueDataObject } from './blue-data-object';
import { NoteList } from './sound-objects/note-list';
import { Mixer } from './mixer/mixer';
import { OpcodeList } from './opcodes/opcode-list';
import { getAllParameters, assignParameterNames } from './automation/parameter-helper';
import { Parameter } from './automation/parameter';

export class BlueData implements BlueDataObject {
  // Version
  private version = BLUE_VERSION;

  // Core data
  private arrangement = new Arrangement();
  private projectProperties = new ProjectProperties();
  private sObjLib = new SoundObjectLibrary();
  private globalOrcSco = new GlobalOrcSco();
  private tableSet = new Tables();
  private score = new Score();
  private liveData = new LiveData();
  private scratchData = new ScratchPadData();
  private noteProcessorChainMap = new NoteProcessorChainMap();
  private markersList = new MarkersList();
  private midiInputProcessor = new MidiInputProcessor();
  private mixer = new Mixer();
  private opcodeList = new OpcodeList();

  // Render settings
  private renderStartTime = 0;
  private renderEndTime = -1;
  private loopRendering = false;

  // Plugin data (opaque for Phase 3)
  private pluginData: BlueDataObject[] = [];

  constructor() {}

  // ─── Accessors ───

  getVersion(): string { return this.version; }
  setVersion(v: string): void { this.version = v; }

  getArrangement(): Arrangement { return this.arrangement; }
  setArrangement(a: Arrangement): void { this.arrangement = a; }

  getProjectProperties(): ProjectProperties { return this.projectProperties; }
  setProjectProperties(p: ProjectProperties): void { this.projectProperties = p; }

  getSoundObjectLibrary(): SoundObjectLibrary { return this.sObjLib; }
  setSoundObjectLibrary(s: SoundObjectLibrary): void { this.sObjLib = s; }

  getGlobalOrcSco(): GlobalOrcSco { return this.globalOrcSco; }
  setGlobalOrcSco(g: GlobalOrcSco): void { this.globalOrcSco = g; }

  getTableSet(): Tables { return this.tableSet; }
  setTableSet(t: Tables): void { this.tableSet = t; }

  getScore(): Score { return this.score; }
  setScore(s: Score): void { this.score = s; }

  getLiveData(): LiveData { return this.liveData; }
  setLiveData(l: LiveData): void { this.liveData = l; }

  getScratchPadData(): ScratchPadData { return this.scratchData; }
  setScratchPadData(s: ScratchPadData): void { this.scratchData = s; }

  getNoteProcessorChainMap(): NoteProcessorChainMap { return this.noteProcessorChainMap; }
  setNoteProcessorChainMap(n: NoteProcessorChainMap): void { this.noteProcessorChainMap = n; }

  getMarkersList(): MarkersList { return this.markersList; }
  setMarkersList(m: MarkersList): void { this.markersList = m; }

  getMidiInputProcessor(): MidiInputProcessor { return this.midiInputProcessor; }
  setMidiInputProcessor(m: MidiInputProcessor): void { this.midiInputProcessor = m; }

  getMixer(): Mixer { return this.mixer; }
  setMixer(m: Mixer): void { this.mixer = m; }

  getOpcodeList(): OpcodeList { return this.opcodeList; }
  setOpcodeList(o: OpcodeList): void { this.opcodeList = o; }

  getRenderStartTime(): number { return this.renderStartTime; }
  setRenderStartTime(t: number): void { this.renderStartTime = t; }

  getRenderEndTime(): number { return this.renderEndTime; }
  setRenderEndTime(t: number): void { this.renderEndTime = t; }

  isLoopRendering(): boolean { return this.loopRendering; }
  setLoopRendering(l: boolean): void { this.loopRendering = l; }

  getPluginData(): BlueDataObject[] { return this.pluginData; }

  // ─── Loading ───

  /**
   * Load BlueData from an XML string.
   * Automatically applies migrations if the file version is old.
   */
  static async loadFromString(xmlString: string): Promise<BlueData> {
    const rootElement = Element.parse(xmlString);

    if (rootElement.getName() !== 'blueData') {
      throw new Error(`Expected root element "blueData", got "${rootElement.getName()}"`);
    }

    // Apply migrations
    UpgradeManager.getInstance().performUpgrades(rootElement);

    const objRefMap = new ObjRefLoadMap();
    const blueData = new BlueData();

    const versionAttr = rootElement.getAttribute('version');
    if (versionAttr) blueData.setVersion(versionAttr);

    const nodes = rootElement.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      const nodeName = node.getName();
      console.log(`[BlueData.loadFromString] Found element: ${nodeName}`);

      switch (nodeName) {
        case 'projectProperties':
          blueData.projectProperties = ProjectProperties.loadFromXML(node);
          break;
        case 'arrangement':
          blueData.arrangement = await Arrangement.loadFromXML(node);
          break;
        case 'instrumentLibrary':
          console.log(`[BlueData.loadFromString] instrumentLibrary found (instruments stub)`);
          break;
        case 'tables':
          blueData.tableSet = Tables.loadFromXML(node);
          break;
        case 'globalOrcSco':
          blueData.globalOrcSco = GlobalOrcSco.loadFromXML(node);
          break;
        case 'score':
          blueData.score = Score.loadFromXML(node, objRefMap);
          break;
        case 'liveData':
          blueData.liveData = LiveData.loadFromXML(node, objRefMap);
          break;
        case 'scratchPadData':
          blueData.scratchData = ScratchPadData.loadFromXML(node);
          break;
        case 'noteProcessorChainMap':
          blueData.noteProcessorChainMap = NoteProcessorChainMap.loadFromXML(node);
          break;
        case 'renderStartTime':
          blueData.renderStartTime = parseFloat(node.getTextString());
          break;
        case 'renderEndTime':
          blueData.renderEndTime = parseFloat(node.getTextString());
          break;
        case 'markersList':
          blueData.markersList = MarkersList.loadFromXML(node);
          break;
        case 'loopRendering':
          blueData.loopRendering = node.getTextString().toLowerCase() === 'true';
          break;
        case 'midiInputProcessor':
          blueData.midiInputProcessor = MidiInputProcessor.loadFromXML(node);
          break;
        case 'mixer':
          blueData.mixer = Mixer.loadFromXML(node);
          break;
        case 'opcodeList':
          // OpcodeList at root level — global UDO list
          blueData.opcodeList = OpcodeList.loadFromXML(node);
          break;
        case 'pluginData':
          // Opaque preservation of plugin XML nodes
          break;
      }
    }

    return blueData;
  }

  // ─── Saving ───

  /**
   * Save to an XML Element (for internal use).
   */
  saveAsXML(objRefMap?: ObjRefSaveMap): Element {
    this.version = BLUE_VERSION;
    const root = new Element('blueData');
    root.setAttribute('version', this.version);

    root.addElement(this.projectProperties.saveAsXML(objRefMap));
    root.addElement(this.arrangement.saveAsXML());
    root.addElement(this.sObjLib.saveAsXML(objRefMap));
    root.addElement(this.globalOrcSco.saveAsXML());
    root.addElement(this.tableSet.saveAsXML());
    root.addElement(this.score.saveAsXML(objRefMap));
    root.addElement(this.liveData.saveAsXML(objRefMap));
    root.addElement(this.scratchData.saveAsXML());
    root.addElement(this.noteProcessorChainMap.saveAsXML());
    root.addElement('renderStartTime').setText(this.renderStartTime.toString());
    root.addElement('renderEndTime').setText(this.renderEndTime.toString());
    root.addElement(this.markersList.saveAsXML());
    root.addElement('loopRendering').setText(this.loopRendering.toString());
    root.addElement(this.midiInputProcessor.saveAsXML());

    const pluginDataElem = root.addElement('pluginData');
    for (const pd of this.pluginData) {
      pluginDataElem.addElement(pd.saveAsXML(objRefMap));
    }

    return root;
  }

  /**
   * Save BlueData to an XML string.
   */
  saveToString(): string {
    const objRefMap = new ObjRefSaveMap();
    const root = this.saveAsXML(objRefMap);
    return root.toXml();
  }

  // ─── CSD Generation ───

  /**
   * Generate a complete CSD string from this project data.
   * Mirrors the Java CSDRender.generateCSDImpl() method.
   *
   * Output format:
   *   ; "title"
   *   ; by author
   *   ; notes
   *   ;
   *   ; Generated by blue X.X.X (http://blue.kunstmusik.com)
   *   ;
   *
   *   <CsoundSynthesizer>
   *   <CsInstruments>
   *   sr=44100
   *   ksmps=64
   *   nchnls=2
   *   0dbfs=1
   *
   *   ; Global orc from GlobalOrcSco
   *   ; Mixer init statements (ga_bluemix_X_Y init 0)
   *   ; UDO list from OpcodeList
   *
   *       instr 1    ;Instrument Name
   *   ...
   *       endin
   *
   *   </CsInstruments>
   *   <CsScore>
   *
   *   ; F-tables
   *   ; Global sco
   *   ; Score notes
   *   e
   *   </CsScore>
   *   </CsoundSynthesizer>
   */
  toCSD(): string {
    const compileData = new CompileData();

    // Build CsInstruments header (sr/ksmps/nchnls/0dbfs go here, not in CsOptions)
    const orchestraHeader = this.buildOrchestraHeader();

    // Global orchestra/sco from stored data
    let globalOrc = this.globalOrcSco.getGlobalOrc() || '';
    let globalSco = this.globalOrcSco.getGlobalSco() || '';

    // Mixer init statements
    if (this.mixer.isEnabled()) {
      const channelIds = this.assignChannelIds();
      const mixerInits = this.mixer.getInitStatements(channelIds, this.getNchnls());
      if (mixerInits) {
        globalOrc = globalOrc ? globalOrc + '\n' + mixerInits : mixerInits;
      }
    }

    // UDO list from OpcodeList
    const udoText = this.opcodeList.toString();
    if (udoText) {
      globalOrc = globalOrc ? globalOrc + '\n\n' + udoText : udoText;
    }

    // Parameter init statements
    const parameters = getAllParameters(this.arrangement, this.mixer);
    assignParameterNames(parameters);
    const paramInits = this.buildParameterInits(parameters);
    if (paramInits) {
      globalOrc = globalOrc ? globalOrc + '\n' + paramInits : paramInits;
    }

    // String channel init statements from BSB instruments
    const stringChannels = this.collectStringChannels();
    const stringInits = this.buildStringChannelInits(stringChannels);
    if (stringInits) {
      globalOrc = globalOrc ? globalOrc + '\n' + stringInits : stringInits;
    }

    // F-tables
    const ftables = this.tableSet.getAllTables();

    // Arrangement → orchestra
    const orc = this.arrangement.generateOrchestra(compileData);

    // Score → score events
    const startTime = this.renderStartTime;
    const endTime = this.renderEndTime;
    const noteList = this.score.generateForCSD(compileData, startTime, endTime);

    // Build score text
    const scoreText = this.buildScoreText(ftables, globalSco, noteList);

    // Build CsOptions (only -odac and -d for real-time playback)
    const csOptions = '-odac\n-d';

    // Build project info comments
    const projectInfo = this.buildProjectInfo();

    // Assemble CSD
    return (
      projectInfo +
      '<CsoundSynthesizer>\n' +
      '<CsOptions>\n' +
      csOptions +
      '\n</CsOptions>\n' +
      '<CsInstruments>\n' +
      orchestraHeader +
      '\n' +
      globalOrc +
      '\n\n' +
      orc +
      '\n</CsInstruments>\n' +
      '<CsScore>\n' +
      scoreText +
      '\n</CsScore>\n' +
      '</CsoundSynthesizer>\n'
    );
  }

  /**
   * Build the orchestra header (sr/ksmps/nchnls/0dbfs).
   */
  private buildOrchestraHeader(): string {
    const props = this.projectProperties;
    const nchnls = this.getNchnls();

    const lines: string[] = [];
    if (props.sampleRate) lines.push(`sr=${props.sampleRate}`);
    if (props.ksmps) lines.push(`ksmps=${props.ksmps}`);
    lines.push(`nchnls=${nchnls}`);
    if (props.useZeroDbFS) lines.push(`0dbfs=${props.zeroDbFS}`);

    return lines.join('\n');
  }

  /**
   * Get the number of channels for real-time playback.
   */
  private getNchnls(): number {
    const props = this.projectProperties;
    if (props.nchnls) {
      const n = parseInt(props.nchnls, 10);
      if (!isNaN(n)) return n;
    }
    return 2; // Default stereo
  }

  /**
   * Assign channel IDs for mixer init statements.
   * Mirrors Java's assignChannelIds().
   */
  private assignChannelIds(): Map<import('./mixer/channel').Channel, number> {
    const assignments = new Map<import('./mixer/channel').Channel, number>();
    let i = 0;

    // Source channels
    for (const channel of this.mixer.getAllSourceChannels()) {
      assignments.set(channel, i++);
    }

    // Sub channels
    for (const subChannel of this.mixer.getSubChannels()) {
      assignments.set(subChannel, i++);
    }

    return assignments;
  }

  /**
   * Build the score section with F-tables, globalSco, and generated notes.
   */
  private buildScoreText(ftables: string, globalSco: string, noteList: import('./sound-objects/note-list').NoteList): string {
    const lines: string[] = [];

    // F-tables
    if (ftables) lines.push(ftables);

    lines.push('');

    // Global score
    if (globalSco) lines.push(globalSco);

    lines.push('');

    // Generated notes
    if (noteList && noteList.length > 0) {
      for (let i = 0; i < noteList.length; i++) {
        lines.push(noteList.getNote(i).toScoreText());
      }
    }

    // End statement (required by Csound)
    lines.push('e');

    return lines.join('\n');
  }

  /**
   * Build project info comments for the top of the CSD.
   * Mirrors Java's appendProjectInfo().
   */
  private buildProjectInfo(): string {
    const props = this.projectProperties;
    const notes = (props.notes || '').replace(/\n/g, '\n; ');

    return (
      ';\n' +
      `; "${props.title || ''}"\n` +
      `; by ${props.author || ''}\n` +
      ';\n' +
      (notes ? `; ${notes}\n;\n` : '') +
      `; Generated by blue ${BLUE_VERSION} (http://blue.kunstmusik.com)\n` +
      ';\n\n'
    );
  }

  /**
   * Build parameter init statements for globalOrc.
   * Mirrors Java's handleParameters() method.
   *
   * Output:
   *   gk_blue_auto0 init 0.5
   *   gk_blue_auto0 chnexport "gk_blue_auto0", 3
   *   ...
   */
  private buildParameterInits(parameters: Parameter[]): string {
    const lines: string[] = [];

    for (const param of parameters) {
      const varName = param.getCompilationVarName();
      if (!varName) continue;

      // Get initial value
      const initialVal = param.isAutomationEnabled()
        ? param.getValue(this.renderStartTime)
        : param.getFixedValue();

      // Init statement
      lines.push(`${varName}\tinit\t${initialVal}`);

      // chnexport for real-time API
      lines.push(`${varName}\tchnexport\t"${varName}",\t3`);
    }

    return lines.join('\n');
  }

  /**
   * Collect all StringChannels from BSB instruments in the arrangement.
   * Mirrors Java's getStringChannels() method.
   */
  private collectStringChannels(): Array<{ objectName: string; value: string; channelName: string }> {
    const channels: Array<{ objectName: string; value: string; channelName: string }> = [];
    let idx = 0;

    for (const ia of this.arrangement.getArrangement()) {
      if (!ia.enabled || !ia.instr) continue;
      const instr = ia.instr as any;
      if (typeof instr.getStringChannels === 'function') {
        for (const sc of instr.getStringChannels()) {
          const channelName = `gS_blue_str${idx++}`;
          channels.push({
            objectName: sc.objectName,
            value: sc.value,
            channelName,
          });
        }
      }
    }

    return channels;
  }

  /**
   * Build string channel init statements for globalOrc.
   * Mirrors Java's handleParameters() string channel handling.
   *
   * Output:
   *   gS_blue_str0 = "/path/to/file.wav"
   *   gS_blue_str0 chnexport "gS_blue_str0", 3
   *   ...
   */
  private buildStringChannelInits(channels: Array<{ objectName: string; value: string; channelName: string }>): string {
    const lines: string[] = [];

    for (const sc of channels) {
      lines.push(`${sc.channelName}\t=\t"${sc.value}"`);
      lines.push(`${sc.channelName}\tchnexport\t"${sc.channelName}",\t3`);
    }

    return lines.join('\n');
  }

  // ─── DeepCopy ───

  deepCopy(): BlueDataObject {
    // For Phase 3: shallow copy of structure
    const copy = new BlueData();
    copy.version = this.version;
    copy.arrangement = new Arrangement(this.arrangement);
    copy.projectProperties = new ProjectProperties(this.projectProperties);
    copy.tableSet = new Tables(this.tableSet);
    copy.globalOrcSco = new GlobalOrcSco(this.globalOrcSco);
    copy.renderStartTime = this.renderStartTime;
    copy.renderEndTime = this.renderEndTime;
    copy.loopRendering = this.loopRendering;
    return copy;
  }
}
