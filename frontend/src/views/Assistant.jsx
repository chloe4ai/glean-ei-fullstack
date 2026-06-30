import { useRef, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'
import SourceChip from '../components/SourceChip.jsx'
import Html from '../components/Html.jsx'

const SEED = [
  { role: 'u', text: "What's the single biggest risk to our Q3 launches right now?" },
  {
    role: 'a',
    html: '<b>Project Atlas</b> is your top risk — composite launch-slip probability <b>78%</b>, driven by a cross-team review bottleneck and a flaky auth-service test suite blocking 13 PRs. It\'s the binding constraint on your GA commit to Northwind, Veridian, and Cobalt.',
    cites: ['jira', 'gh', 'slack'],
  },
]

export default function Assistant() {
  const { personaKey } = useApp()
  const [messages, setMessages] = useState(SEED)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  async function send() {
    const q = input.trim()
    if (!q || busy) return
    setInput('')
    setMessages((m) => [...m, { role: 'u', text: q }])
    setBusy(true)
    try {
      const r = await api.assistant(q, personaKey)
      setMessages((m) => [...m, { role: 'a', html: r.reply, cites: r.cites || [], llm: r.llm }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'a', html: 'Sorry — I could not reach the intelligence layer.', cites: [] },
      ])
    } finally {
      setBusy(false)
      setTimeout(() => endRef.current?.scrollIntoView({ block: 'end' }), 50)
    }
  }

  return (
    <>
      <div className="lead">
        <span className="eyebrow">✦ Grounded in your graph</span>
        <h2>Ask follow-ups — every answer cites its sources</h2>
        <p>
          The Assistant is conversational and reactive. Enterprise Intelligence is the proactive
          layer on top. Try asking about Atlas.
        </p>
      </div>

      <div className="chat">
        {messages.map((m, n) =>
          m.role === 'u' ? (
            <div className="msg u" key={n}>
              {m.text}
            </div>
          ) : (
            <div className="msg a" key={n}>
              <Html as="span" html={m.html} />
              {m.cites?.length > 0 && (
                <div className="cite">
                  {m.cites.map((c) => (
                    <SourceChip key={c} srcKey={c} />
                  ))}
                </div>
              )}
              {m.llm && <div className="llm">Claude · grounded answer</div>}
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="chatbar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask a follow-up… (try: who should I reassign?)"
        />
        <button className="btn primary" onClick={send} disabled={busy}>
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </>
  )
}
