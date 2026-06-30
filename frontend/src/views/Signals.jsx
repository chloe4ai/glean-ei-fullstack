import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'
import SourceChip from '../components/SourceChip.jsx'

export default function Signals() {
  const { pushToast } = useApp()
  const [connectors, setConnectors] = useState([])
  const [signals, setSignals] = useState([])

  useEffect(() => {
    api
      .signals()
      .then((d) => {
        setConnectors(d.connectors)
        setSignals(d.signals)
      })
      .catch(() => {})
  }, [])

  async function toggle(sig) {
    try {
      const r = await api.toggleSignal(sig.id)
      setSignals((list) => list.map((s) => (s.id === sig.id ? { ...s, enabled: r.enabled } : s)))
      const names = r.affected.map((a) => a.title.split(' ').slice(0, 3).join(' ')).join(', ')
      pushToast(
        `"${sig.name}" ${r.enabled ? 'enabled' : 'disabled'} — recomputed ${r.affected.length} insight${
          r.affected.length === 1 ? '' : 's'
        }${names ? ': ' + names + '…' : ''}`
      )
    } catch {
      pushToast('Could not toggle signal')
    }
  }

  const precColor = (p) => (p >= 85 ? 'var(--green)' : p >= 78 ? 'var(--amber)' : 'var(--body)')

  return (
    <>
      <div className="lead">
        <span className="eyebrow">⚲ The intelligence layer</span>
        <h2>Connected systems &amp; the signal catalog</h2>
        <p>
          Insights are only as trustworthy as the signals beneath them. Here's exactly what Glean
          reads, how fresh it is, and how much each raw signal contributes to insight precision.
          Toggle a signal to see scores recompute.
        </p>
      </div>

      <div className="sectlbl">
        <b>Connected systems</b>
        <span className="ln" />
        <span className="cnt">{connectors.length} live</span>
      </div>
      <div className="panel" style={{ marginBottom: 8 }}>
        {connectors.map((c) => (
          <div className="conn" key={c.key}>
            <div className="ci" style={{ background: c.color }}>
              {c.initial}
            </div>
            <div>
              <div className="cn">{c.name}</div>
              <div className="cs">{c.status}</div>
            </div>
            <div className="live">live</div>
          </div>
        ))}
      </div>

      <div className="blocktitle">Signal catalog · contribution &amp; measured precision</div>
      <div className="panel" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Source</th>
              <th>Feeds</th>
              <th>Weight</th>
              <th>Precision</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr key={s.id} className={s.enabled ? '' : 'off'}>
                <td style={{ color: 'var(--ink)', fontWeight: 600 }}>{s.name}</td>
                <td>
                  <SourceChip srcKey={s.source} />
                </td>
                <td style={{ fontSize: 12 }}>{s.feeds}</td>
                <td>
                  <span className="mini-bar">
                    <i style={{ width: `${Math.min(s.weight * 2, 100)}%` }} />
                  </span>
                  {s.weight}%
                </td>
                <td>
                  <b style={{ color: precColor(s.precision) }}>{s.precision}%</b>
                </td>
                <td>
                  <button
                    className={`tog ${s.enabled ? 'on' : ''}`}
                    onClick={() => toggle(s)}
                    aria-label="toggle signal"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 11, lineHeight: 1.6 }}>
        <b style={{ color: 'var(--body)' }}>Why this view exists:</b> a proactive insight pushed to a
        leader is only as good as its weakest signal. Surfacing weight + measured precision per
        signal is how the system stays auditable — and how feedback re-weights it over time.
      </p>
    </>
  )
}
