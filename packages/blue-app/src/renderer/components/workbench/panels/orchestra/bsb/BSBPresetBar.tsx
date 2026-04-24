import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbInterfacePatch,
  PresetGroupSnapshot,
} from '../../../../../../shared/project-editor';

interface BSBPresetBarProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
}

export default function BSBPresetBar({
  instrument,
  onBsbInterfacePatch,
}: BSBPresetBarProps): React.ReactElement {
  const presetGroup = instrument.presetGroup;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleUpdatePreset = useCallback(() => {
    if (!presetGroup?.currentPresetUniqueId) return;
    onBsbInterfacePatch({ type: 'updatePreset', presetUniqueId: presetGroup.currentPresetUniqueId });
  }, [presetGroup, onBsbInterfacePatch]);

  const handleAddPreset = useCallback(() => {
    const presetName = window.prompt('Enter Preset Name');
    if (!presetName || presetName.trim().length === 0) return;
    onBsbInterfacePatch({ type: 'addPreset', presetName: presetName.trim() });
  }, [onBsbInterfacePatch]);

  const handleAddFolder = useCallback(() => {
    const folderName = window.prompt('Enter Folder Name');
    if (!folderName || folderName.trim().length === 0) return;
    onBsbInterfacePatch({ type: 'addPresetGroup', groupName: folderName.trim() });
  }, [onBsbInterfacePatch]);

  const handleSynchronizePresets = useCallback(() => {
    onBsbInterfacePatch({ type: 'synchronizePresets' });
  }, [onBsbInterfacePatch]);

  const handleManagePresets = useCallback(() => {
    alert('Manage Presets - opens dialog for full preset management (to be implemented)');
  }, []);

  const getCurrentPresetPath = useCallback((): string => {
    if (!presetGroup || !presetGroup.currentPresetUniqueId) {
      return 'No Preset Selected';
    }

    const findPath = (
      group: PresetGroupSnapshot,
      path: string,
    ): string | null => {
      const currentPath = path ? `${path} / ${group.name}` : '';

      for (const preset of group.presets) {
        if (preset.uniqueId === presetGroup.currentPresetUniqueId) {
          return `${currentPath} / ${preset.name}`;
        }
      }

      for (const sub of group.subGroups) {
        const found = findPath(sub, currentPath);
        if (found) return found;
      }

      return null;
    };

    const path = findPath(presetGroup, '');
    return path ? ` Current Preset:${path}` : ' No Preset Selected';
  }, [presetGroup]);

  const renderPresetMenu = useCallback(
    (group: PresetGroupSnapshot, depth: number = 0): React.ReactElement => {
      const hasSubGroups = group.subGroups.length > 0;
      const hasPresets = group.presets.length > 0;

      return (
        <>
          {group.subGroups.map((subGroup) => (
            <DropdownMenu.Sub key={subGroup.name}>
              <DropdownMenu.SubTrigger className="flex items-center justify-between px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none">
                <span>{subGroup.name}</span>
                <ChevronDown size={12} className="ml-2" />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent className="min-w-[150px] rounded-md border border-blue-border bg-[#10192a] p-1 shadow-lg">
                {renderPresetMenu(subGroup, depth + 1)}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          ))}

          {group.presets.map((preset) => (
            <DropdownMenu.Item
              key={preset.uniqueId}
              className="px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none cursor-pointer"
              onClick={() => {
                onBsbInterfacePatch({ type: 'applyPreset', presetUniqueId: preset.uniqueId });
                setMenuOpen(false);
              }}
            >
              {preset.name}
            </DropdownMenu.Item>
          ))}

          {(hasSubGroups || hasPresets) && depth === 0 && (
            <DropdownMenu.Separator className="my-1 h-px bg-blue-border" />
          )}

          {depth === 0 && (
            <>
              <DropdownMenu.Item
                className="px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none cursor-pointer"
                onClick={handleAddFolder}
              >
                Add Folder
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none cursor-pointer"
                onClick={handleAddPreset}
              >
                Add Preset
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-blue-border" />
              <DropdownMenu.Item
                className="px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none cursor-pointer"
                onClick={handleSynchronizePresets}
              >
                Synchronize Presets
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none cursor-pointer"
                onClick={handleManagePresets}
              >
                Manage Presets
              </DropdownMenu.Item>
            </>
          )}
        </>
      );
    },
    [onBsbInterfacePatch, handleAddFolder, handleAddPreset, handleSynchronizePresets, handleManagePresets],
  );

  const currentPresetPath = getCurrentPresetPath();
  const hasCurrentPreset = presetGroup?.currentPresetUniqueId !== null && presetGroup?.currentPresetUniqueId !== '';
  const canUpdate = hasCurrentPreset && presetGroup?.currentPresetModified;

  return (
    <div className="flex items-center gap-2 w-full pr-2">
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none"
          >
            Presets
            <ChevronDown size={12} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[150px] rounded-md border border-blue-border bg-[#10192a] p-1 shadow-lg">
            {presetGroup ? renderPresetMenu(presetGroup) : <div className="px-2 py-1 text-xs text-blue-muted">No presets</div>}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <input
        type="text"
        readOnly
        value={currentPresetPath}
        className="flex-1 min-w-0 bg-transparent border-none text-xs text-gray-100 outline-none"
        style={{ textOverflow: 'ellipsis' }}
      />

      <button
        type="button"
        disabled={!canUpdate}
        onClick={handleUpdatePreset}
        className="rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 disabled:opacity-50 disabled:cursor-not-allowed outline-none"
      >
        Update
      </button>

      {presetGroup?.currentPresetModified && (
        <span className="text-[10px] text-yellow-400">modified</span>
      )}
    </div>
  );
}
