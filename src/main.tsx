import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Check DB Connection Status
fetch('/api/db-status')
  .then(async res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON (likely a 404 HTML page)");
    }
    return res.json();
  })
  .then(data => {
    if (data.connected) {
      console.log('%c[Database] Successfully connected to MongoDB', 'color: #10b981; font-weight: bold;');
    } else {
      console.warn('%c[Database] Not connected to MongoDB. Using in-memory fallback.', 'color: #f59e0b; font-weight: bold;');
    }
  })
  .catch(err => console.warn('[Database] Backend API not reachable. Running in client-only mode.', err.message));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
