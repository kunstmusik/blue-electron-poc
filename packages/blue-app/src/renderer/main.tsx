import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: {
          background: '#16213e',
          border: '1px solid #0f3460',
          color: '#e0e0e0',
        },
      }}
    />
  </StrictMode>,
);
