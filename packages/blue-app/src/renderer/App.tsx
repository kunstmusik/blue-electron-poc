import { useIPCListeners } from './hooks/use-ipc-listeners';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useProjectStore } from './stores/project-store';
import { useUIStore } from './stores/ui-store';
import MenuBar from './components/menu-bar/MenuBar';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import ProjectView from './components/project/ProjectView';
import ErrorBoundary from './components/notifications/ErrorBoundary';

export default function App(): JSX.Element {
  // Wire IPC events to Zustand stores
  useIPCListeners();

  // Wire keyboard shortcuts
  useKeyboardShortcuts();

  // Which panel to show
  const activePanel = useUIStore((s) => s.activePanel);
  const isLoading = useProjectStore((s) => s.isLoading);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Menu Bar */}
        <MenuBar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative">
          {activePanel === 'welcome' && <WelcomeScreen />}
          {activePanel === 'project' && <ProjectView />}

          {/* Global loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-blue-bg/80 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-blue-muted text-sm">Loading project...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
