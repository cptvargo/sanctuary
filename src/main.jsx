import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ProjectorView from './components/ProjectorView.jsx'
import './styles/global.css'
import { syncPrefsToLocalStorage } from './utils/persistentStorage'

// Load persisted user prefs (themes, logo, etc) into localStorage cache on startup
syncPrefsToLocalStorage()

const isProjector =
  typeof window.sanctuary !== 'undefined'
    ? window.sanctuary.isProjector()
    : new URLSearchParams(window.location.search).get('projector') === '1'

// No StrictMode — prevents double-mounting which causes countdown to tick twice
ReactDOM.createRoot(document.getElementById('root')).render(
  isProjector ? <ProjectorView /> : <App />
)
