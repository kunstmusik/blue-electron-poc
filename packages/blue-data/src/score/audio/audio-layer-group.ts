/**
 * AudioLayerGroup — a group of AudioLayers.
 * Mirrors the Java AudioLayerGroup class.
 *
 * AudioLayerGroup implements ScoreObjectLayerGroup<AudioLayer>.
 * During CSD generation, it collects notes from all non-muted layers.
 */
import { AudioLayer } from './audio-layer';
import { ScoreObjectLayerGroup } from '../../score/layers/score-object-layer-group';
import { LayerGroupDataEvent, LayerGroupDataEventType } from '../../score/layers/layer-group-data-event';
import { LayerGroupListener } from '../../score/layers/layer-group-listener';
import { NoteProcessorChain } from '../../note-processors/note-processor-chain';
import { NoteList } from '../../sound-objects/note-list';
import { ScoreObject } from '../../score/score-object';
import { TimeContext } from '../../time/time-context';
import { CompileData } from '../../compile-data';
import { ScoreGenerationException } from '../../score/score-generation-exception';
import { Element } from '../../serialization/xml-reader';
import { ObjRefSaveMap } from '../../serialization/obj-ref-map';
import { writeInt } from '../../utilities/xml';

export class AudioLayerGroup extends Array<AudioLayer> implements ScoreObjectLayerGroup<AudioLayer> {
  private _name = 'Audio Layer Group';
  private _uniqueId = generateUniqueId();
  private _defaultHeightIndex = 0;
  private _layerGroupListeners: LayerGroupListener[] = [];
  private _propListeners: unknown[] = [];

  constructor(other?: AudioLayerGroup) {
    super();
    if (other) {
      this._name = other._name;
      this._uniqueId = other._uniqueId;
      this._defaultHeightIndex = other._defaultHeightIndex;
      for (const layer of other) {
        this.push(AudioLayer.copyFrom(layer));
      }
    }
  }

  // ─── LayerGroup ───

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getDefaultHeightIndex(): number { return this._defaultHeightIndex; }
  setDefaultHeightIndex(idx: number): void { this._defaultHeightIndex = idx; }

  getUniqueId(): string { return this._uniqueId; }

  hasSoloLayers(): boolean {
    return this.some((layer) => layer.isSolo());
  }

  getNoteProcessorChain(): NoteProcessorChain {
    // AudioLayerGroup doesn't have its own note processor chain
    return new NoteProcessorChain();
  }

  generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    startTime: number,
    endTime: number,
    processWithSolo: boolean,
  ): NoteList {
    const noteList = new NoteList();

    for (const layer of this) {
      if (layer.isMuted()) continue;
      if (processWithSolo && !layer.isSolo()) continue;

      const nl = layer.generateForCSD(context, compileData, startTime, endTime);
      noteList.merge(nl);
    }

    return noteList;
  }

  saveAsXML(objRefMap?: ObjRefSaveMap): Element {
    const root = new Element('audioLayerGroup');
    root.setAttribute('name', this._name);
    root.setAttribute('uniqueId', this._uniqueId);
    root.addElement(writeInt('defaultHeightIndex', this._defaultHeightIndex));

    const audioLayersNode = root.addElement('audioLayers');
    for (const layer of this) {
      audioLayersNode.addElement(layer.saveAsXML(objRefMap));
    }

    return root;
  }

  static loadFromXML(data: Element): AudioLayerGroup {
    const group = new AudioLayerGroup();

    const name = data.getAttribute('name');
    if (name) group._name = name;

    const uniqueId = data.getAttribute('uniqueId');
    if (uniqueId) group._uniqueId = uniqueId;

    const nodes = data.getElements();
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      if (node.getName() === 'audioLayers') {
        const layerNodes = node.getElements();
        while (layerNodes.hasMoreElements()) {
          group.push(AudioLayer.loadFromXML(layerNodes.next()));
        }
      } else if (node.getName() === 'defaultHeightIndex') {
        group._defaultHeightIndex = parseInt(node.getTextString(), 10);
      }
    }

    return group;
  }

  // ─── LayerGroup operations ───

  newLayerAt(index: number): AudioLayer {
    const layer = new AudioLayer();
    layer.setHeightIndex(this._defaultHeightIndex);

    const insertIdx = Math.min(Math.max(index, 0), this.length);
    this.splice(insertIdx, 0, layer);

    const event = new LayerGroupDataEvent(
      this,
      LayerGroupDataEventType.DATA_ADDED,
      insertIdx,
      insertIdx,
      [layer],
    );
    this._fireLayerGroupDataEvent(event);

    return layer;
  }

  removeLayers(startIdx: number, endIdx: number): void {
    const removed: AudioLayer[] = [];
    for (let i = endIdx; i >= startIdx; i--) {
      const layer = this[i];
      removed.push(layer);
      this.splice(i, 1);
    }

    const event = new LayerGroupDataEvent(
      this,
      LayerGroupDataEventType.DATA_REMOVED,
      startIdx,
      endIdx,
      removed,
    );
    this._fireLayerGroupDataEvent(event);
  }

  pushUpLayers(startIdx: number, endIdx: number): void {
    if (startIdx <= 0) return;
    const item = this.splice(startIdx - 1, 1)[0];
    this.splice(endIdx, 0, item);

    const event = new LayerGroupDataEvent(
      this,
      LayerGroupDataEventType.DATA_CHANGED,
      startIdx - 1,
      endIdx,
    );
    this._fireLayerGroupDataEvent(event);
  }

  pushDownLayers(startIdx: number, endIdx: number): void {
    if (endIdx >= this.length - 1) return;
    const item = this.splice(endIdx + 1, 1)[0];
    this.splice(startIdx, 0, item);

    const event = new LayerGroupDataEvent(
      this,
      LayerGroupDataEventType.DATA_CHANGED,
      -startIdx,
      -(endIdx + 1),
    );
    this._fireLayerGroupDataEvent(event);
  }

  onLoadComplete(_context: TimeContext): void {
    // No-op for audio layers
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

  deepCopyLG(): AudioLayerGroup {
    return new AudioLayerGroup(this);
  }

  // ─── Helpers ───

  getTotalHeight(): number {
    let runningHeight = 0;
    for (const layer of this) {
      runningHeight += (layer.getHeightIndex() + 1);
    }
    return runningHeight * LAYER_HEIGHT;
  }

  getLayerNumForY(y: number): number {
    let runningY = 0;
    for (let i = 0; i < this.length; i++) {
      runningY += this[i].getLayerHeight();
      if (runningY > y) return i;
    }
    return this.length - 1;
  }

  getLayerNumForScoreObject(scoreObj: ScoreObject): number {
    for (let i = 0; i < this.length; i++) {
      if (this[i].contains(scoreObj)) return i;
    }
    return -1;
  }

  private _fireLayerGroupDataEvent(event: LayerGroupDataEvent): void {
    for (const listener of this._layerGroupListeners) {
      listener.layerGroupChanged(event);
    }
  }
}

const LAYER_HEIGHT = 22;

function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}
