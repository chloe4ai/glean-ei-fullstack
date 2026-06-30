import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'

export default function Search() {
  const { sources } = useApp()
  const [q, setQ] = useState('atlas')
  const [data, setData] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      api.search(q).then(setData).catch(() => {})
    }, 250)
    return () => clearTimeout(timer.current)
  }, [q])

  return (
    <>
      <div className="lead">
        <span className="eyebrow">⌕ Classic Glean</span>
        <h2>Search is still here — it's just no longer the only way in</h2>
        <p>
          Reactive search answers what you think to ask. Enterprise Intelligence surfaces what you
          didn't. Both run on the same graph and the same permissions.
        </p>
      </div>

      <div className="bigsearch">
        ⌕
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search across Jira, GitHub, Slack, Confluence…"
        />
      </div>

      {data && (
        <div className="panel" style={{ marginTop: 14, overflow: 'hidden' }}>
          <div className="reshdr">
            {data.count} results · ranked by relevance + your permissions
          </div>
          {data.results.map((r, n) => {
            const s = sources[r.source] || { label: r.source, color: '#727272' }
            return (
              <div className="res" key={n}>
                <div className="rd" style={{ background: s.color }}>
                  {s.label[0]}
                </div>
                <div>
                  <div className="rt2">{r.title}</div>
                  <div className="rs">{r.snippet}</div>
                  <div className="rm">{r.meta}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
