import React, { useCallback, useState } from 'react';
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

export default function ExternalScoreObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'external') return <></>;

  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const modeMap: Record<string, 'orc' | 'sco' | 'text' | 'javascript' | 'python'> = {
    'Python': 'python',
    'JavaScript': 'javascript',
    'Csound': 'sco',
    'text': 'text',
  };

  const patch = useCallback((p: Record<string, unknown>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: p,
    });
  }, [document.target, onPatch]);

  const handleCodeChange = useCallback((text: string) => {
    patch({ scoreText: text });
  }, [patch]);

  const handleCommandLineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    patch({ commandLine: e.target.value });
  }, [patch]);

  const canTest = !testing && (editor.commandLine.trim().length > 0 || editor.scoreText.trim().length > 0);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestError(null);
    try {
      const result = await window.blueAPI.testExternalSoundObject({ target: document.target });
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-border shrink-0">
        <label className="shrink-0 text-xs text-blue-muted">Command Line:</label>
        <input
          type="text"
          className="flex-1 min-w-0 rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 font-mono focus:border-blue-accent focus:outline-none"
          value={editor.commandLine}
          onChange={handleCommandLineChange}
        />
        <button
          className="shrink-0 px-3 py-1 text-xs rounded border border-blue-border text-blue-muted hover:bg-blue-border/30 disabled:opacity-50"
          disabled={!canTest}
          onClick={handleTest}
          title="Generate score from external command and show results"
        >
          {testing ? 'Running...' : 'Test'}
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
          value={editor.scoreText}
          mode={modeMap[editor.syntaxType] ?? 'text'}
          active={true}
          readOnly={false}
          ariaLabel="External code editor"
          onChange={handleCodeChange}
        />
      </div>
      {testOutput !== null && (
        <GeneratedScoreModal text={testOutput} onClose={() => setTestOutput(null)} />
      )}
    </div>
  );
}
