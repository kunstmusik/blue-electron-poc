import { FolderOpen } from 'lucide-react';
import { useSettingsStore } from '../../stores/settings-store';

export default function WelcomeScreen(): JSX.Element {
  const recentFiles = useSettingsStore((s) => s.recentFiles);
  const removeRecentFile = useSettingsStore((s) => s.removeRecentFile);

  const handleOpen = async () => {
    await window.blueAPI.openFile();
  };

  const handleRecentClick = async (path: string) => {
    // Try to open directly; if file doesn't exist, the main process will show an error
    // and remove it from the list
    await window.blueAPI.openFile();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-accent mb-2">Blue</h1>
        <p className="text-lg text-blue-muted">
          An object composition environment for Csound
        </p>
      </div>

      {/* Open button */}
      <button className="btn btn-primary text-base px-8 py-3" onClick={handleOpen}>
        <FolderOpen className="w-5 h-5" />
        Open a .blue Project
      </button>

      {/* Recent files */}
      {recentFiles.length > 0 && (
        <div className="w-full max-w-md">
          <h2 className="text-sm font-semibold text-blue-muted uppercase tracking-wider mb-3">
            Recent Files
          </h2>
          <ul className="space-y-1">
            {recentFiles.map((path) => (
              <li
                key={path}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-blue-surface cursor-pointer group"
                onClick={() => handleRecentClick(path)}
              >
                <span className="text-sm truncate flex-1" title={path}>
                  {path.split('/').pop()}
                </span>
                <button
                  className="opacity-0 group-hover:opacity-100 text-blue-muted hover:text-red-400 px-2 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentFile(path);
                  }}
                  title="Remove from recent files"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
