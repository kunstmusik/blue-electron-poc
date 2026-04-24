import React, { useEffect, useMemo, useState } from 'react';
import { useProjectStore } from '../../../stores/project-store';
import ArrangementPanel from './orchestra/ArrangementPanel';
import InstrumentEditorPanel from './orchestra/InstrumentEditorPanel';
import SplitPane from './orchestra/SplitPane';
import TemporaryInstrumentLibraryPanel from './orchestra/TemporaryInstrumentLibraryPanel';

function EmptyOrchestraState(): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center bg-blue-bg px-6 text-center text-blue-muted">
      <div className="max-w-md rounded-lg border border-blue-border bg-blue-surface/70 px-6 py-5">
        <div className="text-sm font-medium text-gray-100">No project loaded</div>
        <div className="mt-2 text-sm">
          Open a project to edit arrangement instruments and orchestra patches.
        </div>
      </div>
    </div>
  );
}

export default function OrchestraPanel(): JSX.Element {
  const loaded = useProjectStore((state) => state.loaded);
  const orchestra = useProjectStore((state) => state.orchestra);
  const updateOrchestra = useProjectStore((state) => state.updateOrchestra);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAssignmentId && orchestra.arrangement.rows.length > 0) {
      setSelectedAssignmentId(orchestra.arrangement.rows[0]!.assignmentId);
      return;
    }

    if (
      selectedAssignmentId &&
      !orchestra.arrangement.rows.some((row) => row.assignmentId === selectedAssignmentId)
    ) {
      setSelectedAssignmentId(orchestra.arrangement.rows[0]?.assignmentId ?? null);
    }
  }, [orchestra.arrangement.rows, selectedAssignmentId]);

  const selectedInstrument = useMemo(
    () =>
      selectedAssignmentId
        ? orchestra.instruments.find(
            (instrument) => instrument.assignmentId === selectedAssignmentId,
          )
        : undefined,
    [orchestra.instruments, selectedAssignmentId],
  );

  if (!loaded) {
    return <EmptyOrchestraState />;
  }

  return (
    <div className="h-full min-h-0 bg-blue-bg text-gray-100">
      <SplitPane
        ariaLabel="Resize arrangement and instrument editor panels"
        className="h-full min-h-0"
        firstClassName="min-w-[280px]"
        secondClassName="min-w-0"
        initialSplit={0.42}
        minFirstSize={300}
        minSecondSize={360}
        orientation="horizontal"
        first={
          <SplitPane
            ariaLabel="Resize arrangement and library panels"
            className="h-full min-h-0"
            firstClassName="min-h-0"
            secondClassName="min-h-0"
            initialSplit={0.78}
            minFirstSize={240}
            minSecondSize={120}
            orientation="vertical"
            first={
              <ArrangementPanel
                orchestra={orchestra}
                selectedAssignmentId={selectedAssignmentId}
                onSelectAssignment={setSelectedAssignmentId}
                onOrchestraPatch={updateOrchestra}
              />
            }
            second={<TemporaryInstrumentLibraryPanel library={orchestra.temporaryLibrary} />}
          />
        }
        second={
          <InstrumentEditorPanel instrument={selectedInstrument} onOrchestraPatch={updateOrchestra} />
        }
      />
    </div>
  );
}

