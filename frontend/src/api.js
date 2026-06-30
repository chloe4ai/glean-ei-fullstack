// Thin client for the Glean Enterprise Intelligence backend.
// All paths are proxied to http://localhost:8787 via vite.config.js.

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

export const api = {
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

// Open the SSE stream for an insight's agent run.
// Returns the EventSource; caller wires start/step/done handlers and closes on done.
export function runAgent(id) {
  return new EventSource(`${BASE}/agent/${id}/run`)
}
