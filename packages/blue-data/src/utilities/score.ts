/**
 * ScoreUtilities — utility functions for score/note manipulation.
 * Mirrors the Java ScoreUtilities class.
 */
import { NoteList } from '../sound-objects/note-list';
import { NoteProcessorChain } from '../note-processors/note-processor-chain';
import { Note } from '../sound-objects/note';
import { TimeBehavior } from '../sound-objects/time-behavior';

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
 * Get total duration of notes (max startTime + subjectiveDuration).
 */
function getTotalDuration(notes: NoteList): number {
  let max = 0;
  for (let i = 0; i < notes.length; i++) {
    const n = notes.getNote(i);
    const end = n.getStartTime() + n.getSubjectiveDuration();
    if (end > max) max = end;
  }
  return max;
}

/**
 * Scale all note start times and durations by a multiplier.
 */
function scaleScore(notes: NoteList, multiplier: number): void {
  for (let i = 0; i < notes.length; i++) {
    const n = notes.getNote(i);
    n.setStartTime(n.getStartTime() * multiplier);
    n.setSubjectiveDuration(n.getSubjectiveDuration() * multiplier);
  }
}

/**
 * Apply time behavior transformation to a NoteList.
 * Mirrors Java ScoreUtilities.applyTimeBehavior.
 *
 * @param notes The note list to transform (modified in place)
 * @param timeBehavior The time behavior to apply
 * @param subjectiveDuration The sound object's subjective duration in beats
 * @param repeatPointBeats The repeat point in beats, or -1 if none
 * @param durationForScale Override for total duration used in repeat calculations (e.g., PatternObject.beats)
 */
export function applyTimeBehavior(
  notes: NoteList,
  timeBehavior: TimeBehavior,
  subjectiveDuration: number,
  repeatPointBeats: number,
  durationForScale: number = -1,
): void {
  if (notes.length === 0) return;

  if (timeBehavior === TimeBehavior.SCALE) {
    const dur = getTotalDuration(notes);
    if (dur > 0) {
      const multiplier = subjectiveDuration / dur;
      scaleScore(notes, multiplier);
    }
  } else if (timeBehavior === TimeBehavior.REPEAT) {
    const originalNotes = notes.deepCopy();
    originalNotes.sortByStartTime();

    let objDur = durationForScale >= 0 ? durationForScale : getTotalDuration(originalNotes);
    let repeatDur = objDur;
    if (objDur > 0 && repeatPointBeats > 0) {
      repeatDur = repeatPointBeats;
    }

    if (repeatDur <= 0) return;

    // Clear notes and rebuild with repeats
    const result = new NoteList();
    let windowStart = 0;
    let windowEnd = Math.min(repeatDur, subjectiveDuration);

    while (windowStart < subjectiveDuration) {
      const tempNL = originalNotes.deepCopy();
      setScoreStart(tempNL, windowStart);

      // Filter and truncate notes to fit within the repeat window
      for (let i = tempNL.length - 1; i >= 0; i--) {
        const n = tempNL.getNote(i);
        if (n.getStartTime() >= windowEnd) {
          tempNL._removeAt(i);
        } else if (n.getStartTime() + n.getSubjectiveDuration() > windowEnd) {
          n.setSubjectiveDuration(windowEnd - n.getStartTime());
        }
      }

      result.merge(tempNL);
      windowStart += repeatDur;
      windowEnd = Math.min(windowStart + repeatDur, subjectiveDuration);
    }

    // Replace notes contents with result
    notes._replaceContents(result);
  } else if (timeBehavior === TimeBehavior.REPEAT_CLASSIC) {
    const originalNotes = notes.deepCopy();
    originalNotes.sortByStartTime();

    let objDur = durationForScale >= 0 ? durationForScale : getTotalDuration(originalNotes);
    let repeatDur = objDur;
    if (objDur > 0 && repeatPointBeats > 0) {
      repeatDur = repeatPointBeats;
    }

    if (repeatDur <= 0) return;

    // Full repeat cycles
    const result = new NoteList();
    let startVal = 0;

    while (startVal + repeatDur < subjectiveDuration) {
      const tempNL = originalNotes.deepCopy();
      setScoreStart(tempNL, startVal);
      result.merge(tempNL);
      startVal += repeatDur;
    }

    // Partial final cycle — only include notes that fit entirely
    const remainingDur = subjectiveDuration - startVal;
    for (let i = 0; i < originalNotes.length; i++) {
      const origNote = originalNotes.getNote(i);
      if (origNote.getStartTime() + origNote.getSubjectiveDuration() <= remainingDur) {
        const note = origNote.deepCopy();
        note.setStartTime(note.getStartTime() + startVal);
        result.push(note);
      } else {
        // Notes are sorted, so remaining notes won't fit either
        break;
      }
    }

    notes._replaceContents(result);
  }
}

/**
 * Get notes from Csound score text.
 * Parses score text like "i1 0 2 440 0.5" into Note objects.
 * Uses Note.createNoteFromText which strips the leading 'i'.
 */
export function getNotes(scoreText: string): NoteList {
  const notes = new NoteList();
  const lines = scoreText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;

    const note = Note.createNoteFromText(trimmed);
    if (note) notes.push(note);
  }

  return notes;
}
