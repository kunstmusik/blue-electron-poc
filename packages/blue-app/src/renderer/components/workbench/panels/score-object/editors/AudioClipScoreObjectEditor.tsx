import React, { useCallback } from 'react';
import type { ScoreObjectEditorComponentProps } from '../editor-registry';

function FieldRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <label className="w-28 shrink-0 text-xs text-blue-muted text-right">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function AudioClipScoreObjectEditor({ document, onPatch }: ScoreObjectEditorComponentProps): React.ReactElement {
  const editor = document.editor;
  if (editor.kind !== 'audioClip') return <></>;

  const handleFileChange = useCallback((audioFile: string) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { audioFile },
    });
  }, [document.target, onPatch]);

  const handleFileStartTimeChange = useCallback((fileStartTime: number) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { fileStartTime },
    });
  }, [document.target, onPatch]);

  const handleFadeInChange = useCallback((fadeIn: number) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { fadeIn },
    });
  }, [document.target, onPatch]);

  const handleFadeOutChange = useCallback((fadeOut: number) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { fadeOut },
    });
  }, [document.target, onPatch]);

  const handleLoopingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onPatch({
      type: 'updateTypeSpecificEditor',
      target: document.target,
      patch: { looping: e.target.checked },
    });
  }, [document.target, onPatch]);

  return (
    <div className="py-2">
      <FieldRow label="Audio File">
        <input
          type="text"
          className="w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
          value={editor.audioFile}
          onChange={(e) => handleFileChange(e.target.value)}
        />
      </FieldRow>

      <FieldRow label="Channels">
        <span className="text-xs text-gray-300 py-1">{editor.numChannels}</span>
      </FieldRow>

      <FieldRow label="Audio Duration">
        <span className="text-xs text-gray-300 py-1">{editor.audioDuration.toFixed(4)}</span>
      </FieldRow>

      <FieldRow label="File Start Time">
        <input
          type="number"
          className="w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
          value={editor.fileStartTime}
          step={0.01}
          onChange={(e) => handleFileStartTimeChange(parseFloat(e.target.value) || 0)}
        />
      </FieldRow>

      <FieldRow label="Fade In">
        <input
          type="number"
          className="w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
          value={editor.fadeIn}
          step={0.01}
          onChange={(e) => handleFadeInChange(parseFloat(e.target.value) || 0)}
        />
      </FieldRow>

      <FieldRow label="Fade Out">
        <input
          type="number"
          className="w-full rounded border border-blue-border bg-blue-bg px-2 py-1 text-xs text-gray-100 focus:border-blue-accent focus:outline-none"
          value={editor.fadeOut}
          step={0.01}
          onChange={(e) => handleFadeOutChange(parseFloat(e.target.value) || 0)}
        />
      </FieldRow>

      <FieldRow label="Looping">
        <input
          type="checkbox"
          checked={editor.looping}
          onChange={handleLoopingChange}
          className="rounded border border-blue-border"
        />
      </FieldRow>
    </div>
  );
}
