import { describe, expect, it } from 'vitest';
import { BlueData, Element, MarkersList, TimeBase } from '@blue/data';
import {
  applyProjectDocumentPatch,
  createProjectEditorSnapshot,
} from '../../shared/project-editor';

describe('Marker parity with Java Blue', () => {
  it('loads nested TimePosition markers into score snapshots using beats', () => {
    const data = new BlueData();
    data.setMarkersList(
      MarkersList.loadFromXML(
        Element.parse(
          '<markersList><marker name="Intro B"><time type="BEATS"><csoundBeats>64</csoundBeats></time></marker></markersList>',
        ),
      ),
    );

    const snapshot = createProjectEditorSnapshot(data, '/test.blue');

    expect(snapshot.score.markers).toEqual([
      { name: 'Intro B', time: 64, timeBase: 'BEATS', sourceIndex: 0 },
    ]);
  });

  it('preserves an existing marker timebase when updating its beat position', () => {
    const data = new BlueData();
    data.setMarkersList(
      MarkersList.loadFromXML(
        Element.parse(
          '<markersList><marker name="Verse"><time type="SECONDS"><totalSeconds>4</totalSeconds></time></marker></markersList>',
        ),
      ),
    );

    applyProjectDocumentPatch(data, {
      score: { type: 'updateMarker', sourceIndex: 0, patch: { timeBeats: 8 } },
    });

    const markerTime = data.getMarkersList().getMarker(0)?.getElement('time');
    expect(markerTime?.getAttributeValue('type')).toBe('SECONDS');
    expect(markerTime?.getTextString('totalSeconds')).toBe('8');
  });

  it('adds new markers using the active score time display base', () => {
    const data = new BlueData();
    data.getScore().getTimeState().setTimeDisplay(TimeBase.SECONDS);

    applyProjectDocumentPatch(data, {
      score: { type: 'addMarker', timeBeats: 12, name: 'Outro' },
    });

    const marker = data.getMarkersList().getMarker(0);
    expect(marker?.getAttributeValue('name')).toBe('Outro');
    expect(marker?.getElement('time')?.getAttributeValue('type')).toBe('SECONDS');
    expect(marker?.getElement('time')?.getTextString('totalSeconds')).toBe('12');
  });

  it('updates marker timebase when the editor changes units without changing beats', () => {
    const data = new BlueData();
    data.setMarkersList(
      MarkersList.loadFromXML(
        Element.parse(
          '<markersList><marker name="Verse"><time type="SECONDS"><totalSeconds>4</totalSeconds></time></marker></markersList>',
        ),
      ),
    );

    applyProjectDocumentPatch(data, {
      score: { type: 'updateMarker', sourceIndex: 0, patch: { timeBase: 'BEATS' } },
    });

    const markerTime = data.getMarkersList().getMarker(0)?.getElement('time');
    expect(markerTime?.getAttributeValue('type')).toBe('BEATS');
    expect(markerTime?.getTextString('csoundBeats')).toBe('4');
  });
});