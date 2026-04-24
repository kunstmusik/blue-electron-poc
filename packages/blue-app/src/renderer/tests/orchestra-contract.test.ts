import { describe, expect, it } from 'vitest';
import {
  BlueData,
  BlueSynthBuilder,
  GenericInstrument,
  JavaScriptInstrument,
} from '@blue/data';
import {
  applyProjectDocumentPatch,
  createProjectEditorSnapshot,
} from '../../shared/project-editor';

function createProjectWithGenericInstrument(): BlueData {
  const data = new BlueData();
  const instrument = new GenericInstrument();
  instrument.setName('Lead');
  instrument.setComment('lead comment');
  instrument.setText('aout oscili p4, p5');
  data.getArrangement().addInstrument(instrument, '1');
  return data;
}

describe('Orchestra project document contract', () => {
  it('serializes arrangement rows and instrument editor state into project snapshots', () => {
    const data = createProjectWithGenericInstrument();
    const snapshot = createProjectEditorSnapshot(data, '/tmp/test.blue');

    expect(snapshot.orchestra.loaded).toBe(true);
    expect(snapshot.orchestra.arrangement.rows).toContainEqual(
      expect.objectContaining({
        assignmentId: '1',
        enabled: true,
        instrumentName: 'Lead',
        instrumentType: 'generic',
      }),
    );
    expect(snapshot.orchestra.instruments[0]).toEqual(
      expect.objectContaining({
        assignmentId: '1',
        type: 'generic',
        name: 'Lead',
        comment: 'lead comment',
        text: 'aout oscili p4, p5',
      }),
    );
  });

  it('applies orchestra patch intents to the canonical BlueData document', () => {
    const data = createProjectWithGenericInstrument();

    expect(
      applyProjectDocumentPatch(data, {
        orchestra: {
          type: 'updateInstrumentComment',
          assignmentId: '1',
          comment: 'edited comment',
        },
      }),
    ).toBe(true);
    expect(data.getArrangement().getInstrumentById('1')?.getComment()).toBe(
      'edited comment',
    );

    expect(
      applyProjectDocumentPatch(data, {
        orchestra: {
          type: 'replaceInstrument',
          assignmentId: '1',
          instrumentType: 'javascript',
        },
      }),
    ).toBe(true);
    expect(data.getArrangement().getInstrumentById('1')).toBeInstanceOf(
      JavaScriptInstrument,
    );
  });

  it('converts GenericInstrument assignments to BlueSynthBuilder assignments', () => {
    const data = createProjectWithGenericInstrument();

    expect(
      applyProjectDocumentPatch(data, {
        orchestra: {
          type: 'convertGenericToBsb',
          assignmentId: '1',
        },
      }),
    ).toBe(true);

    const instrument = data.getArrangement().getInstrumentById('1');
    expect(instrument).toBeInstanceOf(BlueSynthBuilder);
    expect((instrument as BlueSynthBuilder).getInstrumentText()).toContain('oscili');
  });

  it('duplicates arrangement assignments with deep-copied instruments', () => {
    const data = createProjectWithGenericInstrument();

    expect(
      applyProjectDocumentPatch(data, {
        orchestra: {
          type: 'duplicateAssignment',
          sourceAssignmentId: '1',
        },
      }),
    ).toBe(true);

    const assignments = data.getArrangement().getArrangement();
    expect(assignments).toHaveLength(2);
    expect(assignments[0]!.instr).not.toBe(assignments[1]!.instr);
    expect(assignments[1]!.instr.getName()).toBe('Lead');
  });

  it('pastes serializable instrument snapshots as new assignments', () => {
    const data = createProjectWithGenericInstrument();
    const snapshot = createProjectEditorSnapshot(data, null).orchestra.instruments[0]!;

    expect(
      applyProjectDocumentPatch(data, {
        orchestra: {
          type: 'pasteInstrument',
          instrument: {
            ...snapshot,
            name: 'Pasted Lead',
          },
        },
      }),
    ).toBe(true);

    const assignments = data.getArrangement().getArrangement();
    expect(assignments).toHaveLength(2);
    expect(assignments[1]!.instr.getName()).toBe('Pasted Lead');
  });
});
