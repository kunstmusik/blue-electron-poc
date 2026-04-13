import { useIPCListeners } from './hooks/use-ipc-listeners';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useProjectStore } from './stores/project-store';
import { useUIStore } from './stores/ui-store';
import MenuBar from './components/menu-bar/MenuBar';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import ProjectView from './components/project/ProjectView';

export default function App(): JSX.Element {
  // Wire IPC events to Zustand stores
  useIPCListeners();

  // Wire keyboard shortcuts
  useKeyboardShortcuts();

  // Which panel to show
  const activePanel = useUIStore((s) => s.activePanel);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Menu Bar */}
      <MenuBar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activePanel === 'welcome' && <WelcomeScreen />}
        {activePanel === 'project' && <ProjectView />}
      </main>
    </div>
  );
}
