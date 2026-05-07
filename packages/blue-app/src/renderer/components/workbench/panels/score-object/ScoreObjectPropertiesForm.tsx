import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ScoreObjectEditorDocumentSnapshot,
  ScorePatch,
} from '../../../../../shared/project-editor';
import TimeUnitEditor from './TimeUnitEditor';

interface ScoreObjectPropertiesFormProps {
  document: ScoreObjectEditorDocumentSnapshot;
  onPatch: (patch: ScorePatch) => void;
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <label className="w-28 shrink-0 text-xs text-blue-muted text-right">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

const INPUT_CLASS =
  'w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none';

function CommitTextInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}): React.ReactElement {
  const [draft, setDraft] = useState(value);
  const lastCommitted = useRef(value);

  useEffect(() => {
    setDraft(value);
    lastCommitted.current = value;
  }, [value]);

  const commit = useCallback(() => {
    if (draft !== lastCommitted.current) {
      lastCommitted.current = draft;
      onCommit(draft);
    }
  }, [draft, onCommit]);

  return (
    <input
      type="text"
      className={INPUT_CLASS}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
    />
  );
}

function ColorSwatch({ color, onChange }: { color: number; onChange: (v: number) => void }): React.ReactElement {
  const hex = `#${(color >>> 0).toString(16).padStart(8, '0').slice(2)}`;
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={hex}
        onChange={(e) => {
          const hexVal = e.target.value;
          const r = parseInt(hexVal.slice(1, 3), 16);
          const g = parseInt(hexVal.slice(3, 5), 16);
          const b = parseInt(hexVal.slice(5, 7), 16);
          onChange((0xFF000000 | (r << 16) | (g << 8) | b) >>> 0);
        }}
        className="h-6 w-6 cursor-pointer rounded border border-blue-border"
      />
      <span className="text-xs text-blue-muted">{hex}</span>
    </div>
  );
}

