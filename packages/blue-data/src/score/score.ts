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
import { AudioLayerGroup } from './audio/audio-layer-group';
import { PatternsLayerGroup } from './patterns/patterns-layer-group';

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
    console.log(`[Score.generateForCSD] layerGroups: ${this.length}, start: ${startTime}, end: ${endTime}`);

    const noteList = new NoteList();
    const context = this.timeContext;
    const hasSolo = this.some((lg) => lg.hasSoloLayers());
    console.log(`[Score.generateForCSD] hasSolo: ${hasSolo}`);

    for (let i = 0; i < this.length; i++) {
      const layerGroup = this[i];
      console.log(`[Score.generateForCSD] LayerGroup ${i}: ${layerGroup.getName()}, type: ${layerGroup.constructor.name}`);

      if (!hasSolo) {
        // No solo layers — generate all non-muted layers
        const nl = layerGroup.generateForCSD(context, compileData, startTime, endTime, false);
        console.log(`[Score.generateForCSD] LayerGroup ${i} generated ${nl.length} notes`);
        noteList.merge(nl);
      } else {
        // Solo mode — generate only solo layers
        const nl = layerGroup.generateForCSD(context, compileData, startTime, endTime, true);
        console.log(`[Score.generateForCSD] LayerGroup ${i} (solo) generated ${nl.length} notes`);
        noteList.merge(nl);
      }
    }

    console.log(`[Score.generateForCSD] Total notes: ${noteList.length}`);
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
      console.log(`[Score.loadFromXML] Found element: ${nodeName}`);

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
        case 'soundObject': {
          // Check if this is a PolyObject (contains soundLayer elements)
          const type = node.getAttribute('type');
          if (type === 'PolyObject' || node.hasElement('soundLayer')) {
            console.log(`[Score.loadFromXML] soundObject is PolyObject → pushing`);
            score.push(PolyObject.loadFromXML(node));
            console.log(`[Score.loadFromXML] Score now has ${score.length} layer groups`);
          } else {
            console.log(`[Score.loadFromXML] soundObject type=${type || '(no type)'}`);
          }
          break;
        }
        case 'polyObject':
          console.log(`[Score.loadFromXML] polyObject → pushing`);
          score.push(PolyObject.loadFromXML(node));
          console.log(`[Score.loadFromXML] Score now has ${score.length} layer groups`);
          break;
        case 'audioLayerGroup':
          console.log(`[Score.loadFromXML] audioLayerGroup → pushing`);
          score.push(AudioLayerGroup.loadFromXML(node));
          console.log(`[Score.loadFromXML] Score now has ${score.length} layer groups`);
          break;
        case 'patternsLayerGroup':
          console.log(`[Score.loadFromXML] patternsLayerGroup → pushing`);
          score.push(PatternsLayerGroup.loadFromXML(node));
          console.log(`[Score.loadFromXML] Score now has ${score.length} layer groups`);
          break;
        case 'scoreObjectLayerGroup':
          console.log(`[Score.loadFromXML] scoreObjectLayerGroup (generic)`);
          break;
        default:
          console.log(`[Score.loadFromXML] Unknown: ${nodeName}`);
      }
    }

    console.log(`[Score.loadFromXML] Final count: ${score.length} layer groups`);
    return score;
  }
}
