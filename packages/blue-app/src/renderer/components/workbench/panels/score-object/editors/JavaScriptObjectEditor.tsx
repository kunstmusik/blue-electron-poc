import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';
import SelectedCodeEditor from '../../editors/SelectedCodeEditor';

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

export default function JavaScriptObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'code') return <></>;

  const onLoadProcessable = editor.auxiliaryFlags?.onLoadProcessable === true;

  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: p,
    });
  }, [document.target, onPatch]);

  const handleChange = useCallback((text: string) => {
    patch({ text });
  }, [patch]);

  const handleProcessOnLoadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    patch({ onLoadProcessable: e.target.checked });
  }, [patch]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestError(null);
    try {
      const result = await window.blueAPI.testJavascriptSoundObject({ target: document.target });
      if (result.ok) {
        setTestOutput(result.output);
      } else {
        setTestError(result.error ?? 'Unknown error');
      }
    } catch (err) {
      setTestError(err instanceof Error ? err.message : String(err));
    } finally {
      setTesting(false);
    }
  }, [document.target]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        handleTest();
      }
    };
    const el = containerRef.current;
    el?.addEventListener('keydown', handler);
    return () => { el?.removeEventListener('keydown', handler); };
  }, [handleTest]);

  return (
    <div ref={containerRef} className="flex h-full flex-col" tabIndex={-1}>
      <div className="flex items-center gap-2 border-b border-blue-border px-3 py-1 shrink-0">
        <div className="flex-1" />
        <label className="flex items-center gap-1 text-[11px] text-gray-300">
          <input
            type="checkbox"
            checked={onLoadProcessable}
            onChange={handleProcessOnLoadChange}
            className="rounded border border-blue-border"
          />
          Process on Load
        </label>
        <button
          type="button"
          className="rounded border border-blue-border px-2 py-0.5 text-[11px] text-gray-300 hover:border-blue-accent"
          disabled={testing}
          onClick={handleTest}
          title="Test (Cmd/Ctrl+T)"
        >
          {testing ? 'Testing...' : 'Test'}
        </button>
      </div>
      {testError && (
        <div className="px-3 py-1.5 text-xs border-b shrink-0 bg-red-900/20 text-red-300 flex items-center gap-2">
          <span>Error: {testError}</span>
          <button className="underline text-blue-muted hover:text-gray-200" onClick={() => setTestError(null)}>dismiss</button>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <SelectedCodeEditor
          value={editor.text}
          mode="javascript"
          active={true}
          readOnly={false}
          ariaLabel="JavaScript code editor"
          onChange={handleChange}
        />
      </div>
      {testOutput !== null && (
        <GeneratedScoreModal text={testOutput} onClose={() => setTestOutput(null)} />
      )}
    </div>
  );
}
