import { useEffect } from 'react';
import { toast } from 'sonner';
import { useProjectStore } from '../stores/project-store';
import { usePlaybackStore } from '../stores/playback-store';
import { useUIStore } from '../stores/ui-store';
import { useSettingsStore } from '../stores/settings-store';
import { useWorkbenchStore } from '../stores/workbench-store';
import { useOutputStore } from '../stores/output-store';
import type { EngineOutputPayload } from '../../shared/io-provider';

export function useIPCListeners(): void {
  const setProjectInfo = useProjectStore((s) => s.setProjectInfo);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const addRecentFile = useSettingsStore((s) => s.addRecentFile);
  const setStatus = usePlaybackStore((s) => s.setStatus);
  const setError = usePlaybackStore((s) => s.setError);
  const acceptPlaybackClock = usePlaybackStore((s) => s.acceptPlaybackClock);
  const resetPlayback = usePlaybackStore((s) => s.reset);
  const handleNativeMenuCommand = useWorkbenchStore((s) => s.handleNativeMenuCommand);
  const appendToTab = useOutputStore((s) => s.appendToTab);
  const selectTab = useOutputStore((s) => s.selectTab);
  const getOrCreateTab = useOutputStore((s) => s.getOrCreateTab);
  const resetTab = useOutputStore((s) => s.resetTab);

  useEffect(() => {
    if (!window.blueAPI) return;

    window.blueAPI.onProjectLoaded((info) => {
      resetPlayback();
      setProjectInfo(info);
      setActivePanel('project');
      if (info.filePath) {
        addRecentFile(info.filePath);
      }
      toast.success(`Loaded: ${info.title || 'Project'}`);
    });

    window.blueAPI.onPlaybackStatus((status) => {
      setStatus(status);
    });

    window.blueAPI.onPlaybackClock((clock) => {
      acceptPlaybackClock(clock);
    });

    window.blueAPI.onPlaybackError((error) => {
      setError(error);
    });

    window.blueAPI.onNativeMenuCommand((command) => {
      handleNativeMenuCommand(command);
    });

    window.blueAPI.onSaveComplete(() => {
      toast.success('File saved successfully');
    });

    window.blueAPI.onSaveError((error) => {
      toast.error(`Save error: ${error}`);
    });

    const unsubOutput = window.blueAPI.onEngineOutput((payload: EngineOutputPayload) => {
      getOrCreateTab(payload.tabName);
      appendToTab(payload.tabName, payload.text, payload.type);
    });

    const unsubSelect = window.blueAPI.onEngineOutputSelect((payload) => {
      getOrCreateTab(payload.tabName);
      selectTab(payload.tabName);
    });

    const unsubReset = window.blueAPI.onEngineOutputReset((payload) => {
      resetTab(payload.tabName);
    });

    const unsubCsd = window.blueAPI.onGeneratedCsd((csdText) => {
      useProjectStore.getState().setGeneratedCsd({ text: csdText, title: 'Generated CSD' });
    });

    const unsubCsdErr = window.blueAPI.onGeneratedCsdError((error) => {
      toast.error(`CSD generation failed: ${error}`);
    });

    return () => {
      unsubOutput();
      unsubSelect();
      unsubReset();
      unsubCsd();
      unsubCsdErr();
    };
  }, [
    addRecentFile,
    acceptPlaybackClock,
    appendToTab,
    getOrCreateTab,
    handleNativeMenuCommand,
    resetPlayback,
    resetTab,
    selectTab,
    setError,
    setProjectInfo,
    setActivePanel,
    setStatus,
  ]);
}
