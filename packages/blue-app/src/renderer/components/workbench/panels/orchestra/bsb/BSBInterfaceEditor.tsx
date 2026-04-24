import React from 'react';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  InstrumentPatch,
} from '../../../../../../shared/project-editor';
import BSBWidgetEditor from './BSBWidgetEditor';

interface BSBInterfaceEditorProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

export default function BSBInterfaceEditor({
  instrument,
  onInstrumentPatch,
}: BSBInterfaceEditorProps): JSX.Element {
  return (
    <div className="h-full overflow-auto bg-blue-bg p-4">
      <div className="mb-4 rounded-lg border border-blue-border bg-blue-surface/50 px-4 py-3">
        <div className="text-sm font-medium text-gray-100">Interface</div>
        <div className="mt-1 text-sm text-blue-muted">
          Widget layout editing is scaffolded here; currently ported widgets expose replacement keys for code completion.
        </div>
      </div>
      <BSBWidgetEditor
        widgets={instrument.widgets}
        onInstrumentPatch={onInstrumentPatch}
      />
    </div>
  );
}
