// Thin client for the Glean Enterprise Intelligence backend.
// All paths are proxied to http://localhost:8787 via vite.config.js.
//
// When built with VITE_STATIC=1 (e.g. GitHub Pages) there is no server: every
// call routes to a client-side mock that mirrors the backend exactly.
import { api as mockApi, runAgent as mockRunAgent } from './mock/index.js'

const STATIC = import.meta.env.VITE_STATIC === '1'

const BASE = '/api'

async function json(path, opts) {
  const res = await fetch(BASE + path, opts)
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error || ''
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${detail}`.trim())
  }
  return res.json()
}

function post(path, body) {
  return json(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
}

const liveApi = {
  personas: () => json('/personas'),
  sources: () => json('/sources'),
  pulse: (persona) => json(`/pulse/${persona}`),
  insight: (id) => json(`/insight/${id}`),
  feedback: (id, kind) => post(`/insight/${id}/feedback`, { kind }),
  projects: () => json('/projects'),
  signals: () => json('/signals'),
  toggleSignal: (id) => post(`/signals/${id}/toggle`),
  agentRuns: () => json('/agents/runs'),
  search: (q) => json(`/search?q=${encodeURIComponent(q)}`),
  assistant: (message, persona) => post('/assistant', { message, persona }),
}

export const api = STATIC ? mockApi : liveApi

// Open the SSE stream for an insight's agent run.
// Returns the EventSource (or a fake one in static mode); caller wires
// start/step/done handlers and closes on done.
export function runAgent(id) {
  return STATIC ? mockRunAgent(id) : new EventSource(`${BASE}/agent/${id}/run`)
}
