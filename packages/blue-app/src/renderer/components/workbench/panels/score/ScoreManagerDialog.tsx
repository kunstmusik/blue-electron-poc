import { useState, useCallback, useRef, useEffect } from 'react';
import { useProjectStore } from '../../../../stores/project-store';
import type { ScoreDocumentSnapshot, ScoreLayerGroupSnapshot, ScoreLayerSnapshot } from '../../../../../shared/project-editor';

interface Props {
  score: ScoreDocumentSnapshot;
  onClose: () => void;
}

export default function ScoreManagerDialog({ score, onClose }: Props) {
  const applyPatch = useProjectStore((s) => s.applyProjectDocumentPatch);
  const addLayer = useProjectStore((s) => s.addLayer);
  const removeLayer = useProjectStore((s) => s.removeLayer);

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(-1);
  const [editingGroupRow, setEditingGroupRow] = useState(-1);
  const [editGroupName, setEditGroupName] = useState('');
  const [editingLayerRow, setEditingLayerRow] = useState(-1);
  const [editLayerName, setEditLayerName] = useState('');

  const groups = score.layerGroups;
  const selectedGroup = groups[selectedGroupIndex];
  const layers = selectedGroup?.layers ?? [];

  const handleAddLayerGroup = useCallback(() => {
    applyPatch({ score: { type: 'addLayerGroup', insertAtIndex: selectedGroupIndex >= 0 ? selectedGroupIndex + 1 : undefined } });
  }, [selectedGroupIndex, applyPatch]);

  const handleRemoveLayerGroup = useCallback(() => {
    if (!selectedGroup) return;
    if (!confirm('Deleting Layer Groups can not be undone. Please Confirm.')) return;
    applyPatch({ score: { type: 'removeLayerGroup', groupId: selectedGroup.groupId } });
    setSelectedGroupIndex(Math.max(0, selectedGroupIndex - 1));
    setSelectedLayerIndex(-1);
  }, [selectedGroup, selectedGroupIndex, applyPatch]);

  const handlePushGroupUp = useCallback(() => {
    if (selectedGroupIndex <= 0) return;
    applyPatch({ score: { type: 'moveLayerGroup', groupId: groups[selectedGroupIndex]!.groupId, targetIndex: selectedGroupIndex - 1 } });
    setSelectedGroupIndex(selectedGroupIndex - 1);
  }, [selectedGroupIndex, groups, applyPatch]);

  const handlePushGroupDown = useCallback(() => {
    if (selectedGroupIndex >= groups.length - 1) return;
    applyPatch({ score: { type: 'moveLayerGroup', groupId: groups[selectedGroupIndex]!.groupId, targetIndex: selectedGroupIndex + 1 } });
    setSelectedGroupIndex(selectedGroupIndex + 1);
  }, [selectedGroupIndex, groups, applyPatch]);

  const commitGroupRename = useCallback(() => {
    setEditingGroupRow(-1);
    const trimmed = editGroupName.trim();
    if (trimmed && selectedGroup && trimmed !== (selectedGroup.name || '')) {
      applyPatch({ score: { type: 'renameLayerGroup', groupId: selectedGroup.groupId, name: trimmed } });
    }
  }, [editGroupName, selectedGroup, applyPatch]);

  const handleGroupDoubleClick = useCallback((index: number) => {
    const g = groups[index];
    if (!g) return;
    setEditGroupName(g.name || g.groupId);
    setEditingGroupRow(index);
  }, [groups]);

  const handleAddLayer = useCallback(() => {
    if (!selectedGroup) return;
    const idx = selectedLayerIndex >= 0 ? selectedLayerIndex : layers.length - 1;
    addLayer(selectedGroup.groupId, idx);
    setSelectedLayerIndex(idx + 1);
  }, [selectedGroup, selectedLayerIndex, layers.length, addLayer]);

  const handleRemoveLayer = useCallback(() => {
    if (!selectedGroup || selectedLayerIndex < 0) return;
    if (layers.length <= 1) return;
    const count = 1;
    if (!confirm(`Delete ${count} layer(s)?`)) return;
    removeLayer(selectedGroup.groupId, selectedLayerIndex);
    setSelectedLayerIndex(-1);
  }, [selectedGroup, selectedLayerIndex, layers.length, removeLayer]);

  const handlePushLayerUp = useCallback(() => {
    if (!selectedGroup || selectedLayerIndex <= 0) return;
    applyPatch({ score: { type: 'moveLayer', groupId: selectedGroup.groupId, layerIndex: selectedLayerIndex, targetIndex: selectedLayerIndex - 1 } });
    setSelectedLayerIndex(selectedLayerIndex - 1);
  }, [selectedGroup, selectedLayerIndex, applyPatch]);

  const handlePushLayerDown = useCallback(() => {
    if (!selectedGroup || selectedLayerIndex < 0 || selectedLayerIndex >= layers.length - 1) return;
    applyPatch({ score: { type: 'moveLayer', groupId: selectedGroup.groupId, layerIndex: selectedLayerIndex, targetIndex: selectedLayerIndex + 1 } });
    setSelectedLayerIndex(selectedLayerIndex + 1);
  }, [selectedGroup, selectedLayerIndex, layers.length, applyPatch]);

  const commitLayerRename = useCallback(() => {
    setEditingLayerRow(-1);
    if (selectedLayerIndex < 0 || !selectedGroup) return;
    const trimmed = editLayerName.trim();
    const layer = layers[selectedLayerIndex];
    if (trimmed && layer && trimmed !== layer.name) {
      applyPatch({
        score: {
          type: 'renameLayer',
          groupId: selectedGroup.groupId,
          layerIndex: selectedLayerIndex,
          name: trimmed,
        },
      });
    }
  }, [editLayerName, selectedLayerIndex, selectedGroup, layers, applyPatch]);

  const handleLayerDoubleClick = useCallback((index: number) => {
    if (!selectedGroup) return;
    const layer = layers[index];
    if (!layer) return;
    setEditLayerName(layer.name);
    setEditingLayerRow(index);
    setSelectedLayerIndex(index);
  }, [selectedGroup, layers]);

  const btnClass = 'px-1.5 py-0.5 text-[11px] rounded border border-blue-border/40 bg-blue-surface/60 text-blue-text hover:bg-blue-surface disabled:opacity-40 min-w-[28px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] border border-blue-border/50 rounded-lg shadow-2xl flex flex-col"
        style={{ width: 760, height: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-border/30">
          <span className="text-sm font-medium text-blue-text">Score Manager</span>
          <button className="text-blue-muted hover:text-blue-text text-lg leading-none" onClick={onClose}>&times;</button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col border-r border-blue-border/30" style={{ width: 200 }}>
            <div className="flex items-center gap-1 px-2 py-1 border-b border-blue-border/20">
              <button className={btnClass} onClick={handlePushGroupUp} disabled={selectedGroupIndex <= 0} title="Push Up">&#9650;</button>
              <button className={btnClass} onClick={handlePushGroupDown} disabled={selectedGroupIndex >= groups.length - 1} title="Push Down">&#9660;</button>
              <button className={btnClass} onClick={handleAddLayerGroup} title="Add Layer Group">+</button>
              <button className={btnClass} onClick={handleRemoveLayerGroup} disabled={!selectedGroup} title="Remove Layer Group">-</button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {groups.map((g, i) => (
                <GroupRow
                  key={g.groupId}
                  group={g}
                  index={i}
                  selected={i === selectedGroupIndex}
                  editing={editingGroupRow === i}
                  editValue={editGroupName}
                  onEditValueChange={setEditGroupName}
                  onCommitEdit={commitGroupRename}
                  onCancelEdit={() => setEditingGroupRow(-1)}
                  onSelect={() => { setSelectedGroupIndex(i); setSelectedLayerIndex(-1); setEditingGroupRow(-1); setEditingLayerRow(-1); }}
                  onDoubleClick={() => handleGroupDoubleClick(i)}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-1 px-2 py-1 border-b border-blue-border/20">
              <button className={btnClass} onClick={handlePushLayerUp} disabled={!selectedGroup || selectedLayerIndex <= 0} title="Push Up">&#9650;</button>
              <button className={btnClass} onClick={handlePushLayerDown} disabled={!selectedGroup || selectedLayerIndex < 0 || selectedLayerIndex >= layers.length - 1} title="Push Down">&#9660;</button>
              <button className={btnClass} onClick={handleAddLayer} disabled={!selectedGroup} title="Add Layer">+</button>
              <button className={btnClass} onClick={handleRemoveLayer} disabled={!selectedGroup || selectedLayerIndex < 0 || layers.length <= 1} title="Remove Layer">-</button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-blue-border/20 text-blue-muted text-left">
                    <th className="px-2 py-1 font-normal" style={{ width: 50 }}>#</th>
                    <th className="px-2 py-1 font-normal">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {layers.map((layer, i) => (
                    <LayerRow
                      key={layer.layerId}
                      layer={layer}
                      index={i}
                      selected={i === selectedLayerIndex}
                      editing={editingLayerRow === i}
                      editValue={editLayerName}
                      onEditValueChange={setEditLayerName}
                      onCommitEdit={commitLayerRename}
                      onCancelEdit={() => setEditingLayerRow(-1)}
                      onSelect={() => { setSelectedLayerIndex(i); setEditingLayerRow(-1); }}
                      onDoubleClick={() => handleLayerDoubleClick(i)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupRow({ group, index, selected, editing, editValue, onEditValueChange, onCommitEdit, onCancelEdit, onSelect, onDoubleClick }: {
  group: ScoreLayerGroupSnapshot;
  index: number;
  selected: boolean;
  editing: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onSelect: () => void;
  onDoubleClick: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <div
      className={`px-2 py-1 text-[11px] cursor-pointer truncate border-b border-blue-border/10 ${
        selected ? 'bg-blue-accent/20 text-blue-text' : 'text-blue-muted hover:bg-blue-surface/40'
      }`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="w-full bg-blue-surface/60 text-blue-text text-[11px] outline-none border border-blue-accent/40 rounded-sm px-1"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onCommitEdit(); if (e.key === 'Escape') onCancelEdit(); }}
          onBlur={onCommitEdit}
        />
      ) : (
        group.name || group.groupId
      )}
    </div>
  );
}

function LayerRow({ layer, index, selected, editing, editValue, onEditValueChange, onCommitEdit, onCancelEdit, onSelect, onDoubleClick }: {
  layer: ScoreLayerSnapshot;
  index: number;
  selected: boolean;
  editing: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onSelect: () => void;
  onDoubleClick: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <tr
      className={`cursor-pointer ${
        selected
          ? 'bg-blue-accent/25 text-blue-text'
          : index % 2 === 0
            ? 'bg-[#14142a] text-blue-muted hover:bg-blue-surface/40'
            : 'bg-[#1c1c3a] text-blue-muted hover:bg-blue-surface/40'
      }`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <td className="px-2 py-1 border-b border-blue-border/10">{index + 1}</td>
      <td className="px-2 py-1 border-b border-blue-border/10">
        {editing ? (
          <input
            ref={inputRef}
            className="w-full bg-blue-surface/60 text-blue-text text-[11px] outline-none border border-blue-accent/40 rounded-sm px-1"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onCommitEdit(); if (e.key === 'Escape') onCancelEdit(); }}
            onBlur={onCommitEdit}
          />
        ) : (
          layer.name
        )}
      </td>
    </tr>
  );
}
