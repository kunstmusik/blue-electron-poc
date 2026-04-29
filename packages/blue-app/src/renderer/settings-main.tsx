import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SettingsApp from './components/settings/SettingsApp';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <SettingsApp />
  </StrictMode>,
);
