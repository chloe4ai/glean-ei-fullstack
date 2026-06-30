import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'
import InsightCard from '../components/InsightCard.jsx'
import Html from '../components/Html.jsx'

export default function Pulse() {
  const { personaKey, setPersonaKey } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .pulse(personaKey)
      .then(setData)
      .finally(() => setLoading(false))
  }, [personaKey])

  return (
    <>
      <div className="personaSwitch">
        <span className="psLabel">Intelligence for</span>
        <button
          className={`ps ${personaKey === 'delivery' ? 'on' : ''}`}
          onClick={() => setPersonaKey('delivery')}
        >
          🛠 Maya · VP Engineering
        </button>
        <button
          className={`ps ${personaKey === 'revenue' ? 'on' : ''}`}
          onClick={() => setPersonaKey('revenue')}
        >
          📈 Diego · VP Revenue
        </button>
        <span className="psHint">← same engine, different department</span>
      </div>

      {loading && !data && (
        <div className="spinwrap loading">
          <span className="sp" /> Synthesizing your brief…
        </div>
      )}

      {data && (
        <>
          <div className="lead">
            <span className="eyebrow">{data.eyebrow}</span>
            <h2>{data.head}</h2>
            <Html as="p" html={data.sub} />
          </div>

          <div className="stats">
            {data.stats.map((s, n) => (
              <div className="stat" key={n}>
                <div className="k">{s.k}</div>
                <div className="v">
                  {s.v} {s.small && <small>{s.small}</small>}
                </div>
                <div className={`d ${s.dir === 'up' ? 'up' : 'dn'}`}>{s.d}</div>
              </div>
            ))}
          </div>

          <div className="sectlbl">
            <b>Needs a decision</b>
            <span className="ln" />
            <span className="cnt">{data.insights.length} synthesized</span>
          </div>

          <div className="feed">
            {data.insights.map((c) => (
              <InsightCard key={c.id} card={c} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
