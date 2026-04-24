import React from 'react';
import type { PythonInstrumentSnapshot } from '../../../../../shared/project-editor';
import InstrumentNameField from './InstrumentNameField';
import type { SelectedInstrumentEditorProps } from './types';

export default function PythonInstrumentDummyPanel({
  instrument,
  onInstrumentPatch,
}: SelectedInstrumentEditorProps & {
  instrument: PythonInstrumentSnapshot;
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
          <div className="text-sm font-medium text-gray-100">Python editor deferred</div>
          <div className="mt-2 text-sm text-blue-muted">
            Python instrument XML is preserved, but execution/editor parity is deferred to a later slice.
          </div>
        </div>
      </div>
    </div>
  );
}

