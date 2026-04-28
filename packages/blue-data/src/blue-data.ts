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
import { Element } from "./serialization/xml-reader";
import { ObjRefSaveMap, ObjRefLoadMap } from "./serialization/obj-ref-map";
import { UpgradeManager } from "./migration/upgrade-manager";
import { BLUE_VERSION } from "./blue-constants";
import { Arrangement } from "./arrangement";
import { ProjectProperties } from "./project-properties";
import { SoundObjectLibrary } from "./sound-objects/sound-object-library";
import { GlobalOrcSco } from "./global-orc-sco";
import { Tables } from "./tables";
import { LiveData } from "./live-data";
import { Score } from "./score/score";
import { ScratchPadData } from "./scratch-pad-data";
import { NoteProcessorChainMap } from "./note-processors/note-processor-chain-map";
import { MarkersList } from "./markers-list";
import { MidiInputProcessor } from "./midi/midi-input-processor";
import { InstrumentLibrary } from "./instruments/instrument-library";
import { Instrument } from "./instruments/instrument";
import { CompileData } from "./compile-data";
import { BlueDataObject } from "./blue-data-object";
import { NoteList } from "./sound-objects/note-list";
import { Mixer } from "./mixer/mixer";
import { OpcodeList } from "./opcodes/opcode-list";
import {
  getAllParameters,
  assignParameterNames,
} from "./automation/parameter-helper";
import { Parameter } from "./automation/parameter";
import { BSBCompilationUnit } from "./instruments/blue-synth-builder/bsb-compilation-unit";
import { Effect } from "./mixer/effect";
import { EffectsChain } from "./mixer/effects-chain";
import { Send } from "./mixer/send";
import { UDOStyle } from "./opcodes/udo-style";
import { formatBlueNumber, formatJavaDouble } from "./utilities/number-format";
import { disposeJavaScriptCompileState } from './javascript-runtime';

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

  getVersion(): string {
    return this.version;
  }
  setVersion(v: string): void {
    this.version = v;
  }

  getArrangement(): Arrangement {
    return this.arrangement;
  }
  setArrangement(a: Arrangement): void {
    this.arrangement = a;
  }

  getProjectProperties(): ProjectProperties {
    return this.projectProperties;
  }
  setProjectProperties(p: ProjectProperties): void {
    this.projectProperties = p;
  }

  getSoundObjectLibrary(): SoundObjectLibrary {
    return this.sObjLib;
  }
  setSoundObjectLibrary(s: SoundObjectLibrary): void {
    this.sObjLib = s;
  }

  getGlobalOrcSco(): GlobalOrcSco {
    return this.globalOrcSco;
  }
  setGlobalOrcSco(g: GlobalOrcSco): void {
    this.globalOrcSco = g;
  }

  getTableSet(): Tables {
    return this.tableSet;
  }
  setTableSet(t: Tables): void {
    this.tableSet = t;
  }

  getScore(): Score {
    return this.score;
  }
  setScore(s: Score): void {
    this.score = s;
  }

  getLiveData(): LiveData {
    return this.liveData;
  }
  setLiveData(l: LiveData): void {
    this.liveData = l;
  }

  getScratchPadData(): ScratchPadData {
    return this.scratchData;
  }
  setScratchPadData(s: ScratchPadData): void {
    this.scratchData = s;
  }

  getNoteProcessorChainMap(): NoteProcessorChainMap {
    return this.noteProcessorChainMap;
  }
  setNoteProcessorChainMap(n: NoteProcessorChainMap): void {
    this.noteProcessorChainMap = n;
  }

  getMarkersList(): MarkersList {
    return this.markersList;
  }
  setMarkersList(m: MarkersList): void {
    this.markersList = m;
  }

  getMidiInputProcessor(): MidiInputProcessor {
    return this.midiInputProcessor;
  }
  setMidiInputProcessor(m: MidiInputProcessor): void {
    this.midiInputProcessor = m;
  }

  getMixer(): Mixer {
    return this.mixer;
  }
  setMixer(m: Mixer): void {
    this.mixer = m;
  }

  getOpcodeList(): OpcodeList {
    return this.opcodeList;
  }
  setOpcodeList(o: OpcodeList): void {
    this.opcodeList = o;
  }

  getRenderStartTime(): number {
    return this.renderStartTime;
  }
  setRenderStartTime(t: number): void {
    this.renderStartTime = t;
  }

  getRenderEndTime(): number {
    return this.renderEndTime;
  }
  setRenderEndTime(t: number): void {
    this.renderEndTime = t;
  }

  isLoopRendering(): boolean {
    return this.loopRendering;
  }
  setLoopRendering(l: boolean): void {
    this.loopRendering = l;
  }

  getPluginData(): BlueDataObject[] {
    return this.pluginData;
  }

  // ─── Loading ───

  /**
   * Load BlueData from an XML string.
   * Automatically applies migrations if the file version is old.
   */
  static loadFromString(xmlString: string): BlueData {
    const rootElement = Element.parse(xmlString);

    if (rootElement.getName() !== "blueData") {
      throw new Error(
        `Expected root element "blueData", got "${rootElement.getName()}"`,
      );
    }

    // Apply migrations
    UpgradeManager.getInstance().performUpgrades(rootElement);

    const objRefMap = new ObjRefLoadMap();
    const blueData = new BlueData();

    const versionAttr = rootElement.getAttribute("version");
    if (versionAttr) blueData.setVersion(versionAttr);

    const nodes = rootElement.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      const nodeName = node.getName();
      console.log(`[BlueData.loadFromString] Found element: ${nodeName}`);

      switch (nodeName) {
        case "projectProperties":
          blueData.projectProperties = ProjectProperties.loadFromXML(node);
          break;
        case "arrangement":
          blueData.arrangement = Arrangement.loadFromXML(node);
          break;
        case "instrumentLibrary":
          console.log(
            `[BlueData.loadFromString] instrumentLibrary found (instruments stub)`,
          );
          break;
        case "tables":
          blueData.tableSet = Tables.loadFromXML(node);
          break;
        case "globalOrcSco":
          blueData.globalOrcSco = GlobalOrcSco.loadFromXML(node);
          break;
        case "score":
          blueData.score = Score.loadFromXML(node, objRefMap);
          break;
        case "liveData":
          blueData.liveData = LiveData.loadFromXML(node, objRefMap);
          break;
        case "scratchPadData":
          blueData.scratchData = ScratchPadData.loadFromXML(node);
          break;
        case "noteProcessorChainMap":
          blueData.noteProcessorChainMap =
            NoteProcessorChainMap.loadFromXML(node);
          break;
        case "renderStartTime":
          blueData.renderStartTime = parseFloat(node.getTextString());
          break;
        case "renderEndTime":
          blueData.renderEndTime = parseFloat(node.getTextString());
          break;
        case "markersList":
          blueData.markersList = MarkersList.loadFromXML(node);
          break;
        case "loopRendering":
          blueData.loopRendering =
            node.getTextString().toLowerCase() === "true";
          break;
        case "midiInputProcessor":
          blueData.midiInputProcessor = MidiInputProcessor.loadFromXML(node);
          break;
        case "mixer":
          blueData.mixer = Mixer.loadFromXML(node);
          break;
        case "opcodeList":
          // OpcodeList at root level — global UDO list
          blueData.opcodeList = OpcodeList.loadFromXML(node);
          break;
        case "pluginData":
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
    const root = new Element("blueData");
    root.setAttribute("version", this.version);

    root.addElement(this.projectProperties.saveAsXML(objRefMap));
    root.addElement(this.arrangement.saveAsXML());
    root.addElement(this.mixer.saveAsXML());
    root.addElement(this.tableSet.saveAsXML());
    root.addElement(this.sObjLib.saveAsXML(objRefMap));
    root.addElement(this.globalOrcSco.saveAsXML());
    root.addElement(this.opcodeList.saveAsXML());
    root.addElement(this.liveData.saveAsXML(objRefMap));
    root.addElement(this.score.saveAsXML(objRefMap));
    root.addElement(this.scratchData.saveAsXML());
    root.addElement(this.noteProcessorChainMap.saveAsXML());
    root.addElement("renderStartTime").setText(this.renderStartTime.toString());
    root.addElement("renderEndTime").setText(this.renderEndTime.toString());
    root.addElement(this.markersList.saveAsXML());
    root.addElement("loopRendering").setText(this.loopRendering.toString());
    root.addElement(this.midiInputProcessor.saveAsXML());

    const pluginDataElem = root.addElement("pluginData");
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
    let generationError: unknown = null;

    try {
      const channelIdAssignments = this.assignChannelIds();
      for (const [channel, id] of channelIdAssignments) {
        compileData.getChannelIdAssignments().set(channel, id);
      }

      // Build CsInstruments header (sr/ksmps/nchnls/0dbfs go here, not in CsOptions)
      const orchestraHeader = this.buildOrchestraHeader();
      const nchnls = this.getNchnls();

      // Global orchestra/sco from stored data
      let globalOrc = this.globalOrcSco.getGlobalOrc() || "";
      let globalSco = this.globalOrcSco.getGlobalSco() || "";

      const appendGlobalOrc = (section: string) => {
        if (!section) {
          return;
        }
        globalOrc += `\n${section}`;
      };

      // Mixer init statements
      if (this.mixer.isEnabled()) {
        const mixerInits = this.mixer.getInitStatements(
          channelIdAssignments,
          nchnls,
        );
        if (mixerInits) {
          // Java appends an extra newline after mixer init statements before
          // adding them to GlobalOrcSco, which preserves a two-blank-line gap
          // before parameter init statements.
          appendGlobalOrc(`${mixerInits}\n\n`);
        }
      }

      // UDO list from OpcodeList — collect and deduplicate by name
      const udoSet = new Map<string, string>(); // name → full UDO text
      for (const udo of this.opcodeList.getOpcodes()) {
        const text = udo.toCSD();
        if (text && udo.getName()) udoSet.set(udo.getName(), text);
      }

      // Also collect UDOs from BSB instruments (deduplicated)
      for (const ia of this.arrangement.getArrangement()) {
        if (!ia.enabled || !ia.instr) continue;
        const instr = ia.instr as any;
        if (typeof instr.getOpcodeList === "function") {
          for (const udo of instr.getOpcodeList().getOpcodes()) {
            const text = udo.toCSD();
            if (text && udo.getName() && !udoSet.has(udo.getName())) {
              udoSet.set(udo.getName(), text);
            }
          }
        }
      }

      // Parameter and string-channel init statements are appended to the stored
      // global orchestra text as one block, matching Java handleParameters().
      const parameters = getAllParameters(this.arrangement, this.mixer);
      assignParameterNames(parameters);
      const stringChannels = this.collectStringChannels();
      const stringInits = this.buildStringChannelInits(stringChannels);
      const paramInits = this.buildParameterInits(parameters);
      const runtimeInitStatements = [stringInits, paramInits]
        .filter((section) => section.length > 0)
        .join("\n");
      if (runtimeInitStatements) {
        appendGlobalOrc(`${runtimeInitStatements}\n`);
      }

      // F-tables
      const ftables = this.tableSet.getAllTables();

      // Build per-instrument parameter map for BSB compilation
      const parameterMap = this.buildParameterMap();

      // Mixer → effect UDOs + always-on instruments + BlueMixer
      let mixerEffectUDOs: string[] = [];
      let mixerInstruments = "";
      if (this.mixer.isEnabled()) {
        const mixerOutput = this.generateMixerOrchestra(
          channelIdAssignments,
          nchnls,
          parameterMap,
          parameters,
        );
        mixerEffectUDOs = mixerOutput.effectUDOs;
        mixerInstruments = mixerOutput.instrumentsText;
      }

      const arrangementGlobalOrc = this.arrangement.generateGlobalOrc(compileData);
      const allUDOText = [...Array.from(udoSet.values()), ...mixerEffectUDOs];
      const udoText = allUDOText.length > 0 ? `${allUDOText.join("\n")}\n` : "";

      // Arrangement → orchestra
      const orc = this.arrangement.generateOrchestra(
        compileData,
        this.mixer,
        nchnls,
        parameterMap,
      );

      // Score → score events
      const startTime = this.renderStartTime;
      const endTime = this.renderEndTime;
      const noteList = this.score.generateForCSD(compileData, startTime, endTime);

      // Tempo statement from TempoMap
      const tempoMap = this.score.getTimeContext().getTempoMap();
      const tempoStatement =
        tempoMap.getTempo() !== 60 ? `t 0 ${formatJavaDouble(tempoMap.getTempo())}` : "";

      // Compute totalDur for always-on scheduling
      let totalDur = 0;
      if (noteList && noteList.length > 0) {
        for (let i = 0; i < noteList.length; i++) {
          const note = noteList.getNote(i);
          const end = note.getStartTime() + note.getSubjectiveDuration();
          if (end > totalDur) totalDur = end;
        }
      }

      // Build score text with tempo, always-on events
      const scoreText = this.buildScoreText(
        ftables,
        globalSco,
        noteList,
        tempoStatement,
        totalDur,
      );

      // Build project info comments
      const projectInfo = this.buildProjectInfo();

      // Assemble CSD (no CsOptions for realtime output)
      return (
        projectInfo +
        "<CsoundSynthesizer>\n\n" +
        "<CsInstruments>\n" +
        orchestraHeader +
        "\n\n" +
        globalOrc +
        "\n\n" +
        arrangementGlobalOrc +
        "\n\n" +
        udoText +
        "\n\n" +
        orc +
        mixerInstruments +
        "\n\n</CsInstruments>\n\n" +
        "<CsScore>\n\n" +
        scoreText +
        "</CsScore>\n\n" +
        "</CsoundSynthesizer>"
      );
    } catch (error) {
      generationError = error;
      throw error;
    } finally {
      try {
        disposeJavaScriptCompileState(compileData);
      } catch (cleanupError) {
        if (generationError === null) {
          throw cleanupError;
        }
        console.warn('[BlueData.toCSD] Failed to dispose JavaScript runtime state:', cleanupError);
      }
    }
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

    return lines.join("\n");
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
  private assignChannelIds(): Map<import("./mixer/channel").Channel, number> {
    const assignments = new Map<import("./mixer/channel").Channel, number>();
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
   * Build the score section with F-tables, tempo, globalSco, notes, and always-on events.
   */
  private buildScoreText(
    ftables: string,
    globalSco: string,
    noteList: import("./sound-objects/note-list").NoteList,
    tempoStatement: string,
    totalDur: number,
  ): string {
    const noteLines: string[] = [];

    // Generated notes
    if (noteList && noteList.length > 0) {
      for (let i = 0; i < noteList.length; i++) {
        noteLines.push(noteList.getNote(i).toScoreText());
      }
    }

    // Always-on instrument events
    if (totalDur > 0 && this.mixer.isEnabled()) {
      const renderDur = totalDur + this.mixer.getExtraRenderTime();
      const arrangementItems = this.arrangement
        .getArrangement()
        .filter((ia) => ia.enabled && ia.instr);
      const nextInstrId = arrangementItems.length + 1;

      // Schedule always-on instruments for instruments with alwaysOnInstrumentText
      for (let i = 0; i < arrangementItems.length; i++) {
        const instr = arrangementItems[i].instr as any;
        if (
          typeof instr.getAlwaysOnInstrumentText === "function" &&
          instr.getAlwaysOnInstrumentText()
        ) {
          noteLines.push(`i${nextInstrId + i}\t0\t${renderDur}\t`);
        }
      }

      // Schedule BlueMixer
      noteLines.push(`i"BlueMixer"\t0\t${renderDur}\t`);
    }

    let scoreGlobalText = globalSco;
    if (tempoStatement) {
      scoreGlobalText += `${scoreGlobalText ? "" : "\n"}${tempoStatement}\n`;
    }

    const scoreNotesText = noteLines.length > 0
      ? `${noteLines.join("\n")}\n`
      : `f0 ${totalDur}\n`;

    return `${ftables}\n\n${scoreGlobalText}\n\n\n${scoreNotesText}e\n\n`;
  }

  /**
   * Build project info comments for the top of the CSD.
   * Mirrors Java's appendProjectInfo().
   */
  private buildProjectInfo(): string {
    const props = this.projectProperties;
    const notes = (props.notes || "").replace(/\n/g, "\n; ");

    return (
      ";\n" +
      `; "${props.title || ""}"\n` +
      `; by ${props.author || ""}\n` +
      ";\n" +
      `; ${notes}\n;\n` +
      `; Generated by blue ${BLUE_VERSION} (http://blue.kunstmusik.com)\n` +
      ";\n\n"
    );
  }

  /**
   * Build parameter init statements for globalOrc.
   * Uses standard chnexport so blue-engine can drive native Csound channels
   * and mirror them into shared memory for external readers.
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
      lines.push(`${varName} init ${formatBlueNumber(initialVal)}`);

      // Standard Csound channel export for engine-side channel bridging
      lines.push(`${varName} chnexport "${varName}", 3`);
    }

    return lines.join("\n");
  }

  /**
   * Collect all StringChannels from BSB instruments in the arrangement.
   * Mirrors Java's getStringChannels() method.
   */
  private collectStringChannels(): Array<{
    objectName: string;
    value: string;
    channelName: string;
  }> {
    const channels: Array<{
      objectName: string;
      value: string;
      channelName: string;
    }> = [];
    let idx = 0;

    for (const ia of this.arrangement.getArrangement()) {
      if (!ia.enabled || !ia.instr) continue;
      const instr = ia.instr as any;
      if (typeof instr.getStringChannels === "function") {
        for (const sc of instr.getStringChannels()) {
          const channelName = `gS_blue_str${idx++}`;
          sc.channelName = channelName;
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
   * Build a per-instrument parameter map for BSB compilation.
   * Each instrument gets its own Parameter[] with compilationVarName set.
   * This is used by generateInstrument() to replace widget values with gk_blue_autoN.
   */
  private buildParameterMap(): Map<Instrument, Parameter[]> {
    const map = new Map<Instrument, Parameter[]>();

    for (const ia of this.arrangement.getArrangement()) {
      if (!ia.enabled || !ia.instr) continue;
      const instr = ia.instr as any;
      if (typeof instr.getParameters === "function") {
        const instrParams = instr.getParameters();
        if (
          instrParams &&
          Array.isArray(instrParams) &&
          instrParams.length > 0
        ) {
          map.set(ia.instr, instrParams);
        }
      }
    }

    return map;
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
  private buildStringChannelInits(
    channels: Array<{ objectName: string; value: string; channelName: string }>,
  ): string {
    const lines: string[] = [];

    for (const sc of channels) {
      lines.push(`${sc.channelName} = "${sc.value}"`);
      lines.push(`${sc.channelName} chnexport "${sc.channelName}", 3`);
    }

    return lines.join("\n");
  }

  /**
   * Generate the mixer's orchestra code: effect UDOs, always-on instruments,
   * and the BlueMixer instrument.
   *
   * Output structure:
   *   opcode blueEffect0,aa,aa ; EffectName
   *   ...
   *   endop
   *
   *   instr 4  ; always-on for instrument 1
   *   ...
   *   endin
   *   instr 5  ; always-on for instrument 2
   *   ...
   *   endin
   *
   *   instr BlueMixer
   *   ...
   *   endin
   */
  private generateMixerOrchestra(
    channelIdAssignments: Map<import("./mixer/channel").Channel, number>,
    nchnls: number,
    parameterMap: Map<Instrument, Parameter[]>,
    _allParameters: Parameter[],
  ): { effectUDOs: string[]; instrumentsText: string; effectIdMap: Map<Effect, number> } {
    const instrBuffer: string[] = [];
    const sourceChannels = this.mixer.getAllSourceChannels();
    const subChannels = this.sortSubChannelsForRendering(
      Array.from(this.mixer.getSubChannels()),
    );

    let effectId = 0;
    const effectUDOs: string[] = [];
    const effectIdMap = new Map<Effect, number>();
    const nestedOpcodes = new OpcodeList();

    const registerEffects = (chain: EffectsChain) => {
      for (const item of chain) {
        if (!(item instanceof Effect) || !item.isEnabled() || effectIdMap.has(item)) {
          continue;
        }

        const replacements = this.registerNestedEffectOpcodes(
          item,
          nestedOpcodes,
          effectUDOs,
        );
        const udo = this.applyOpcodeNameReplacements(
          item.generateUDO(effectId),
          replacements,
        );
        if (!udo) {
          continue;
        }

        effectIdMap.set(item, effectId);
        effectUDOs.push(udo);
        effectId++;
      }
    };

    for (const channel of sourceChannels) {
      registerEffects(channel.getPreEffects());
      registerEffects(channel.getPostEffects());
    }

    for (const subChannel of subChannels) {
      registerEffects(subChannel.getPreEffects());
      registerEffects(subChannel.getPostEffects());
    }

    registerEffects(this.mixer.getMaster().getPreEffects());
    registerEffects(this.mixer.getMaster().getPostEffects());

    // Generate always-on instruments from BSB instruments' alwaysOnInstrumentText
    const arrangementItems = this.arrangement
      .getArrangement()
      .filter((ia) => ia.enabled && ia.instr);
    const nextInstrId = arrangementItems.length + 1;

    for (let i = 0; i < arrangementItems.length; i++) {
      const ia = arrangementItems[i];
      const instr = ia.instr as any;
      if (typeof instr.getAlwaysOnInstrumentText !== "function") continue;
      const alwaysOnText = instr.getAlwaysOnInstrumentText();
      if (!alwaysOnText) continue;

      // Compile the always-on instrument text with BSB widget replacement
      const instrParams = parameterMap.get(ia.instr!);
      const unit = new BSBCompilationUnit();
      if (typeof instr.getGraphicInterface === "function") {
        instr.getGraphicInterface().collectReplacements(unit, instrParams);
      }
      let compiled = unit.replaceBSBValues(alwaysOnText);

      // Replace blueMixerIn/blueMixerOut with mixer channel routing
      const channelId = channelIdAssignments.get(sourceChannels[i]);
      if (channelId !== undefined) {
        // "aLeft, aRight\tblueMixerIn" → "aLeft = ga_bluemix_{id}_0\n aRight = ga_bluemix_{id}_1"
        compiled = compiled.replace(
          /(\w+),\s*(\w+)\s+blueMixerIn/g,
          `$1 = ga_bluemix_${channelId}_0\n $2 = ga_bluemix_${channelId}_1`,
        );
        // "blueMixerOut aLeft, aRight" → "ga_bluemix_{id}_0 = aLeft\nga_bluemix_{id}_1 = aRight"
        compiled = compiled.replace(
          /blueMixerOut(\s+\w+),(\s*\w+)/g,
          `ga_bluemix_${channelId}_0 = $1\nga_bluemix_${channelId}_1 = $2`,
        );
      }

      const alwaysOnId = nextInstrId + i;
      instrBuffer.push(`\tinstr ${alwaysOnId}\t;untitled`);
      instrBuffer.push(compiled);
      instrBuffer.push("");
      instrBuffer.push("\tendin");
      instrBuffer.push("");
    }

    // Generate BlueMixer instrument
    const blueMixerCode = this.generateBlueMixer(
      sourceChannels,
      subChannels,
      channelIdAssignments,
      nchnls,
      effectIdMap,
    );
    instrBuffer.push(blueMixerCode);

    return {
      effectUDOs,
      instrumentsText: instrBuffer.join("\n"),
      effectIdMap,
    };
  }

  /**
   * Generate the BlueMixer instrument.
   * Routes audio through volumes, sends, effect UDOs, and outputs via outc.
   */
  private generateBlueMixer(
    sourceChannels: import("./mixer/channel").Channel[],
    subChannels: import("./mixer/channel").Channel[],
    channelIdAssignments: Map<import("./mixer/channel").Channel, number>,
    nchnls: number,
    effectIdMap: Map<Effect, number>,
  ): string {
    const lines: string[] = [];

    lines.push("\tinstr BlueMixer\t;Blue Mixer Instrument");

    // Process each source channel
    for (const channel of sourceChannels) {
      const channelId = channelIdAssignments.get(channel);
      if (channelId === undefined) continue;
      const signalVars = this.getSourceSignalVars(channelId, nchnls);

      this.applyEffectsChain(channel.getPreEffects(), signalVars, effectIdMap, lines);
      this.applyChannelLevel(signalVars, channel.getLevelParameter(), channel.getLevel(), lines);
      this.applyEffectsChain(channel.getPostEffects(), signalVars, effectIdMap, lines);
      this.routeChannelOutput(signalVars, channel.getOutChannel(), channel.getName(), lines);
    }

    // Process sub-channels
    for (const subChannel of subChannels) {
      const signalVars = this.getSubChannelSignalVars(subChannel.getName(), nchnls);

      this.applyEffectsChain(subChannel.getPreEffects(), signalVars, effectIdMap, lines);
      this.applyChannelLevel(signalVars, subChannel.getLevelParameter(), subChannel.getLevel(), lines);
      this.applyEffectsChain(subChannel.getPostEffects(), signalVars, effectIdMap, lines);
      this.routeChannelOutput(signalVars, subChannel.getOutChannel(), subChannel.getName(), lines);
    }

    const masterChannel = this.mixer.getMaster();
    const masterVars = this.getSubChannelSignalVars("Master", nchnls);
    this.applyEffectsChain(masterChannel.getPreEffects(), masterVars, effectIdMap, lines);
    this.applyChannelLevel(masterVars, masterChannel.getLevelParameter(), masterChannel.getLevel(), lines);
    this.applyEffectsChain(masterChannel.getPostEffects(), masterVars, effectIdMap, lines);
    lines.push(`outc ${masterVars.join(", ")}`);

    // Clear all audio variables
    for (const channel of sourceChannels) {
      const channelId = channelIdAssignments.get(channel);
      if (channelId === undefined) continue;
      for (const signalVar of this.getSourceSignalVars(channelId, nchnls)) {
        lines.push(`${signalVar} = 0`);
      }
    }
    for (const subChannel of subChannels) {
      for (const signalVar of this.getSubChannelSignalVars(subChannel.getName(), nchnls)) {
        lines.push(`${signalVar} = 0`);
      }
    }
    for (const signalVar of masterVars) {
      lines.push(`${signalVar} = 0`);
    }

    lines.push("");
    lines.push("\tendin");
    lines.push("");

    return lines.join("\n");
  }

  private applyEffectsChain(
    chain: EffectsChain,
    signalVars: string[],
    effectIdMap: Map<Effect, number>,
    lines: string[],
  ): void {
    for (const item of chain) {
      if (item instanceof Effect) {
        if (!item.isEnabled()) {
          continue;
        }

        const effectId = effectIdMap.get(item);
        if (effectId === undefined) {
          continue;
        }

        if (item.getStyle() === UDOStyle.MODERN) {
          lines.push(`${signalVars.join(", ")} = blueEffect${effectId}(${signalVars.join(", ")})`);
        } else {
          lines.push(`${signalVars.join(", ")}\tblueEffect${effectId}\t${signalVars.join(", ")}`);
        }
        continue;
      }

      if (!item.isEnabled()) {
        continue;
      }

      const targetName = item.getTargetChannelId() || "Master";
      const amountExpr = this.getSendAmountExpression(item);

      for (let i = 0; i < signalVars.length; i++) {
        const targetVar = this.getSubChannelVar(targetName, i);
        lines.push(`${targetVar}\t+=\t${this.scaleSignal(signalVars[i], amountExpr)}`);
      }
    }
  }

  private applyChannelLevel(
    signalVars: string[],
    levelParam: Parameter,
    fallbackLevel: number,
    lines: string[],
  ): void {
    const compilationVarName = levelParam.getCompilationVarName();
    if (compilationVarName) {
      lines.push(`ktempdb = ampdb(${compilationVarName})`);
      for (const signalVar of signalVars) {
        lines.push(`${signalVar} *= ktempdb`);
      }
      return;
    }

    const multiplier = Math.pow(10, fallbackLevel / 20);
    if (Math.abs(multiplier - 1.0) <= 0.0001) {
      return;
    }

    for (const signalVar of signalVars) {
      lines.push(`${signalVar} *= ${multiplier}`);
    }
  }

  private routeChannelOutput(
    signalVars: string[],
    outChannel: string,
    channelName: string,
    lines: string[],
  ): void {
    const resolvedOutChannel = outChannel || "Master";
    if (resolvedOutChannel === channelName) {
      return;
    }

    for (let i = 0; i < signalVars.length; i++) {
      lines.push(`${this.getSubChannelVar(resolvedOutChannel, i)}\t+=\t${signalVars[i]}`);
    }
  }

  private getSendAmountExpression(send: Send): string {
    const levelParam = send.getLevelParameter();
    const compilationVarName = levelParam.getCompilationVarName();
    if (compilationVarName) {
      return compilationVarName;
    }

    return send.getLevel().toString();
  }

  private scaleSignal(signalVar: string, amountExpr: string): string {
    if (amountExpr === "1" || amountExpr === "1.0") {
      return signalVar;
    }

    return `(${signalVar} * ${amountExpr})`;
  }

  private getSourceSignalVars(channelId: number, nchnls: number): string[] {
    const signalVars: string[] = [];
    for (let i = 0; i < nchnls; i++) {
      signalVars.push(`ga_bluemix_${channelId}_${i}`);
    }
    return signalVars;
  }

  private getSubChannelSignalVars(channelName: string, nchnls: number): string[] {
    const signalVars: string[] = [];
    for (let i = 0; i < nchnls; i++) {
      signalVars.push(this.getSubChannelVar(channelName, i));
    }
    return signalVars;
  }

  private getSubChannelVar(channelName: string, outputIndex: number): string {
    const safeName = channelName === "Master"
      ? "Master"
      : channelName.replace(/\s+/g, "_");
    return `ga_bluesub_${safeName}_${outputIndex}`;
  }

  private sortSubChannelsForRendering(
    subChannels: import("./mixer/channel").Channel[],
  ): import("./mixer/channel").Channel[] {
    const byName = new Map(subChannels.map(channel => [channel.getName(), channel]));
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const ordered: import("./mixer/channel").Channel[] = [];

    const visit = (channel: import("./mixer/channel").Channel) => {
      const name = channel.getName();
      if (visited.has(name) || visiting.has(name)) {
        return;
      }

      visiting.add(name);

      const targets = new Set<string>();
      const outChannel = channel.getOutChannel();
      if (outChannel && outChannel !== "Master" && outChannel !== name && byName.has(outChannel)) {
        targets.add(outChannel);
      }

      for (const send of channel.getSends()) {
        const target = send.getTargetChannelId();
        if (target && target !== "Master" && target !== name && byName.has(target)) {
          targets.add(target);
        }
      }

      for (const target of targets) {
        visit(byName.get(target)!);
      }

      visiting.delete(name);
      visited.add(name);
      ordered.push(channel);
    };

    for (const channel of subChannels) {
      visit(channel);
    }

    return ordered.reverse();
  }

  private registerNestedEffectOpcodes(
    effect: Effect,
    nestedOpcodes: OpcodeList,
    effectUDOs: string[],
  ): Map<string, string> {
    const replacements = new Map<string, string>();
    const pending = effect.getOpcodeList()
      .getOpcodes()
      .map(opcode => opcode.deepCopy() as import("./opcodes/opcode-definition").OpcodeDefinition);

    for (const opcode of pending) {
      const originalName = opcode.getName();
      const existingEquivalent = nestedOpcodes.getNameOfEquivalentCopy(opcode);
      if (existingEquivalent) {
        replacements.set(originalName, existingEquivalent);
        continue;
      }

      if (!nestedOpcodes.isNameUnique(originalName)) {
        const uniqueName = nestedOpcodes.getUniqueName();
        replacements.set(originalName, uniqueName);
        opcode.setName(uniqueName);
      }
    }

    for (const opcode of pending) {
      const originalName = [...replacements.entries()]
        .find(([, replacement]) => replacement === opcode.getName())?.[0]
        ?? opcode.getName();

      if (replacements.has(originalName) && replacements.get(originalName) !== opcode.getName()) {
        // Already renamed above.
      }

      opcode.setCode(
        this.applyOpcodeNameReplacements(opcode.getCode(), replacements),
      );

      const existingEquivalent = nestedOpcodes.getNameOfEquivalentCopy(opcode);
      if (existingEquivalent) {
        replacements.set(originalName, existingEquivalent);
        continue;
      }

      if (!nestedOpcodes.isNameUnique(opcode.getName())) {
        continue;
      }

      nestedOpcodes.addOpcode(opcode);
      effectUDOs.push(opcode.generateCode());
    }

    return replacements;
  }

  private applyOpcodeNameReplacements(
    source: string,
    replacements: Map<string, string>,
  ): string {
    let output = source;
    for (const [from, to] of replacements) {
      if (!from || from === to) {
        continue;
      }

      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      output = output.replace(new RegExp(`\\b${escaped}\\b`, "g"), to);
    }
    return output;
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
