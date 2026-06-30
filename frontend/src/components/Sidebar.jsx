import { NavLink } from 'react-router-dom'
import { useApp } from '../context.jsx'

const NAV = [
  { to: '/', label: 'Pulse', ic: '◎', badge: '3', end: true },
  { to: '/projects', label: 'Projects', ic: '▤' },
  { to: '/signals', label: 'Signals', ic: '⚲' },
  { to: '/agents', label: 'Agents', ic: '⛭', badge: '1' },
]
const NAV2 = [
  { to: '/search', label: 'Search', ic: '⌕' },
  { to: '/assistant', label: 'Assistant', ic: '✦' },
  { to: '/settings', label: 'Settings', ic: '⚙' },
]

function Item({ to, label, ic, badge, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'on' : undefined)}>
      <span className="ic">{ic}</span>
      {label}
      {badge && <span className="badge">{badge}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  const { current } = useApp()
  const who = current?.who || { name: 'Maya Chen', role: 'VP Engineering', avatar: 'MC' }
  return (
    <aside className="side">
      <div className="logo">glean</div>
      <nav className="nav">
        {NAV.map((n) => (
          <Item key={n.to} {...n} />
        ))}
        <div className="grouplbl">Workspace</div>
        {NAV2.map((n) => (
          <Item key={n.to} {...n} />
        ))}
      </nav>
      <div className="spacer" />
      <div className="me">
        <div className="av">{who.avatar}</div>
        <div>
          <div className="nm">{who.name}</div>
          <div className="rl">{who.role}</div>
        </div>
      </div>
    </aside>
  )
}
