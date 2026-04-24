import React, { useState, useCallback } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { UdoDefinitionSnapshot } from '../../../../../../shared/project-editor';
import { Plus, Import } from 'lucide-react';

interface UDOTableProps {
  udolist: UdoDefinitionSnapshot[];
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
  onAddUdo: () => void;
  onImportUdo: () => void;
  onRemoveUdo: (index: number) => void;
  onCopyUdo: (index: number) => void;
  onCutUdo: (index: number) => void;
  onPasteUdo: () => void;
  onExportUdo: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  hasClipboard: boolean;
}

function MenuItem({
  children,
  disabled,
  onSelect,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}): React.ReactElement {
  return (
    <ContextMenu.Item
      className="editor-context-menu__item"
      disabled={disabled}
      onSelect={onSelect}
    >
      {children}
    </ContextMenu.Item>
  );
}

export default function UDOTable({
  udolist,
  selectedIndex,
  onSelectIndex,
  onAddUdo,
  onImportUdo,
  onRemoveUdo,
  onCopyUdo,
  onCutUdo,
  onPasteUdo,
  onExportUdo,
  onMoveUp,
  onMoveDown,
  hasClipboard,
}: UDOTableProps): React.ReactElement {
  const handleRowClick = useCallback(
    (index: number) => {
      onSelectIndex(index);
    },
    [onSelectIndex],
  );

  const handleAdd = useCallback(() => {
    onAddUdo();
  }, [onAddUdo]);

  const handleImport = useCallback(() => {
    onImportUdo();
  }, [onImportUdo]);

  const hasSelection = selectedIndex !== null;
  const hasUdos = udolist.length > 0;
  const canMoveUp = selectedIndex !== null && selectedIndex > 0;
  const canMoveDown = selectedIndex !== null && selectedIndex < udolist.length - 1;

  return (
    <div className="flex h-full flex-col bg-[#0a0f1a]">
      <div className="flex items-center gap-2 border-b border-blue-border bg-[#10192a] px-3 py-2">
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20"
          title="Add UDO"
        >
          <Plus size={14} />
          Add
        </button>
        <button
          type="button"
          onClick={handleImport}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20"
          title="Import UDO"
        >
          <Import size={14} />
          Import
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {!hasUdos ? (
          <div className="flex h-full items-center justify-center text-sm text-blue-muted">
            No UDOs defined. Click "Add" to create one.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#10192a]">
              <tr className="border-b border-blue-border">
                <th className="px-3 py-2 font-medium text-gray-100">Name</th>
                <th className="px-3 py-2 font-medium text-gray-100">Style</th>
                <th className="px-3 py-2 font-medium text-gray-100">Out Types</th>
                <th className="px-3 py-2 font-medium text-gray-100">
                  In Types / Input Args
                </th>
              </tr>
            </thead>
            <tbody>
              {udolist.map((udo, index) => (
                <ContextMenu.Root key={index}>
                  <ContextMenu.Trigger asChild>
                    <tr
                      onClick={() => handleRowClick(index)}
                      className={[
                        'border-b border-blue-border cursor-pointer hover:bg-blue-accent/10',
                        selectedIndex === index ? 'bg-blue-accent/20' : '',
                      ].join(' ')}
                    >
                      <td className="px-3 py-2 text-gray-100">{udo.name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            'rounded px-1.5 py-0.5 text-[10px] font-medium',
                            udo.style === 'CLASSIC'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300',
                          ].join(' ')}
                        >
                          {udo.style}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-300">{udo.outTypes || '-'}</td>
                      <td className="px-3 py-2 text-gray-300">
                        {udo.style === 'CLASSIC'
                          ? udo.inTypes || '-'
                          : udo.inputArguments || '-'}
                      </td>
                    </tr>
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenu.Content className="editor-context-menu">
                      <MenuItem
                        disabled={!canMoveUp}
                        onSelect={() => {
                          if (selectedIndex !== null) {
                            onMoveUp(selectedIndex);
                            onSelectIndex(selectedIndex - 1);
                          }
                        }}
                      >
                        Push Up
                      </MenuItem>
                      <MenuItem
                        disabled={!canMoveDown}
                        onSelect={() => {
                          if (selectedIndex !== null) {
                            onMoveDown(selectedIndex);
                            onSelectIndex(selectedIndex + 1);
                          }
                        }}
                      >
                        Push Down
                      </MenuItem>
                      <ContextMenu.Separator className="editor-context-menu__separator" />
                      <MenuItem
                        disabled={!hasSelection}
                        onSelect={() => {
                          if (selectedIndex !== null) {
                            onCopyUdo(selectedIndex);
                          }
                        }}
                      >
                        Copy
                      </MenuItem>
                      <MenuItem
                        disabled={!hasSelection}
                        onSelect={() => {
                          if (selectedIndex !== null) {
                            onCutUdo(selectedIndex);
                            onSelectIndex(null);
                          }
                        }}
                      >
                        Cut
                      </MenuItem>
                      <MenuItem disabled={!hasClipboard} onSelect={onPasteUdo}>
                        Paste
                      </MenuItem>
                      <ContextMenu.Separator className="editor-context-menu__separator" />
                      <MenuItem
                        disabled={!hasSelection}
                        onSelect={() => {
                          if (selectedIndex !== null) {
                            onExportUdo(selectedIndex);
                          }
                        }}
                      >
                        Export
                      </MenuItem>
                      <ContextMenu.Separator className="editor-context-menu__separator" />
                      <MenuItem
                        disabled={!hasSelection}
                        onSelect={() => {
                          if (selectedIndex !== null) {
                            onRemoveUdo(selectedIndex);
                            onSelectIndex(null);
                          }
                        }}
                      >
                        Remove
                      </MenuItem>
                    </ContextMenu.Content>
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
