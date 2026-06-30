import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Toasts from './components/Toasts.jsx'
import InsightDrawer from './components/InsightDrawer.jsx'
import AboutFooter from './components/AboutFooter.jsx'
import Pulse from './views/Pulse.jsx'
import Projects from './views/Projects.jsx'
import Signals from './views/Signals.jsx'
import Agents from './views/Agents.jsx'
import Search from './views/Search.jsx'
import Assistant from './views/Assistant.jsx'
import Settings from './views/Settings.jsx'

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <Sidebar />
        <main className="main">
          <TopBar />
          <div className="wrap">
            <Routes>
              <Route path="/" element={<Pulse />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/signals" element={<Signals />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/search" element={<Search />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <AboutFooter />
          </div>
        </main>
      </div>
      <InsightDrawer />
      <Toasts />
    </AppProvider>
  )
}
