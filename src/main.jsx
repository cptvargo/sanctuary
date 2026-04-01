import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ProjectorView from './components/ProjectorView.jsx'
import './styles/global.css'

const isProjector =
  typeof window.sanctuary !== 'undefined'
    ? window.sanctuary.isProjector()
    : new URLSearchParams(window.location.search).get('projector') === '1'

// No StrictMode — prevents double-mounting which causes countdown to tick twice
ReactDOM.createRoot(document.getElementById('root')).render(
  isProjector ? <ProjectorView /> : <App />
)
