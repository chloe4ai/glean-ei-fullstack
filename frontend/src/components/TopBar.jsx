import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context.jsx'

const TITLES = {
  '/': { sub: 'Monday · Jun 29 · 7:42 AM' },
  '/projects': { t: 'Projects', sub: '12 active · portfolio health' },
  '/signals': { t: 'Signals', sub: '6 systems · 9 signal types' },
  '/agents': { t: 'Agents', sub: 'human-in-the-loop · you approve every action' },
  '/search': { t: 'Search', sub: 'everything you have access to' },
  '/assistant': { t: 'Assistant', sub: 'grounded in your enterprise graph' },
  '/settings': { t: 'Settings', sub: 'calibration & connectors' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { current } = useApp()
  const meta = TITLES[pathname] || TITLES['/']
  const title = pathname === '/' ? current?.product || 'Delivery Intelligence' : meta.t

  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="sub">{meta.sub}</div>
      <div className="grow" />
      <span className="livepill">● Live · 6 systems connected</span>
      <div className="miniSearch" onClick={() => navigate('/search')}>
        ⌕ Search anything…
      </div>
    </div>
  )
}
