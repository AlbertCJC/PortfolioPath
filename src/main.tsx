import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Check DB Connection Status
fetch('/api/db-status')
  .then(res => res.json())
  .then(data => {
    if (data.connected) {
      console.log('%c[Database] Successfully connected to MongoDB', 'color: #10b981; font-weight: bold;');
    } else {
      console.warn('%c[Database] Not connected to MongoDB. Using in-memory fallback.', 'color: #f59e0b; font-weight: bold;');
    }
  })
  .catch(err => console.error('[Database] Failed to check connection status', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