function SelectInput({ value, options, onChange, disabled }: { value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void; disabled?: boolean }): React.ReactElement {
  return (
    <select
      className="w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

const TIME_BEHAVIOR_OPTIONS = [
  { value: 'SCALE', label: 'Scale' },
  { value: 'REPEAT', label: 'Repeat' },
  { value: 'REPEAT_CLASSIC', label: 'Repeat (Classic)' },
  { value: 'NONE', label: 'None' },
];

function isRepeatBehavior(tb: string | undefined): boolean {
  return tb === 'REPEAT' || tb === 'REPEAT_CLASSIC';
}

export default function ScoreObjectPropertiesForm({ document, onPatch }: ScoreObjectPropertiesFormProps): React.ReactElement {
  const shared = document.shared;
  const target = document.target;
  const timeCtx = document.timeContext;
  const tb = shared.timeBehavior;
  const isRepeat = isRepeatBehavior(tb);
  const hasRepeatPoint = shared.repeatPoint !== null && shared.repeatPoint !== undefined;

  const handleNameCommit = useCallback((name: string) => {
    onPatch({
      type: 'updateSharedProperties',
      target,
      patch: { name },
    });
  }, [target, onPatch]);

  const handleStartTimeCommit = useCallback((value: number, timeBase: string) => {
    onPatch({
      type: 'updateSharedProperties',
      target,
      patch: { startTime: { value, timeBase } },
    });
  }, [target, onPatch]);

  const handleDurationCommit = useCallback((value: number, timeBase: string) => {
    onPatch({
      type: 'updateSharedProperties',
      target,
      patch: { subjectiveDuration: { value, timeBase } },
    });
  }, [target, onPatch]);

  const handleColorChange = useCallback((backgroundColor: number) => {
    onPatch({
      type: 'updateSharedProperties',
      target,
      patch: { backgroundColor },
    });
  }, [target, onPatch]);

  const handleTimeBehaviorChange = useCallback((timeBehavior: string) => {
    const repeatEnabled = isRepeatBehavior(timeBehavior);
    if (!repeatEnabled) {
      onPatch({
        type: 'updateSoundObjectBehavior',
        target,
        patch: { timeBehavior, repeatPoint: null },
      });
    } else {
      onPatch({
        type: 'updateSoundObjectBehavior',
        target,
        patch: { timeBehavior },
      });
    }
  }, [target, onPatch]);

  const handleUseRepeatPointChange = useCallback((checked: boolean) => {
    if (checked) {
      onPatch({
        type: 'updateSoundObjectBehavior',
        target,
        patch: { repeatPoint: { value: shared.subjectiveDuration.value, timeBase: 'beats' } },
      });
    } else {
      onPatch({
        type: 'updateSoundObjectBehavior',
        target,
        patch: { repeatPoint: null },
      });
    }
  }, [target, onPatch, shared.subjectiveDuration.value]);

  const handleRepeatPointCommit = useCallback((value: number, timeBase: string) => {
    onPatch({
      type: 'updateSoundObjectBehavior',
      target,
      patch: { repeatPoint: value <= 0 ? null : { value, timeBase } },
    });
  }, [target, onPatch]);

  const showSoundObjectFields = target.supportsTimeBehavior && tb !== undefined;

  return (
    <div className="py-2">
      <FieldRow label="Name:">
        <CommitTextInput value={shared.name} onCommit={handleNameCommit} />
      </FieldRow>

      <FieldRow label="Start Time:">
        <TimeUnitEditor
          valueBeats={shared.startTime.value}
          timeBase={shared.startTime.timeBase}
          timeContext={timeCtx}
          durationMode={false}
          onCommit={handleStartTimeCommit}
        />
      </FieldRow>

      <FieldRow label="Subjective Duration:">
        <TimeUnitEditor
          valueBeats={shared.subjectiveDuration.value}
          timeBase={shared.subjectiveDuration.timeBase}
          timeContext={timeCtx}
          durationMode={true}
          onCommit={handleDurationCommit}
        />
      </FieldRow>

      <FieldRow label="End Time:">
        <div className="text-xs text-blue-muted py-1">{shared.endTimeDisplay}</div>
      </FieldRow>

      <FieldRow label="Color:">
        <ColorSwatch color={shared.backgroundColor} onChange={handleColorChange} />
      </FieldRow>

      {showSoundObjectFields && (
        <>
          <FieldRow label="Time Behavior:">
            <SelectInput
              value={tb!}
              options={TIME_BEHAVIOR_OPTIONS}
              onChange={handleTimeBehaviorChange}
            />
          </FieldRow>

          {target.supportsRepeatPoint && (
            <>
              <FieldRow label="Use Repeat Point:">
                <input
                  type="checkbox"
                  checked={hasRepeatPoint}
                  disabled={!isRepeat}
                  onChange={(e) => handleUseRepeatPointChange(e.target.checked)}
                  className="accent-blue-accent"
                />
              </FieldRow>

              <FieldRow label="Repeat Point:">
                <TimeUnitEditor
                  valueBeats={shared.repeatPoint?.value ?? 0}
                  timeBase={shared.repeatPoint?.timeBase ?? 'beats'}
                  timeContext={timeCtx}
                  durationMode={true}
                  disabled={!isRepeat || !hasRepeatPoint}
                  onCommit={handleRepeatPointCommit}
                />
              </FieldRow>
            </>
          )}

          {target.supportsNoteProcessorChain && shared.noteProcessorChain && (
            <div className="px-3 py-2 mt-2 border-t border-blue-border">
              <div className="text-xs font-medium text-gray-300 mb-1">Note Processors</div>
              {shared.noteProcessorChain.processors.length === 0 ? (
                <div className="text-xs text-blue-muted">No processors</div>
              ) : (
                <div className="space-y-1">
                  {shared.noteProcessorChain.processors.map((proc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={proc.supported ? 'text-gray-200' : 'text-yellow-400'}>
                        {proc.displayName}
                      </span>
                      {!proc.supported && (
                        <span className="text-yellow-500 text-[10px]">(unsupported)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {target.displayContext === 'instance' && (
        <div className="px-3 py-2 mt-2 border-t border-blue-border">
          <div className="flex items-center gap-1.5 text-xs text-blue-accent">
            <span>&#9432;</span>
            <span>Editing library object via Instance</span>
          </div>
        </div>
      )}
    </div>
  );
}
