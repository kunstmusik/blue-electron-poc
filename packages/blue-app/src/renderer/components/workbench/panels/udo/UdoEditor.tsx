import React, { useCallback, useEffect, useState } from 'react';
import { Play } from 'lucide-react';

import type { UdoDefinitionSnapshot } from '../../../../../shared/project-editor';
import SelectedCodeEditor from '../editors/SelectedCodeEditor';

interface UdoEditorProps {
  udo: UdoDefinitionSnapshot | null;
  onUpdateUdo: (patch: Partial<UdoDefinitionSnapshot>) => void;
  onConvertStyle: (style: 'CLASSIC' | 'MODERN') => void;
  onTestOpcode: () => void;
}

type EditorTab = 'code' | 'comments';

export default function UdoEditor({
  udo,
  onUpdateUdo,
  onConvertStyle,
  onTestOpcode,
}: UdoEditorProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<EditorTab>('code');
  const [localCode, setLocalCode] = useState('');
  const [localComments, setLocalComments] = useState('');

  useEffect(() => {
    if (!udo) {
      setLocalCode('');
      setLocalComments('');
      return;
    }

    setLocalCode(udo.code);
    setLocalComments(udo.comments);
  }, [udo]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateUdo({ name: event.target.value });
    },
    [onUpdateUdo],
  );

  const handleStyleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onConvertStyle(event.target.value as 'CLASSIC' | 'MODERN');
    },
    [onConvertStyle],
  );

  const handleOutTypesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateUdo({ outTypes: event.target.value });
    },
    [onUpdateUdo],
  );

  const handleInTypesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateUdo({ inTypes: event.target.value });
    },
    [onUpdateUdo],
  );

  const handleInputArgumentsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateUdo({ inputArguments: event.target.value });
    },
    [onUpdateUdo],
  );

  const handleCodeChange = useCallback(
    (code: string) => {
      setLocalCode(code);
      onUpdateUdo({ code });
    },
    [onUpdateUdo],
  );

  const handleCommentsChange = useCallback(
    (comments: string) => {
      setLocalComments(comments);
      onUpdateUdo({ comments });
    },
    [onUpdateUdo],
  );

  if (!udo) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0f1a] text-sm text-blue-muted">
        Select a single UDO to edit its properties.
      </div>
    );
  }

  const isModern = udo.style === 'MODERN';

  return (
    <div className="flex h-full flex-col bg-[#0a0f1a]">
      <div className="border-b border-blue-border bg-[#10192a] px-3 py-2">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-400">
              Opcode Name
            </label>
            <input
              type="text"
              value={udo.name}
              onChange={handleNameChange}
              className="w-full rounded border border-blue-border bg-[#0a0f1a] px-2 py-1 text-sm text-gray-100 focus:border-blue-accent focus:outline-none"
            />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-400">
              Style
            </label>
            <select
              value={udo.style}
              onChange={handleStyleChange}
              className="w-full rounded border border-blue-border bg-[#0a0f1a] px-2 py-1 text-sm text-gray-100 focus:border-blue-accent focus:outline-none"
            >
              <option value="CLASSIC">Classic</option>
              <option value="MODERN">Modern</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onTestOpcode}
            className="flex items-center gap-1 rounded bg-blue-accent px-3 py-1 text-xs font-medium text-gray-100 hover:bg-blue-accent/80"
          >
            <Play size={12} />
            Test Opcode
          </button>
        </div>

        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-400">
              Out Types
            </label>
            <input
              type="text"
              value={udo.outTypes}
              onChange={handleOutTypesChange}
              placeholder="e.g., k, a"
              className="w-full rounded border border-blue-border bg-[#0a0f1a] px-2 py-1 text-sm text-gray-100 focus:border-blue-accent focus:outline-none"
            />
          </div>
          {isModern ? (
            <div className="flex-1">
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-400">
                Input Arguments
              </label>
              <input
                type="text"
                value={udo.inputArguments}
                onChange={handleInputArgumentsChange}
                placeholder="e.g., kfreq, kamp"
                className="w-full rounded border border-blue-border bg-[#0a0f1a] px-2 py-1 text-sm text-gray-100 focus:border-blue-accent focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex-1">
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-400">
                In Types
              </label>
              <input
                type="text"
                value={udo.inTypes}
                onChange={handleInTypesChange}
                placeholder="e.g., k, k"
                className="w-full rounded border border-blue-border bg-[#0a0f1a] px-2 py-1 text-sm text-gray-100 focus:border-blue-accent focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-blue-border bg-[#10192a] px-2">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={[
              'border-b-2 px-3 py-2 text-xs',
              activeTab === 'code'
                ? 'border-blue-accent text-gray-100'
                : 'border-transparent text-blue-muted hover:text-gray-100',
            ].join(' ')}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={[
              'border-b-2 px-3 py-2 text-xs',
              activeTab === 'comments'
                ? 'border-blue-accent text-gray-100'
                : 'border-transparent text-blue-muted hover:text-gray-100',
            ].join(' ')}
          >
            Comments
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {activeTab === 'code' ? (
          <SelectedCodeEditor
            value={localCode}
            onChange={handleCodeChange}
            ariaLabel="UDO code editor"
            mode="orc"
          />
        ) : (
          <SelectedCodeEditor
            value={localComments}
            onChange={handleCommentsChange}
            ariaLabel="UDO comments editor"
            mode="text"
            placeholder="Add comments about this UDO..."
          />
        )}
      </div>
    </div>
  );
}
