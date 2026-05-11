import { Track } from './track';
import { NoteList } from '../note-list';
import { Element } from '../../serialization/xml-reader';

export class TrackList {
  private _tracks: Track[] = [];
  private _steps = 64;

  constructor(other?: TrackList) {
    if (other) {
      this._steps = other._steps;
      for (const track of other._tracks) {
        this.addTrack(Track.fromOther(track));
      }
    }
  }

  addTrack(track: Track, index?: number): void {
    if (index !== undefined) {
      this._tracks.splice(index, 0, track);
    } else {
      this._tracks.push(track);
    }
    if (track.getNumSteps() !== this._steps) {
      track.resizeSteps(this._steps);
    }
  }

  removeTrack(index: number): void {
    if (index >= 0 && index < this._tracks.length) {
      this._tracks.splice(index, 1);
    }
  }

  getTrack(index: number): Track | null {
    return this._tracks[index] ?? null;
  }

  size(): number {
    return this._tracks.length;
  }

  getSteps(): number {
    return this._steps;
  }

  setSteps(steps: number): void {
    this._steps = steps;
    for (const track of this._tracks) {
      track.resizeSteps(steps);
    }
  }

  generateNotes(stepsPerBeat: number): NoteList {
    const retVal = new NoteList();
    for (const track of this._tracks) {
      retVal.merge(track.generateNotes(stepsPerBeat));
    }
    return retVal;
  }

  saveAsXML(): Element {
    const retVal = new Element('trackList');
    retVal.addElement('steps').setText(this._steps.toString());
    for (const track of this._tracks) {
      retVal.addElement(track.saveAsXML());
    }
    return retVal;
  }

  static loadFromXML(data: Element): TrackList {
    const trackList = new TrackList();
    const nodes = data.getElements();

    const nodesArray = [];
    while (nodes.hasMoreElements()) {
      const node = nodes.next();
      nodesArray.push(node);
      if (node.getName() === 'steps') {
        const s = node.getTextString();
        if (s) trackList.setSteps(parseInt(s, 10));
      }
    }

    for (const node of nodesArray) {
      if (node.getName() === 'track') {
        trackList.addTrack(Track.loadFromXML(node));
      }
    }
    return trackList;
  }
}
