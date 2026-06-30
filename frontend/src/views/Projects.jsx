import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'

const SEV_COLOR = { red: 'var(--red)', amber: 'var(--amber)', green: 'var(--green)' }
const TAG_STYLE = {
  red: { background: 'var(--red-soft)', color: 'var(--red)' },
  amber: { background: 'var(--amber-soft)', color: 'var(--amber)' },
  green: { background: 'var(--green-soft)', color: 'var(--green)' },
}

export default function Projects() {
  const { openInsight, pushToast } = useApp()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.projects().then(setProjects).catch(() => {})
  }, [])

  const onClick = (p) => {
    if (p.insightId) openInsight(p.insightId)
    else pushToast(`${p.name} is healthy — no action needed`)
  }

  return (
    <>
      <div className="lead">
        <span className="eyebrow">▤ Organizational visibility</span>
        <h2>Portfolio health, scored continuously</h2>
        <p>
          Every active project gets a live health score composed from the same cross-system signals
          — so risk is visible <i>before</i> it shows up in a status report. Click a project to see
          the evidence.
        </p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="k">▤ Active projects</div>
          <div className="v">12</div>
          <div className="d">across 6 teams</div>
        </div>
        <div className="stat">
          <div className="k">◷ Avg health</div>
          <div className="v">
            71 <small>/100</small>
          </div>
          <div className="d up">▼ 6 pts this week (Atlas)</div>
        </div>
        <div className="stat">
          <div className="k">⚠ Below threshold</div>
          <div className="v">2</div>
          <div className="d up">Atlas · Mobile-Pay</div>
        </div>
      </div>

      <div className="sectlbl">
        <b>Projects</b>
        <span className="ln" />
        <span className="cnt">sorted by risk</span>
      </div>

      <div className="grid2">
        {projects.map((p) => (
          <div className="panel proj" key={p.name} onClick={() => onClick(p)}>
            <div className="rail" style={{ background: SEV_COLOR[p.severity] }} />
            <div className="pt">{p.name}</div>
            <div className="po">{p.owner}</div>
            <div className="hrow">
              <div className="hs" style={{ color: SEV_COLOR[p.severity] }}>
                {p.health}
              </div>
              <div className="hl" style={{ color: 'var(--muted)' }}>
                / 100 health
              </div>
            </div>
            <div className="hbar">
              <i style={{ width: `${p.health}%`, background: SEV_COLOR[p.severity] }} />
            </div>
            <div className="pf">
              <span className="tag" style={TAG_STYLE[p.severity]}>
                {p.tag}
              </span>
              <span className={p.deltaDir === 'up' ? 'up' : ''} style={{ fontWeight: 600 }}>
                {p.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
