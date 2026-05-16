import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JMaskEditorPayload } from '../../../../../../shared/project-editor';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import type { FieldSnapshot, ParameterSnapshot } from './jmask/jmask-utils';
import { getParameters, cloneField } from './jmask/jmask-utils';
import ParameterRow from './jmask/ParameterRow';
import SelectedCodeEditor from '../../editors/SelectedCodeEditor';
import CommitNumberInput from './jmask/CommitNumberInput';
import { JMask, loadFieldFromSnapshot, TimeContext, TimeDuration } from '@blue/data';

function GeneratedScoreModal({ text, onClose }: { text: string; onClose: () => void }): React.ReactElement {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex h-[400px] w-[760px] flex-col rounded-lg border border-[#1e2d44] bg-[#0d1524] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e2d44] px-4 py-3">
          <h2 className="text-sm font-medium text-[#dbe7ff]">Generated Score</h2>
          <button
            className="px-2 text-lg leading-none text-[#5a7299] hover:text-[#dbe7ff]"
            onClick={onClose}
            aria-label="Close"
          >x</button>
        </div>
        <div className="min-h-0 flex-1">
          <SelectedCodeEditor
            value={text}
            onChange={() => {}}
            ariaLabel="Generated score"
            readOnly
            mode="sco"
          />
        </div>
      </div>
    </div>
  );
}

export default function JMaskEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'structured' || editor.editorFamily !== 'JMask') return <></>;

  const payload = editor.payload as JMaskEditorPayload;
  const field = payload.field as FieldSnapshot;
  const parameters = useMemo(() => getParameters(field), [field]);
  const duration = document.shared.subjectiveDuration.value;

  const patch = useCallback(
    (nextPatch: Record<string, unknown>) => {
      onPatch({
        type: 'updateTypeSpecificEditor',
        target: document.target,
        patch: nextPatch,
      });
    },
    [document.target, onPatch],
  );

  const handleFieldChange = useCallback((nextField: FieldSnapshot) => {
    patch({ field: nextField });
  }, [patch]);

  const handleSeedUsedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    patch({ seedUsed: e.target.checked });
  }, [patch]);

  const handleSeedCommit = useCallback((v: number) => {
    patch({ seed: v });
  }, [patch]);

  const handleVisibilityToggle = useCallback((index: number, visible: boolean) => {
    const next = cloneField(field);
    const params = getParameters(next);
    if (index >= 0 && index < params.length) {
      params[index] = { ...params[index]!, visible };
    }
    patch({ field: next });
  }, [field, patch]);

  const [showVisibilityPopup, setShowVisibilityPopup] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = useCallback(() => {
    try {
      const jm = new JMask();
      jm.setSeedUsed(payload.seedUsed);
      jm.setSeed(typeof payload.seed === 'number' ? payload.seed : 0);
      jm.setSubjectiveDuration(TimeDuration.beats(duration));
      jm.setField(loadFieldFromSnapshot(structuredClone(payload.field)));
      const context = new TimeContext();
      const notes = jm.generateNotes(context, 0.0, -1.0);
      setTestResult(notes.toString());
    } catch (err) {
      setTestResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [payload]);

  const testRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        handleTest();
      }
    };
    const el = testRef.current;
    el?.addEventListener('keydown', handler);
    return () => { el?.removeEventListener('keydown', handler); };
  }, [handleTest]);

  const visibleRows = useMemo(() => {
    const rows: Array<{ parameter: ParameterSnapshot; fieldIndex: number; parameterNum: number }> = [];
    let num = 0;
    for (let i = 0; i < parameters.length; i++) {
      num += 1;
      rows.push({ parameter: parameters[i]!, fieldIndex: i, parameterNum: num });
    }
    return rows;
  }, [parameters]);

  return (
    <div ref={testRef} className="flex h-full flex-col bg-blue-bg" tabIndex={-1}>
      <div className="flex items-center gap-2 border-b border-gray-600 bg-[#1a2540] px-2 py-1 shrink-0">
        <span className="text-[11px] font-semibold text-gray-200">JMask</span>
        <div className="relative">
          <button
            type="button"
            className="flex h-4 w-4 items-center justify-center rounded text-[10px] text-gray-300 hover:bg-blue-border"
            onClick={() => setShowVisibilityPopup(p => !p)}
            title="Parameter Visibility"
          >
            &#9662;
          </button>
          {showVisibilityPopup && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded border border-blue-border bg-[#1d2c45] py-1 shadow-xl">
              {parameters.map((p, i) => {
                const pName = typeof p.name === 'string' && p.name ? p.name : '';
                const itemLabel = pName ? `Parameter ${i + 1} - ${pName}` : `Parameter ${i + 1}`;
                const isVisible = p.visible !== false;
                return (
                  <label key={i} className="flex cursor-pointer items-center gap-2 px-3 py-0.5 text-xs text-gray-200 hover:bg-blue-accent/20">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => handleVisibilityToggle(i, !isVisible)}
                      className="rounded border border-blue-border"
                    />
                    {itemLabel}
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <label className="flex items-center gap-1 text-[11px] text-gray-300">
          <input
            type="checkbox"
            checked={payload.seedUsed}
            onChange={handleSeedUsedChange}
            className="rounded border border-blue-border"
          />
          Seed
        </label>
        {payload.seedUsed && (
          <CommitNumberInput
            value={payload.seed}
            step={1}
            className="w-24 rounded border border-blue-border bg-blue-bg px-1.5 py-0.5 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
            onChange={handleSeedCommit}
          />
        )}
        <button
          type="button"
          className="rounded border border-blue-border px-2 py-0.5 text-[11px] text-gray-300 hover:border-blue-accent"
          onClick={handleTest}
          title="Test (Cmd/Ctrl+T)"
        >
          Test
        </button>
      </div>
      {testResult !== null && (
        <GeneratedScoreModal text={testResult} onClose={() => setTestResult(null)} />
      )}
      <div className="flex-1 overflow-auto p-1 space-y-1">
        {visibleRows
          .filter(r => r.parameter.visible !== false)
          .map(row => (
            <ParameterRow
              key={row.fieldIndex}
              parameter={row.parameter}
              parameterNum={row.parameterNum}
              duration={duration}
              field={field}
              fieldIndex={row.fieldIndex}
              onFieldChange={handleFieldChange}
            />
          ))}
      </div>
    </div>
  );
}
