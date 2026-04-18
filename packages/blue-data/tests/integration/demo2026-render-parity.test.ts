import { beforeAll, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import { BlueData } from '../../src/blue-data';
import { NoteList } from '../../src/sound-objects/note-list';
import { Note } from '../../src/sound-objects/note';
import { GenericScore } from '../../src/sound-objects/generic-score';
import { JavaScriptObject } from '../../src/sound-objects/javascript-object';
import { TimePosition } from '../../src/time/time-position';
import { TimeDuration } from '../../src/time/time-duration';
import { TimeBehavior } from '../../src/sound-objects/time-behavior';
import { TimeContext } from '../../src/time/time-context';
import { CompileData } from '../../src/compile-data';
import {
  disposeJavaScriptCompileState,
  initializeJavaScriptRuntime,
} from '../../src/javascript-runtime';

const DEMO2026_BLUE_PATH = '/Users/stevenyi/work/blue/demo2026/01.blue';
const DEMO2026_CSD_PATH = '/Users/stevenyi/work/blue/demo2026/01.csd';

function createNote(instrId: string, start: number, duration: number): Note {
  const note = new Note();
  note.setPField(instrId, 1);
  note.setStartTime(start);
  note.setSubjectiveDuration(duration);
  return note;
}

function extractScoreEvents(csd: string): string[] {
  const match = csd.match(/<CsScore>([\s\S]*?)<\/CsScore>/);
  if (!match) {
    throw new Error('CSD is missing a <CsScore> section');
  }

  return match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('i'));
}

function extractInstrumentSequence(scoreEvents: string[]): string[] {
  return scoreEvents.map((line) => {
    const match = line.match(/^i\s*"?([^"\s]+)"?/);
    if (!match) {
      throw new Error(`Unable to parse score event: ${line}`);
    }
    return match[1];
  });
}

function normalizeWhitespace(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}

beforeAll(async () => {
  await initializeJavaScriptRuntime();
});

describe('NoteList merge parity', () => {
  it('preserves append order instead of re-sorting by start time', () => {
    const first = new NoteList([createNote('1', 10, 1)]);
    const second = new NoteList([createNote('2', 5, 1)]);

    first.merge(second);

    expect(first.getNote(0).getPField(1)).toBe('1');
    expect(first.getNote(1).getPField(1)).toBe('2');
  });
});

describe('BlueData score scheduling parity', () => {
  it('extends always-on instruments by mixer extra render time', () => {
    const data = new BlueData();
    const notes = new NoteList([createNote('1', 127.75, 0.25)]);

    (data as any).arrangement = {
      getArrangement: () => Array.from({ length: 5 }, () => ({
        enabled: true,
        instr: {
          getAlwaysOnInstrumentText: () => 'aLeft, aRight blueMixerIn',
        },
      })),
    };
    (data as any).mixer = {
      isEnabled: () => true,
      getExtraRenderTime: () => 4,
    };

    const scoreText = (data as any).buildScoreText('', '', notes, '', 128) as string;
    const scoreEvents = scoreText
      .split(/\r?\n/)
      .filter((line) => line.startsWith('i'));

    expect(scoreEvents.slice(-6)).toEqual([
      'i6\t0\t132\t',
      'i7\t0\t132\t',
      'i8\t0\t132\t',
      'i9\t0\t132\t',
      'i10\t0\t132\t',
      'i"BlueMixer"\t0\t132\t',
    ]);
  });
});

describe('Score-based sound object parity', () => {
  it('GenericScore applies its sound object start offset', () => {
    const score = new GenericScore();
    score.setScoreText('i1 0 1 60');
    score.setStartTime(TimePosition.beats(16));
    score.setSubjectiveDuration(TimeDuration.beats(4));
    score.setTimeBehavior(TimeBehavior.NONE);

    const notes = score.generateForCSD(new TimeContext(), new CompileData(), 0, -1);

    expect(notes.getNote(0).getStartTime()).toBe(16);
  });

  it('JavaScriptObject applies its sound object start offset', () => {
    const object = new JavaScriptObject();
    object.setJavaScriptCode('score = "i1 0 1 60";');
    object.setStartTime(TimePosition.beats(16));
    object.setSubjectiveDuration(TimeDuration.beats(4));
    object.setTimeBehavior(TimeBehavior.NONE);

    const compileData = new CompileData();

    try {
      const notes = object.generateForCSD(new TimeContext(), compileData, 0, -1);

      expect(notes.getNote(0).getStartTime()).toBe(16);
    } finally {
      disposeJavaScriptCompileState(compileData);
    }
  });
});

describe.skipIf(
  !fs.existsSync(DEMO2026_BLUE_PATH) || !fs.existsSync(DEMO2026_CSD_PATH),
)('Demo2026 render parity', () => {
  let generatedScoreEvents: string[];
  let referenceScoreEvents: string[];

  beforeAll(async () => {
    const xml = fs.readFileSync(DEMO2026_BLUE_PATH, 'utf-8');
    const data = await BlueData.loadFromString(xml);
    const generatedCsd = data.toCSD();
    const referenceCsd = fs.readFileSync(DEMO2026_CSD_PATH, 'utf-8');

    generatedScoreEvents = extractScoreEvents(generatedCsd);
    referenceScoreEvents = extractScoreEvents(referenceCsd);
  });

  it('matches the Java score event instrument ordering', () => {
    expect(extractInstrumentSequence(generatedScoreEvents)).toEqual(
      extractInstrumentSequence(referenceScoreEvents),
    );
  });

  it('matches the Java always-on event durations', () => {
    expect(generatedScoreEvents.slice(-6).map(normalizeWhitespace)).toEqual(
      referenceScoreEvents.slice(-6).map(normalizeWhitespace),
    );
  });
});