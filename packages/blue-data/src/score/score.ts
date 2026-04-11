/**
 * Score — the main score container holding layer groups.
 * Mirrors the Java Score class.
 *
 * A Score contains a list of LayerGroups (which can be PolyObject groups,
 * Audio layer groups, or Pattern layer groups). It also holds the TimeContext,
 * TimeState, and NoteProcessorChain.
 */
import { TimeContext } from '../time/time-context';
import { TimeState } from '../time/time-state';
import { NoteProcessorChain } from '../note-processors/note-processor-chain';
import { LayerGroup } from './layers/layer-group';
import { Layer } from './layers/layer';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { ScoreGenerationException } from './score-generation-exception';
import { CompileData } from '../compile-data';
import { NoteList } from '../sound-objects/note-list';
import { PolyObject } from '../sound-objects/poly-object';
import { PolyObjectLayerGroupProvider } from '../sound-objects/poly-object-layer-group-provider';
import { LayerGroupProviderManager } from './layers/layer-group-provider-manager';

export class Score extends Array<LayerGroup<Layer>> {
  private timeContext = new TimeContext();
  private timeState = new TimeState();
  private npc = new NoteProcessorChain();

  constructor(other?: Score) {
    super();
    if (other) {
      this.timeContext = new TimeContext(); // Fresh copy from XML
      this.timeState = new TimeState();
      this.npc = new NoteProcessorChain(other.npc);
      // LayerGroups deep-copied by caller
    }
  }

  getTimeContext(): TimeContext {
    return this.timeContext;
  }

  setTimeContext(context: TimeContext): void {
    this.timeContext = context;
  }

  getTimeState(): TimeState {
    return this.timeState;
  }

  setTimeState(state: TimeState): void {
    this.timeState = state;
  }

  getNoteProcessorChain(): NoteProcessorChain {
    return this.npc;
  }

  setNoteProcessorChain(npc: NoteProcessorChain): void {
    this.npc = npc;
  }

  /**
   * Generate the complete score output for CSD.
   * Iterates all LayerGroups and collects their NoteLists.
   */
  generateForCSD(compileData: CompileData, startTime: number, endTime: number): NoteList {
    const noteList = new NoteList();
    const context = this.timeContext;
    const hasSolo = this.some((lg) => lg.hasSoloLayers());

    for (const layerGroup of this) {
      if (!hasSolo) {
        // No solo layers — generate all non-muted layers
        const nl = layerGroup.generateForCSD(context, compileData, startTime, endTime, false);
        noteList.merge(nl);
      } else {
        // Solo mode — generate only solo layers
        const nl = layerGroup.generateForCSD(context, compileData, startTime, endTime, true);
        noteList.merge(nl);
      }
    }

    return noteList;
  }

  // ─── XML Serialization ───

  saveAsXML(objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('score');
    elem.addElement(this.timeContext.saveAsXML().setName('timeContext'));
    elem.addElement(this.timeState.saveAsXML().setName('timeState'));
    elem.addElement(this.npc.saveAsXML().setName('noteProcessorChain'));

    // Serialize layer groups — they self-identify by their XML element name
    for (const lg of this) {
      const lgXml = lg.saveAsXML(objRefMap);
      elem.addElement(lgXml);
    }

    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): Score {
    const score = new Score();

    const nodes = data.getElements();

    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      const nodeName = node.getName();

      switch (nodeName) {
        case 'timeContext':
          score.timeContext = TimeContext.loadFromXML(node);
          break;
        case 'timeState':
          score.timeState = TimeState.loadFromXML(node);
          break;
        case 'noteProcessorChain':
          score.npc = NoteProcessorChain.loadFromXML(node);
          break;
        case 'polyObject':
          // Root PolyObject — legacy format from before 2.3.0
          // For Phase 3: skip — upgrade system handles this
          break;
        case 'audioLayerGroup':
          // Audio layer groups are registered by the audio module
          // For Phase 3, skip — handled in Phase 5
          break;
        case 'patternsLayerGroup':
          // Pattern layer groups are registered by the patterns module
          // For Phase 3, skip — handled in Phase 6
          break;
        case 'scoreObjectLayerGroup':
          // Generic layer group — may contain PolyObject-based layers
          break;
      }
    }

    return score;
  }
}
