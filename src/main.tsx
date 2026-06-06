import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyThemeMode, readThemeMode } from './lib/theme'

applyThemeMode(readThemeMode())

if (typeof window !== 'undefined') {
  (window as any).__promptroAppLoaded = false;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
