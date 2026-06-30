import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'
import Html from './Html.jsx'
import AgentRun from './AgentRun.jsx'

export default function InsightDrawer() {
  const { drawer, closeDrawer, sources, pushToast } = useApp()
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confidence, setConfidence] = useState(null)
  const [agentRunning, setAgentRunning] = useState(false)
  const [fbSel, setFbSel] = useState(null)
  const [fbMsg, setFbMsg] = useState('')
  const [doneActs, setDoneActs] = useState({})

  const open = !!drawer
  const id = drawer?.id

  useEffect(() => {
    if (!id) return
    setInsight(null)
    setLoading(true)
    setAgentRunning(false)
    setFbSel(null)
    setFbMsg('')
    setDoneActs({})
    api
      .insight(id)
      .then((data) => {
        setInsight(data)
        setConfidence(data.confidence)
        if (drawer.autoAgent && data.actions?.some((a) => a.agentic)) setAgentRunning(true)
      })
      .catch(() => pushToast('Could not load insight'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && closeDrawer()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, closeDrawer])

  async function sendFeedback(kind) {
    setFbSel(kind)
    try {
      const r = await api.feedback(id, kind)
      setFbMsg(r.message)
      if (typeof r.confidence === 'number') setConfidence(r.confidence) // live update
    } catch {
      setFbMsg('Could not record feedback')
    }
  }

  function onAction(a, idx) {
    if (a.agentic) {
      setAgentRunning(true)
    } else {
      setDoneActs((d) => ({ ...d, [idx]: true }))
      pushToast(a.t)
    }
  }

  const sevCount = insight?.sources?.length || 0

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={closeDrawer} />
      <aside className={`drawer ${open ? 'show' : ''}`}>
        {loading && !insight && (
          <div className="dbody">
            <div className="spinwrap loading">
              <span className="sp" /> Loading insight…
            </div>
          </div>
        )}
        {insight && (
          <>
            <div className="dhead">
              <div className="x" onClick={closeDrawer}>
                ✕
              </div>
              <div className="row">
                <span className={`sev ${insight.severity}`}>{insight.sevLabel}</span>
                <span className="meta-sm">
                  {sevCount} systems · confidence {(confidence ?? insight.confidence).toFixed(2)}
                </span>
              </div>
              <h3>{insight.title}</h3>
              <div className="sm">{insight.meta}</div>
            </div>

            <div className="dbody">
              <div className="block">
                <h4>What Glean concluded</h4>
                <Html as="div" className="narr" html={insight.narrative} />
              </div>

              <div className="block">
                <h4>Why — signal contribution</h4>
                <div className="contrib">
                  {insight.contributions.map((c, n) => {
                    const color = sources[c.source]?.color || '#727272'
                    return (
                      <div className={`citem ${c.enabled ? '' : 'dim'}`} key={n}>
                        <div className="lbl">
                          <span className="cdot" style={{ background: color }} />
                          {c.label}
                        </div>
                        <div className="bar">
                          <i style={{ width: `${c.weight}%` }} />
                        </div>
                        <div className="pct">{c.weight}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="block">
                <h4>Evidence timeline</h4>
                <div className="tl">
                  {insight.timeline.map((e, n) => (
                    <div className={`ev ${e.warn ? 'warn' : ''}`} key={n}>
                      <div className="when">{e.when}</div>
                      <Html as="div" className="what" html={e.text} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="block">
                <h4>Confidence &amp; calibration</h4>
                <div className="confbox">
                  <div className="top">
                    <div className="num" style={{ color: insight.confColor }}>
                      {(confidence ?? insight.confidence).toFixed(2)}
                    </div>
                    <div className="cap">composite score · higher = more reliable</div>
                  </div>
                  <div className="meter">
                    <i style={{ width: `${(confidence ?? insight.confidence) * 100}%` }} />
                  </div>
                  <Html as="div" className="note" html={insight.calibration} />
                  <div className="calstats">
                    <div>
                      <b>{insight.precision}%</b>precision
                    </div>
                    <div>
                      <b>{insight.sampleSize}</b>sample size
                    </div>
                    <div>
                      <b>{insight.leadTimeDays}d</b>avg lead time
                    </div>
                  </div>
                </div>
              </div>

              <div className="block">
                <h4>Recommended actions</h4>
                <div className="acts">
                  {insight.actions.map((a, idx) => (
                    <div className={`act ${a.agentic ? 'agentic' : ''}`} key={idx}>
                      <div className="ai">{a.ic}</div>
                      <div className="at">
                        <b>{a.t}</b>
                        <span>{a.s}</span>
                      </div>
                      <button
                        className={`btn ${a.agentic ? 'dark' : 'primary'}`}
                        disabled={doneActs[idx] || (a.agentic && agentRunning)}
                        style={a.agentic ? { background: 'var(--agent)', borderColor: 'var(--agent)' } : undefined}
                        onClick={() => onAction(a, idx)}
                      >
                        {doneActs[idx] ? '✓ Done' : a.ab}
                      </button>
                    </div>
                  ))}
                </div>
                {agentRunning && <AgentRun id={id} />}
              </div>

              <div className="block" style={{ marginBottom: 6 }}>
                <div className="trust">
                  <div className="th">◈ Help calibrate this insight</div>
                  <div className="ts">
                    Your feedback tunes confidence for your org — this is how proactive intelligence
                    earns trust instead of becoming noise.
                  </div>
                  <div className="fbrow">
                    {[
                      ['useful', '👍 Useful & acted'],
                      ['noise', '🔕 Not relevant'],
                      ['cal', '🎚 Confidence too high'],
                      ['late', '⏱ Surfaced too late'],
                    ].map(([kind, label]) => (
                      <button
                        key={kind}
                        className={`fb ${fbSel === kind ? 'sel' : ''}`}
                        onClick={() => sendFeedback(kind)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {fbMsg && <div className="fbmsg">{fbMsg}</div>}
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
