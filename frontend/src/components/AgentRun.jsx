import { useEffect, useRef, useState } from 'react'
import { runAgent } from '../api.js'
import { useApp } from '../context.jsx'

// Opens the SSE stream for an insight's agent run and renders steps filling in
// live with checkmarks, then the drafted options + Approve / Save buttons.
export default function AgentRun({ id }) {
  const { pushToast } = useApp()
  const [total, setTotal] = useState(0)
  const [steps, setSteps] = useState([]) // [{index,text}]
  const [activeIdx, setActiveIdx] = useState(-1)
  const [done, setDone] = useState(null) // {title, options}
  const esRef = useRef(null)

  useEffect(() => {
    const es = runAgent(id)
    esRef.current = es

    es.addEventListener('start', (e) => {
      const d = JSON.parse(e.data)
      setTotal(d.total)
    })
    es.addEventListener('step', (e) => {
      const d = JSON.parse(e.data)
      setSteps((s) => [...s, { index: d.index, text: d.text }])
      setActiveIdx(d.index)
    })
    es.addEventListener('done', (e) => {
      const d = JSON.parse(e.data)
      setActiveIdx(-1)
      setDone(d)
      es.close()
    })
    es.onerror = () => es.close()

    return () => es.close()
  }, [id])

  // Build the visual step list: known steps + placeholders up to total.
  const rows = []
  for (let i = 0; i < Math.max(total, steps.length); i++) {
    const known = steps.find((s) => s.index === i)
    let state = 'idle'
    if (done) state = 'ok'
    else if (i < activeIdx) state = 'ok'
    else if (i === activeIdx) state = 'on'
    rows.push({ i, text: known?.text || '…', state })
  }

  return (
    <div className="agentrun">
      <div className="ah">
        {done ? (
          <>
            <span className="okmk">✓</span> Agent finished — review before anything ships
          </>
        ) : (
          <>
            <span className="sp" /> Glean agent is working — you stay in control
          </>
        )}
      </div>
      <div>
        {rows.map((r) => (
          <div key={r.i} className={`astep ${r.state}`}>
            <span className="mk">{r.state === 'ok' ? '✓' : ''}</span>
            {r.text}
          </div>
        ))}
      </div>
      {done && (
        <div className="agentout">
          <div className="ot">✓ {done.title}</div>
          <div className="draftbox">
            {done.options.map((o, n) => (
              <div className="opt" key={n}>
                <b>{o.label}:</b> {o.text}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="btn primary"
              onClick={() => pushToast('Approved — agent will execute the selected option')}
            >
              Approve &amp; run
            </button>
            <button className="btn" onClick={() => pushToast('Saved to review later')}>
              Save draft
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
