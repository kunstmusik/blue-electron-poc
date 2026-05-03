import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import type {
  EffectEditorRequest,
  EffectsLibrarySnapshot,
  MixerChainKind,
  MixerPatch,
} from '../../../../shared/project-editor';
import { useProjectStore } from '../../../stores/project-store';
import { usePlaybackStore } from '../../../stores/playback-store';
import { useBlueLiveStore } from '../../../stores/blue-live-store';
import { deriveMixerPlaybackUiState } from '../../../stores/mixer-playback-ui';
import { useUIStore } from '../../../stores/ui-store';
import ChannelStrip from './mixer/ChannelStrip';

export default function MixerPanel(): React.ReactElement {
  const loaded = useProjectStore((state) => state.loaded);
  const mixer = useProjectStore((state) => state.mixer);
  const applyProjectDocumentPatch = useProjectStore((state) => state.applyProjectDocumentPatch);
  const openEffectsLibrary = useUIStore((state) => state.openEffectsLibrary);

  const playbackStatus = usePlaybackStore((s) => s.status);
  const blueLiveStatus = useBlueLiveStore((s) => s.status);

  const playbackUi = useMemo(
    () => deriveMixerPlaybackUiState({ playbackStatus, blueLiveStatus }),
    [playbackStatus, blueLiveStatus],
  );

  const [librarySnapshot, setLibrarySnapshot] = useState<EffectsLibrarySnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    window.blueAPI.getEffectsLibrary().then((snap) => {
      if (!cancelled) setLibrarySnapshot(snap);
    });
    return () => { cancelled = true; };
  }, []);

  const handleMixerPatch = useCallback(
    (patch: Record<string, unknown>) => {
      void applyProjectDocumentPatch({ mixer: patch as MixerPatch });
    },
    [applyProjectDocumentPatch],
  );

  const handleOpenLibrary = useCallback(
    (channelId: string, chain: MixerChainKind) => {
      openEffectsLibrary({ channelId, chain });
    },
    [openEffectsLibrary],
  );

  const handleOpenEffectEditor = useCallback((request: EffectEditorRequest) => {
    void window.blueAPI.openEffectEditor(request);
  }, []);

  const handleOpenEffectInterface = useCallback((request: EffectEditorRequest) => {
    void window.blueAPI.openEffectInterface(request);
  }, []);

  const handleRemoveSubChannel = useCallback(
    (channelId: string) => {
      handleMixerPatch({ type: 'removeSubChannel', channelId });
    },
    [handleMixerPatch],
  );

  if (!loaded) {
    return (
      <div className="workbench-panel-shell">
        <div className="workbench-panel-shell__content">
          <div className="flex h-full items-center justify-center text-sm text-blue-muted">
            No project loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workbench-panel-shell">
      <div className="workbench-panel-shell__content mixer-panel">
        <div className="mixer-toolbar">
          <label className="mixer-toolbar__check">
            <input
              type="checkbox"
              checked={mixer.enabled}
              onChange={(event) => handleMixerPatch({ type: 'setMixerEnabled', value: event.target.checked })}
              className="accent-blue-accent"
            />
            <span>Enabled</span>
          </label>
          <label className="mixer-toolbar__field">
            <span>Extra render time</span>
            <input
              type="number"
              value={mixer.extraRenderTime}
              onChange={(event) => handleMixerPatch({ type: 'updateExtraRenderTime', value: Number(event.target.value) })}
              className="mixer-toolbar__input"
            />
          </label>
          <button
            type="button"
            className="toolbar-text-button"
            onClick={() => handleMixerPatch({ type: 'addSubChannel', name: undefined })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Subchannel
          </button>
          {playbackUi.isPlaying || playbackUi.isBlueLiveActive ? (
            <span className="mixer-playback-badge" title={playbackUi.statusLabel}>
              {playbackUi.statusLabel}
            </span>
          ) : null}
        </div>

        <div className="mixer-main">
          <div className="mixer-channels-scroll">
            {mixer.channels.length > 0 && (
              <div className="mixer-channel-group">
                {mixer.channels.map((channel) => (
                  <ChannelStrip
                    key={channel.id}
                    mixer={mixer}
                    channel={channel}
                    isMaster={false}
                    isSubChannel={false}
                    librarySnapshot={librarySnapshot}
                    onPatch={handleMixerPatch}
                    onOpenLibrary={handleOpenLibrary}
                    onOpenEffectEditor={handleOpenEffectEditor}
                    onOpenEffectInterface={handleOpenEffectInterface}
                  />
                ))}
              </div>
            )}
            {mixer.subChannels.length > 0 && (
              <div className="mixer-channel-group">
                {mixer.subChannels.map((channel) => (
                  <ChannelStrip
                    key={channel.id}
                    mixer={mixer}
                    channel={channel}
                    isMaster={false}
                    isSubChannel
                    librarySnapshot={librarySnapshot}
                    onPatch={handleMixerPatch}
                    onOpenLibrary={handleOpenLibrary}
                    onOpenEffectEditor={handleOpenEffectEditor}
                    onOpenEffectInterface={handleOpenEffectInterface}
                    onRemoveSubChannel={handleRemoveSubChannel}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mixer-master-strip">
            <ChannelStrip
              mixer={mixer}
              channel={mixer.master}
              isMaster
              isSubChannel={false}
              librarySnapshot={librarySnapshot}
              onPatch={handleMixerPatch}
              onOpenLibrary={handleOpenLibrary}
              onOpenEffectEditor={handleOpenEffectEditor}
              onOpenEffectInterface={handleOpenEffectInterface}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
