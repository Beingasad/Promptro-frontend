import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyThemeMode, readThemeMode } from './lib/theme'

applyThemeMode(readThemeMode())

if (typeof window !== 'undefined') {
  (window as any).__promptroAppLoaded = false;

  // Intercept native browser alert calls and redirect them to our custom glassmorphism modal
  window.alert = (message?: any) => {
    const event = new CustomEvent('promptro-global-alert', { detail: { message: String(message) } });
    window.dispatchEvent(event);
  };

  // Prevent browser pinch-to-zoom on mobile/touch devices
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });

  document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
