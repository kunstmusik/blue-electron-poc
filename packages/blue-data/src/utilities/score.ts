/**
 * ScoreUtilities — utility functions for score/note manipulation.
 * Mirrors the Java ScoreUtilities class.
 */
import { NoteList } from '../sound-objects/note-list';
import { NoteProcessorChain } from '../note-processors/note-processor-chain';
import { Note } from '../sound-objects/note';

/**
 * Apply a note processor chain to a NoteList.
 */
export function applyNoteProcessorChain(nl: NoteList, npc: NoteProcessorChain): NoteList {
  return npc.apply(nl);
}

/**
 * Shift all notes in a NoteList by the given time offset.
 * Adds the offset to each note's start time.
 */
export function setScoreStart(nl: NoteList, offset: number): void {
  for (const note of nl) {
    note.setStartTime(note.getStartTime() + offset);
  }
}

/**
 * Get notes from Csound score text.
 * Parses score text like "i1 0 2 440 0.5" into Note objects.
 */
export function getNotes(scoreText: string): NoteList {
  const notes = new NoteList();
  const lines = scoreText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;

    const note = new Note();
    note.setPField(parts[0], 1); // instrument
    note.setStartTime(parseFloat(parts[1])); // start time
    note.setSubjectiveDuration(parseFloat(parts[2])); // duration

    // p4+
    for (let i = 3; i < parts.length; i++) {
      note.setPField(parts[i], i + 1);
    }

    notes.push(note);
  }

  return notes;
}
