export {};

declare global {
  interface Window {
    blueAPI: {
      openFile: () => Promise<string | null>;
      saveFile: () => Promise<string | null>;
      saveFileAs: () => Promise<string | null>;
      togglePlay: () => Promise<boolean>;
      stopPlayback: () => void;
      getProjectInfo: () => Promise<Record<string, string> | null>;
      onProjectLoaded: (cb: (info: Record<string, string>) => void) => void;
      onPlaybackStatus: (cb: (status: { status: string; message?: string }) => void) => void;
      onPlaybackError: (cb: (error: string) => void) => void;
      onSaveComplete: (cb: (info: { filePath: string }) => void) => void;
      onSaveError: (cb: (error: string) => void) => void;
    };
  }
}
