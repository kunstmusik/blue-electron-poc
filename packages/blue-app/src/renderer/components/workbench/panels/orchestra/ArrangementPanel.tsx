import React, { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  InstrumentSnapshot,
  SupportedNewInstrumentType,
} from '../../../../../shared/project-editor';
import ArrangementContextMenu from './ArrangementContextMenu';
import { createArrangementColumns } from './arrangement-table/arrangement-columns';
import type { ArrangementPanelProps } from './types';

function AddButton({
  label,
  instrumentType,
  onAdd,
}: {
  label: string;
  instrumentType: SupportedNewInstrumentType;
  onAdd: (instrumentType: SupportedNewInstrumentType) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      className="rounded border border-blue-border bg-[#182542] px-2 py-1 text-xs text-gray-100 transition-colors hover:border-blue-accent"
      onClick={() => onAdd(instrumentType)}
    >
      {label}
    </button>
  );
}

export default function ArrangementPanel({
  orchestra,
  selectedAssignmentId,
  onSelectAssignment,
  onOrchestraPatch,
}: ArrangementPanelProps): JSX.Element {
  const [clipboardInstrument, setClipboardInstrument] = useState<InstrumentSnapshot | null>(null);
  const columns = useMemo(
    () =>
      createArrangementColumns({
        onToggleEnabled: (row) =>
          void onOrchestraPatch({
            type: 'updateAssignment',
            assignmentId: row.assignmentId,
            enabled: !row.enabled,
          }),
        onCommitAssignmentId: (row, assignmentId) => {
          const nextAssignmentId = assignmentId.trim();
          if (!nextAssignmentId || nextAssignmentId === row.assignmentId) return;
          void onOrchestraPatch({
            type: 'updateAssignment',
            assignmentId: row.assignmentId,
            nextAssignmentId,
          });
        },
      }),
    [onOrchestraPatch],
  );
  const table = useReactTable({
    data: orchestra.arrangement.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.assignmentId,
  });

  const selectedRowStillExists = useMemo(
    () =>
      selectedAssignmentId
        ? orchestra.arrangement.rows.some((row) => row.assignmentId === selectedAssignmentId)
        : false,
    [orchestra.arrangement.rows, selectedAssignmentId],
  );

  const addInstrument = (instrumentType: SupportedNewInstrumentType) => {
    void onOrchestraPatch({ type: 'addInstrument', instrumentType });
  };

  const copyAssignment = (assignmentId: string) => {
    const instrument = orchestra.instruments.find(
      (candidate) => candidate.assignmentId === assignmentId,
    );
    setClipboardInstrument(instrument ?? null);
  };

  const cutAssignment = (assignmentId: string) => {
    copyAssignment(assignmentId);
    void onOrchestraPatch({ type: 'removeAssignment', assignmentId });
  };

  const pasteAssignment = () => {
    if (!clipboardInstrument) return;
    void onOrchestraPatch({
      type: 'pasteInstrument',
      instrument: clipboardInstrument,
    });
  };

  return (
    <section
      className="flex h-full min-h-0 flex-col bg-[#111a2d]"
      aria-label="Arrangement"
    >
      <div className="flex items-center justify-between border-b border-blue-border bg-[#10192a] px-3 py-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-muted">
            Arrangement
          </div>
          <div className="text-[11px] text-blue-muted">
            {orchestra.arrangement.rows.length} instruments
            {selectedAssignmentId && !selectedRowStillExists ? ' · selection cleared' : ''}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AddButton label="Generic" instrumentType="generic" onAdd={addInstrument} />
          <AddButton label="BSB" instrumentType="blueSynthBuilder" onAdd={addInstrument} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#15223a] text-blue-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-blue-border px-2 py-1.5 font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const selected = row.original.assignmentId === selectedAssignmentId;
              return (
                <ArrangementContextMenu
                  key={row.id}
                  row={row.original}
                  hasClipboard={clipboardInstrument !== null}
                  onCopy={copyAssignment}
                  onCut={cutAssignment}
                  onPaste={pasteAssignment}
                  onOrchestraPatch={onOrchestraPatch}
                >
                  <tr
                    className={[
                      'cursor-default border-b border-blue-border/50 text-gray-200',
                      selected ? 'bg-[#23416d] text-white' : 'hover:bg-[#162844]',
                    ].join(' ')}
                    onClick={() => onSelectAssignment(row.original.assignmentId)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="truncate px-2 py-1.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                </ArrangementContextMenu>
              );
            })}
          </tbody>
        </table>

        {orchestra.arrangement.rows.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-blue-muted">
            Add an instrument to start building the project arrangement.
          </div>
        ) : null}
      </div>
    </section>
  );
}
