import React from 'react';
import type { BlueX7InstrumentSnapshot } from '../../../../../shared/project-editor';
import InstrumentNameField from './InstrumentNameField';
import type { SelectedInstrumentEditorProps } from './types';

export default function BlueX7Editor({
  instrument,
  onInstrumentPatch,
}: SelectedInstrumentEditorProps & {
  instrument: BlueX7InstrumentSnapshot;
}): React.ReactElement {
  return (
    <div className="flex h-full flex-col bg-blue-bg">
      <div className="border-b border-blue-border bg-[#10192a] px-3 py-2">
        <InstrumentNameField
          name={instrument.name}
          onNameChange={(name) => onInstrumentPatch({ name })}
        />
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-blue-border bg-blue-surface/70 px-6 py-5 text-center">
          <div className="text-sm font-medium text-gray-100">BlueX7</div>
          <div className="mt-2 text-sm text-blue-muted">
            BlueX7 project data is preserved. Detailed FM parameter editing remains a follow-on parity task.
          </div>
        </div>
      </div>
    </div>
  );
}

