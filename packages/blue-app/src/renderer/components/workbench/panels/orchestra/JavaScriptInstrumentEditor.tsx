import React, { useState } from 'react';
import type { JavaScriptInstrumentSnapshot } from '../../../../../shared/project-editor';
import SelectedCodeEditor from '../editors/SelectedCodeEditor';
import DeferredOpcodeListPanel from './DeferredOpcodeListPanel';
import type { SelectedInstrumentEditorProps } from './types';

type JavaScriptTab = 'instrument' | 'udo' | 'globalOrc' | 'globalSco';

const JAVASCRIPT_TABS: Array<{ key: JavaScriptTab; label: string }> = [
  { key: 'instrument', label: 'Instrument' },
  { key: 'udo', label: 'UDO' },
  { key: 'globalOrc', label: 'Global Orc' },
  { key: 'globalSco', label: 'Global Sco' },
];

export default function JavaScriptInstrumentEditor({
  instrument,
  onInstrumentPatch,
}: SelectedInstrumentEditorProps & {
  instrument: JavaScriptInstrumentSnapshot;
}): React.ReactElement {
  const [activeTab, setActiveTab] = useState<JavaScriptTab>('instrument');

  return (
    <div className="flex h-full min-h-0 flex-col bg-blue-bg">
      <div className="flex items-center gap-1 border-b border-blue-border bg-[#10192a] px-2">
        {JAVASCRIPT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={[
              'border-b-2 px-3 py-2 text-xs',
              activeTab === tab.key
                ? 'border-blue-accent text-gray-100'
                : 'border-transparent text-blue-muted hover:text-gray-100',
            ].join(' ')}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative min-h-0 flex-1">
        {JAVASCRIPT_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <div
              key={tab.key}
              className={isActive ? 'relative h-full p-3' : 'pointer-events-none absolute inset-0 p-3'}
              aria-hidden={!isActive}
              style={{ visibility: isActive ? 'visible' : 'hidden' }}
            >
              {tab.key === 'instrument' ? (
                <textarea
                  className="h-full w-full resize-none rounded-lg border border-blue-border bg-[#0d1524] px-4 py-3 font-mono text-sm text-gray-100 outline-none transition-colors placeholder:text-blue-muted focus:border-blue-accent"
                  spellCheck={false}
                  value={instrument.text}
                  onChange={(event) => void onInstrumentPatch({ text: event.target.value })}
                />
              ) : tab.key === 'udo' ? (
                <DeferredOpcodeListPanel message="Embedded opcode-list editing for JavaScript instruments is deferred in this slice." />
              ) : (
                <SelectedCodeEditor
                  active={isActive}
                  value={tab.key === 'globalOrc' ? instrument.globalOrc : instrument.globalSco}
                  placeholder={`Enter ${tab.label} code`}
                  ariaLabel={`${instrument.name || 'JavaScript Instrument'} ${tab.label} code editor`}
                  onChange={(nextValue) =>
                    void onInstrumentPatch(
                      tab.key === 'globalOrc'
                        ? { globalOrc: nextValue }
                        : { globalSco: nextValue },
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

