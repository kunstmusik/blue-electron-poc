/**
 * PolyObject — a SoundObject that contains nested SoundLayers with SoundObjects.
 * Mirrors the Java PolyObject class.
 *
 * PolyObject is both a SoundObject (note generator) AND a ScoreObjectLayerGroup.
 * It was the default/only score type before 2.3.0. After 2.3.0, Score became
 * the top-level container, but PolyObject is still used as a nested container.
 */
import { SoundObject } from './sound-object';
import { SoundLayer } from './sound-layer';
import { ScoreObjectLayerGroup } from '../score/layers/score-object-layer-group';
import { AutomatableLayerGroup } from '../score/layers/automatable-layer-group';
import { NoteProcessorChain } from '../note-processors/note-processor-chain';
import { TimeBehavior } from './time-behavior';
import { TimePosition } from '../time/time-position';
import { TimeDuration } from '../time/time-duration';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { NoteList } from './note-list';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { LayerGroupDataEvent, LayerGroupDataEventType } from '../score/layers/layer-group-data-event';
import { LayerGroupListener } from '../score/layers/layer-group-listener';
import { ScoreObjectListener, ScoreObjectEvent, ScoreEventType } from '../score/score-object-event';
import { Layer } from '../score/layers/layer';

export class PolyObject extends Array<SoundLayer>
  implements SoundObject, ScoreObjectLayerGroup<SoundLayer>, AutomatableLayerGroup {

  // ScoreObject properties
  protected _name = 'SoundObject Layer Group';
  protected _startTime = TimePosition.beats(0);
  protected _subjectiveDuration = TimeDuration.beats(4);
  protected _backgroundColor = 0x666699;
  protected _cloneSourceHashCode = 0;

  // SoundObject properties
  private _timeBehavior = TimeBehavior.NONE; // NONE for root PolyObject
  private _repeatPoint: TimeDuration | null = null;
  private _npc = new NoteProcessorChain();
  private _listeners: ScoreObjectListener[] = [];

  // LayerGroup properties
  private _layerGroupListeners: LayerGroupListener[] = [];
  private _defaultHeightIndex = 0;

  constructor(isRoot = false) {
    super();
    if (isRoot) {
      this._name = 'SoundObject Layer Group';
      this._timeBehavior = TimeBehavior.NONE;
    }
  }

  // ─── ScoreObject ───

  getName(): string { return this._name; }
  setName(value: string): void { this._name = value; }

  getStartTime(): TimePosition { return this._startTime; }
  setStartTime(value: TimePosition): void { this._startTime = value; }

  getSubjectiveDuration(): TimeDuration { return this._subjectiveDuration; }
  setSubjectiveDuration(value: TimeDuration): void { this._subjectiveDuration = value; }

  getBackgroundColor(): number { return this._backgroundColor; }
  setBackgroundColor(color: number): void { this._backgroundColor = color; }

  getResizeLeftLimits(_ctx: TimeContext): number[] { return [-Infinity, 0]; }
  getResizeRightLimits(_ctx: TimeContext): number[] { return [0, Infinity]; }
  resizeLeft(_ctx: TimeContext, _newStart: number): void {}
  resizeRight(_ctx: TimeContext, _newEnd: number): void {}

  addScoreObjectListener(listener: ScoreObjectListener): void {
    if (!this._listeners.includes(listener)) this._listeners.push(listener);
  }
  removeScoreObjectListener(listener: ScoreObjectListener): void {
    const i = this._listeners.indexOf(listener);
    if (i !== -1) this._listeners.splice(i, 1);
  }
  getCloneSourceHashCode(): number { return this._cloneSourceHashCode; }

  // ─── SoundObject ───

  getNoteProcessorChain(): NoteProcessorChain { return this._npc; }
  setNoteProcessorChain(chain: NoteProcessorChain): void { this._npc = chain; }

  getTimeBehavior(): TimeBehavior { return this._timeBehavior; }
  setTimeBehavior(behavior: TimeBehavior): void { this._timeBehavior = behavior; }

  getRepeatPoint(): TimeDuration | null { return this._repeatPoint; }
  setRepeatPoint(rp: TimeDuration | null): void { this._repeatPoint = rp; }

  generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    startTime: number,
    endTime: number,
  ): NoteList {
    const noteList = new NoteList();

    for (const layer of this) {
      for (const sObj of layer) {
        const nl = sObj.generateForCSD(context, compileData, startTime, endTime);
        noteList.merge(nl);
      }
    }

    return noteList;
  }

  // ─── LayerGroup ───

  hasSoloLayers(): boolean { return false; }

  newLayerAt(index: number): SoundLayer {
    const layer = new SoundLayer();
    const insertIdx = Math.min(index, this.length);
    this.splice(insertIdx, 0, layer);
    return layer;
  }

  removeLayers(startIdx: number, endIdx: number): void {
    this.splice(startIdx, endIdx - startIdx + 1);
  }

  pushUpLayers(startIdx: number, endIdx: number): void {
    if (startIdx <= 0) return;
    const item = this.splice(startIdx - 1, 1)[0];
    this.splice(endIdx, 0, item);
  }

  pushDownLayers(startIdx: number, endIdx: number): void {
    if (endIdx >= this.length - 1) return;
    const item = this.splice(endIdx + 1, 1)[0];
    this.splice(startIdx, 0, item);
  }

  onLoadComplete(_context: TimeContext): void {
    // Initialize layers if needed
  }

  addLayerGroupListener(listener: LayerGroupListener): void {
    if (!this._layerGroupListeners.includes(listener)) {
      this._layerGroupListeners.push(listener);
    }
  }

  removeLayerGroupListener(listener: LayerGroupListener): void {
    const i = this._layerGroupListeners.indexOf(listener);
    if (i !== -1) this._layerGroupListeners.splice(i, 1);
  }

  // ─── XML Serialization ───

  saveAsXML(objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('polyObject');
    elem.setAttribute('type', 'PolyObject');
    elem.setAttribute('name', this._name);
    elem.setAttribute('timeBehavior', this._timeBehavior);
    elem.setAttribute('startTime', this._startTime.getValue().toString());
    elem.setAttribute('duration', this._subjectiveDuration.getValue().toString());
    elem.setAttribute('backgroundColor', this._backgroundColor.toString());
    elem.setAttribute('defaultHeightIndex', this._defaultHeightIndex.toString());

    for (const layer of this) {
      const layerElem = new Element('soundLayer');
      layerElem.setAttribute('name', layer.getName());

      for (const sObj of layer) {
        const sObjXml = sObj.saveAsXML(objRefMap);
        sObjXml.setName('soundObject');
        layerElem.addElement(sObjXml);
      }

      elem.addElement(layerElem);
    }

    elem.addElement(this._npc.saveAsXML().setName('noteProcessorChain'));

    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): PolyObject {
    const pObj = new PolyObject(false);

    // Attributes
    const nameAttr = data.getAttribute('name');
    if (nameAttr) pObj._name = nameAttr;

    const tbAttr = data.getAttribute('timeBehavior');
    if (tbAttr && Object.values(TimeBehavior).includes(tbAttr as TimeBehavior)) {
      pObj._timeBehavior = tbAttr as TimeBehavior;
    }

    const startAttr = data.getAttribute('startTime');
    if (startAttr) pObj._startTime = TimePosition.beats(parseFloat(startAttr));

    const durAttr = data.getAttribute('duration');
    if (durAttr) pObj._subjectiveDuration = TimeDuration.beats(parseFloat(durAttr));

    const colorAttr = data.getAttribute('backgroundColor');
    if (colorAttr) pObj._backgroundColor = parseInt(colorAttr, 10);

    const dhiAttr = data.getAttribute('defaultHeightIndex');
    if (dhiAttr) pObj._defaultHeightIndex = parseInt(dhiAttr, 10);

    // Child elements
    const nodes = data.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      const nodeName = node.getName();

      if (nodeName === 'soundLayer') {
        const layer = new SoundLayer();
        const layerName = node.getAttribute('name');
        if (layerName) layer.setName(layerName);

        const sObjNodes = node.getElements();
        while (sObjNodes.hasMoreElements()) {
          const sObjNode = sObjNodes.next();
          if (sObjNode.getName() === 'soundObject') {
            const sObj = loadSoundObjectFromXML(sObjNode, _objRefMap);
            if (sObj) layer.push(sObj);
          }
        }

        pObj.push(layer);
      } else if (nodeName === 'noteProcessorChain') {
        pObj._npc = NoteProcessorChain.loadFromXML(node);
      }
    }

    return pObj;
  }

  deepCopy(): SoundObject {
    // For Phase 3: shallow copy
    const copy = new PolyObject(false);
    copy._name = this._name;
    copy._startTime = this._startTime;
    copy._subjectiveDuration = this._subjectiveDuration;
    copy._backgroundColor = this._backgroundColor;
    copy._timeBehavior = this._timeBehavior;
    copy._npc = new NoteProcessorChain(this._npc);
    return copy;
  }

  deepCopyLG(): PolyObject {
    return this.deepCopy() as PolyObject;
  }
}

/**
 * Load a SoundObject from XML by dispatching based on type attribute.
 */
function loadSoundObjectFromXML(
  data: Element,
  _objRefMap: ObjRefLoadMap | undefined,
): SoundObject | null {
  const type = data.getAttribute('type');

  // Import GenericScore here to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GenericScore } = require('./generic-score.js') as { GenericScore: typeof import('./generic-score.js').GenericScore };

  switch (type) {
    case 'GenericScore':
      return GenericScore.loadFromXML(data);
    case 'PolyObject':
      return PolyObject.loadFromXML(data, _objRefMap);
    // Add more types as they are implemented
    default:
      // Unknown type — return null (preserved as opaque XML in parent)
      console.warn(`Unknown SoundObject type: ${type}`);
      return null;
  }
}
