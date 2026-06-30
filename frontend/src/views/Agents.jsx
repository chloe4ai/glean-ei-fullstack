import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'

const ICONS = { wait: '🤖', ok: '📋', run: '📤' }

const LIBRARY = [
  {
    ic: '🤖',
    n: 'Mitigation Drafter',
    d: "Reads a project's board, PRs & standups; proposes 3 recovery options.",
  },
  {
    ic: '👥',
    n: 'Knowledge-Transfer Planner',
    d: 'Finds backup owners by code proximity; drafts a transfer plan.',
  },
  { ic: '📋', n: 'Runbook Cloner', d: 'Adapts a winning runbook/template for other teams.' },
  {
    ic: '📤',
    n: 'Theme Router',
    d: 'Bundles a cross-team theme into one evidenced epic and routes it.',
  },
]

export default function Agents() {
  const { pushToast, openInsight } = useApp()
  const [runs, setRuns] = useState([])

  useEffect(() => {
    api.agentRuns().then(setRuns).catch(() => {})
  }, [])

  const waiting = runs.filter((r) => r.status === 'wait').length

  return (
    <>
      <div className="lead">
        <span className="eyebrow">⛭ Human-in-the-loop</span>
        <h2>Agents draft. You approve. Nothing ships on its own.</h2>
        <p>
          Every insight can dispatch an agent to do the legwork — read the board, the PRs, the
          transcripts — and return a draft. The human stays in control of every action that touches
          the org.
        </p>
      </div>

      <div className="sectlbl">
        <b>Needs your review</b>
        <span className="ln" />
        <span className="cnt">{waiting} awaiting approval</span>
      </div>
      <div className="panel" style={{ marginBottom: 8 }}>
        {runs.map((r) => (
          <div className="run" key={r.id}>
            <div className="ri">{ICONS[r.status] || '🤖'}</div>
            <div className="rt">
              <b>{r.title}</b>
              <span>{r.summary}</span>
            </div>
            <span className={`st ${r.status}`}>{r.label}</span>
            {r.status === 'wait' && (
              <button
                className="btn primary"
                onClick={() =>
                  r.insightId
                    ? openInsight(r.insightId)
                    : pushToast('Approved — agent will execute Option A')
                }
              >
                Review
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="blocktitle">Agent library</div>
      <div className="grid2">
        {LIBRARY.map((a) => (
          <div className="panel agentcard" key={a.n}>
            <div className="ri">{a.ic}</div>
            <div style={{ flex: 1 }}>
              <b>{a.n}</b>
              <div className="ad">{a.d}</div>
              <button
                className="btn outline"
                style={{ marginTop: 11 }}
                onClick={() => pushToast(`${a.n} ready — pick an insight to run it on`)}
              >
                Run →
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
