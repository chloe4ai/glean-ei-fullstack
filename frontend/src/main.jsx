import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './tokens.css'
import './styles.css'
import App from './App.jsx'

// Static builds (GitHub Pages) use HashRouter so client-side routes don't 404
// on refresh under a repo subpath. The live full-stack build uses BrowserRouter.
const STATIC = import.meta.env.VITE_STATIC === '1'
const Router = STATIC ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
