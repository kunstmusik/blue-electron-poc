import React, { useCallback, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type {
  EffectsLibraryCategorySnapshot,
  EffectsLibrarySnapshot,
  MixerChainEntrySnapshot,
  MixerChainKind,
  MixerEffectEntrySnapshot,
  MixerSendEntrySnapshot,
} from '../../../../../shared/project-editor';

type MixerPatcher = (patch: Record<string, unknown>) => void;

interface EffectsChainContextMenuProps {
  children: React.ReactNode;
  entries: MixerChainEntrySnapshot[];
  selectedIndex: number;
  chain: MixerChainKind;
  channelId: string;
  isMaster: boolean;
  onPatch: MixerPatcher;
  onAddNewEffect: () => void;
  onOpenEffectEditor: (entry: MixerEffectEntrySnapshot) => void;
  onOpenSendEditor: (entry: MixerSendEntrySnapshot, chain: MixerChainKind) => void;
  onOpenEditEffectDialog: (entry: MixerEffectEntrySnapshot, chain: MixerChainKind) => void;
  librarySnapshot: EffectsLibrarySnapshot | null;
}

let bufferedEntry: MixerChainEntrySnapshot | null = null;

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

function populateCategoryMenu(
  category: EffectsLibraryCategorySnapshot,
  items: React.ReactNode[],
  onSelect: (effectXml: string) => void,
) {
  for (const sub of category.categories) {
    const subItems: React.ReactNode[] = [];
    populateCategoryMenu(sub, subItems, onSelect);
    items.push(
      <ContextMenu.Sub key={sub.categoryId}>
        <ContextMenu.SubTrigger className="editor-context-menu__item editor-context-menu__subtrigger">
          {sub.name}
        </ContextMenu.SubTrigger>
        <ContextMenu.Portal>
          <ContextMenu.SubContent
            className="editor-context-menu editor-context-menu--submenu"
            sideOffset={2}
            alignOffset={-4}
          >
            {subItems}
          </ContextMenu.SubContent>
        </ContextMenu.Portal>
      </ContextMenu.Sub>,
    );
  }
  for (const effect of category.effects) {
    items.push(
      <MenuItem
        key={effect.libraryEffectId}
        onSelect={() => onSelect(effect.effectXml)}
      >
        {effect.name}
      </MenuItem>,
    );
  }
}

export default function EffectsChainContextMenu({
  children,
  entries,
  selectedIndex,
  chain,
  channelId,
  isMaster,
  onPatch,
  onAddNewEffect,
  onOpenEffectEditor,
  onOpenSendEditor,
  onOpenEditEffectDialog,
  librarySnapshot,
}: EffectsChainContextMenuProps): React.ReactElement {
  const selected = selectedIndex >= 0 && selectedIndex < entries.length ? entries[selectedIndex] : null;
  const isEffect = selected?.kind === 'effect';
  const hasSelection = selected !== null;

  const handleAddFromLibrary = useCallback(
    (effectXml: string) => {
      onPatch({
        type: 'addEffectFromLibrary',
        channelId,
        chain,
        libraryEffectId: '__inline__',
        effectXml,
        entryId: crypto.randomUUID(),
      });
    },
    [onPatch, channelId, chain],
  );

  const libraryMenuItems: React.ReactNode[] = [];
  if (librarySnapshot) {
    populateCategoryMenu(librarySnapshot.root, libraryMenuItems, handleAddFromLibrary);
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="editor-context-menu">
          <MenuItem
            onSelect={onAddNewEffect}
          >
            Add New Effect
          </MenuItem>

          {libraryMenuItems.length > 0 ? (
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="editor-context-menu__item editor-context-menu__subtrigger">
                Add Effect from Library
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent
                  className="editor-context-menu editor-context-menu--submenu"
                  sideOffset={2}
                  alignOffset={-4}
                >
                  {libraryMenuItems}
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          ) : (
            <MenuItem disabled onSelect={() => {}}>
              Add Effect from Library
            </MenuItem>
          )}

          <ContextMenu.Separator className="editor-context-menu__separator" />

          <MenuItem
            disabled={isMaster}
            onSelect={() => {
              onPatch({
                type: 'addSend',
                channelId,
                chain,
                sendChannel: 'Master',
              });
            }}
          >
            Add Send
          </MenuItem>

          <ContextMenu.Separator className="editor-context-menu__separator" />

          <MenuItem
            disabled={selectedIndex <= 0}
            onSelect={() => {
              onPatch({
                type: 'reorderChainEntry',
                channelId,
                chain,
                from: selectedIndex,
                to: selectedIndex - 1,
              });
            }}
          >
            Push Up
          </MenuItem>
          <MenuItem
            disabled={!hasSelection || selectedIndex >= entries.length - 1}
            onSelect={() => {
              onPatch({
                type: 'reorderChainEntry',
                channelId,
                chain,
                from: selectedIndex,
                to: selectedIndex + 1,
              });
            }}
          >
            Push Down
          </MenuItem>

          <ContextMenu.Separator className="editor-context-menu__separator" />

          <MenuItem
            disabled={!hasSelection}
            onSelect={() => {
              if (!selected) return;
              if (selected.kind === 'effect') {
                onOpenEffectEditor(selected);
              } else {
                onOpenSendEditor(selected, chain);
              }
            }}
          >
            {isEffect ? 'Open Editor for Effect' : hasSelection ? 'Open Editor for Send' : 'Open Editor'}
          </MenuItem>

          <MenuItem
            disabled={!isEffect || !hasSelection}
            onSelect={() => {
              if (isEffect && selected) {
                onOpenEditEffectDialog(selected, chain);
              }
            }}
          >
            Edit Effect Definition
          </MenuItem>

          <MenuItem
            disabled={!hasSelection}
            onSelect={() => {
              if (!selected) return;
              onPatch({
                type: selected.kind === 'effect' ? 'updateEffect' : 'updateSend',
                channelId,
                chain,
                entryId: selected.entryId,
                patch: { enabled: !selected.enabled },
              });
            }}
          >
            {selected?.enabled ? (isEffect ? 'Disable Effect' : 'Disable Send') : isEffect ? 'Enable Effect' : 'Enable Send'}
          </MenuItem>

          <ContextMenu.Separator className="editor-context-menu__separator" />

          <MenuItem
            disabled={!hasSelection}
            onSelect={() => {
              if (!selected) return;
              onPatch({
                type: 'duplicateChainEntry',
                channelId,
                chain,
                entryId: selected.entryId,
              });
            }}
          >
            Duplicate
          </MenuItem>

          <ContextMenu.Separator className="editor-context-menu__separator" />

          <MenuItem
            disabled={!hasSelection}
            onSelect={() => {
              if (!selected) return;
              bufferedEntry = { ...selected };
              onPatch({
                type: 'removeChainEntry',
                channelId,
                chain,
                entryId: selected.entryId,
              });
            }}
          >
            Cut
          </MenuItem>
          <MenuItem
            disabled={!hasSelection}
            onSelect={() => {
              if (!selected) return;
              bufferedEntry = { ...selected };
              onPatch({
                type: 'copyChainEntry',
                channelId,
                chain,
                entryId: selected.entryId,
              });
            }}
          >
            Copy
          </MenuItem>
          <MenuItem
            disabled={bufferedEntry == null || bufferedEntry.kind !== 'effect'}
            onSelect={() => {
              if (bufferedEntry?.kind === 'effect') {
                onPatch({
                  type: 'addEffectFromLibrary',
                  channelId,
                  chain,
                  libraryEffectId: '__clipboard__',
                  effectXml: bufferedEntry.effectXml,
                  entryId: crypto.randomUUID(),
                });
              }
            }}
          >
            Paste
          </MenuItem>

          <ContextMenu.Separator className="editor-context-menu__separator" />

          <MenuItem
            disabled={!hasSelection}
            onSelect={() => {
              if (!selected) return;
              onPatch({
                type: 'removeChainEntry',
                channelId,
                chain,
                entryId: selected.entryId,
              });
            }}
          >
            Remove
          </MenuItem>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
