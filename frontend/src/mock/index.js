// Client-side mock that mirrors the Express backend (store.js + server.js) so
// the app can be deployed as a fully-static build (e.g. GitHub Pages) with NO
// server, while behaving identically: confidence recomputes from enabled
// signals, feedback shifts calibration, and the agent run "streams" over a
// fake EventSource. Enabled only when VITE_STATIC=1.

import {
  SOURCES, PERSONAS, PROJECTS, CONNECTORS, SIGNAL_CATALOG,
  AGENT_SCRIPTS, SEARCH_DOCS, ASSISTANT_REPLIES,
} from './seed.js'

const catalogIds = new Set(SIGNAL_CATALOG.map((s) => s.id))

const state = {
  enabledSignals: Object.fromEntries(SIGNAL_CATALOG.map((s) => [s.id, true])),
  feedback: {},
  confidenceDelta: {},
  agentRuns: [
    { id: 'seed-1', insightId: 'atlas', title: 'Atlas mitigation plan', summary: 'Drafted 3 options · posted to #atlas-leads', status: 'wait', label: 'Awaiting approval' },
    { id: 'seed-2', insightId: 'win', title: 'Onboarding runbook · Mobile + Data Platform', summary: '2 runbooks drafted from Checkout template', status: 'ok', label: 'Approved' },
    { id: 'seed-3', insightId: 'bus', title: 'Re-sequence payments items', summary: 'Moved BILL-2231 out of PTO window', status: 'ok', label: 'Done' },
    { id: 'seed-4', insightId: 'theme', title: 'Route auth-flake theme to Platform PM', summary: 'Epic created · 15 items linked', status: 'run', label: 'Running' },
  ],
}

const clamp = (n, lo = 0.05, hi = 0.99) => Math.max(lo, Math.min(hi, n))
const allInsights = () => [...PERSONAS.delivery.insights, ...PERSONAS.revenue.insights]
const findInsight = (id) => allInsights().find((i) => i.id === id) || null
const signalEnabled = (sig) => (catalogIds.has(sig) ? !!state.enabledSignals[sig] : true)

function computeConfidence(insight) {
  const total = insight.contributions.reduce((s, c) => s + c.weight, 0) || 1
  const live = insight.contributions.reduce((s, c) => s + (signalEnabled(c.signal) ? c.weight : 0), 0)
  const delta = state.confidenceDelta[insight.id] || 0
  return Math.round(clamp(insight.baseConfidence * (live / total) + delta) * 100) / 100
}
const liveContributions = (insight) =>
  insight.contributions.map((c) => ({ ...c, enabled: signalEnabled(c.signal) }))

function hydrate(insight, full = false) {
  const base = {
    id: insight.id, persona: insight.persona, severity: insight.severity,
    sevLabel: insight.sevLabel, title: insight.title, meta: insight.meta,
    body: insight.body, sources: insight.sources, win: !!insight.win,
    confColor: insight.confColor, valueAtRisk: insight.valueAtRisk,
    confidence: computeConfidence(insight), baseConfidence: insight.baseConfidence,
    actions: insight.actions,
  }
  if (!full) return base
  return {
    ...base,
    narrative: insight.narrative,
    contributions: liveContributions(insight),
    timeline: insight.timeline,
    calibration: insight.calibration,
    precision: insight.precision, sampleSize: insight.sampleSize, leadTimeDays: insight.leadTimeDays,
  }
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const api = {
  personas: async () => Object.values(PERSONAS).map((p) => ({ key: p.key, who: p.who, product: p.product })),
  sources: async () => SOURCES,
  pulse: async (persona) => {
    const p = PERSONAS[persona] || PERSONAS.delivery
    return {
      key: p.key, who: p.who, product: p.product,
      eyebrow: p.eyebrow, head: p.head, sub: p.sub, stats: p.stats,
      insights: p.insights.map((i) => hydrate(i)),
    }
  },
  insight: async (id) => {
    const i = findInsight(id)
    if (!i) throw new Error('404 not found')
    return hydrate(i, true)
  },
  feedback: async (id, kind) => {
    if (!findInsight(id)) throw new Error('404 not found')
    ;(state.feedback[id] ||= []).push({ kind, ts: Date.now() })
    if (kind === 'cal') state.confidenceDelta[id] = (state.confidenceDelta[id] || 0) - 0.08
    else if (kind === 'useful') state.confidenceDelta[id] = (state.confidenceDelta[id] || 0) + 0.01
    const messages = {
      useful: '✓ Logged. Glean reinforces this signal pattern and will keep surfacing similar risks early.',
      noise: '✓ Logged. Glean will down-weight this pattern for your team and re-score similar insights.',
      cal: '✓ Logged. Confidence lowered for this pattern and re-calibrated across similar insights.',
      late: '✓ Logged. Glean will widen the lead-time window so this surfaces earlier next time.',
    }
    return {
      message: messages[kind] || '✓ Feedback logged.',
      confidence: computeConfidence(findInsight(id)),
      feedbackCount: state.feedback[id].length,
    }
  },
  projects: async () => PROJECTS,
  signals: async () => ({
    connectors: CONNECTORS,
    signals: SIGNAL_CATALOG.map((s) => ({ ...s, enabled: state.enabledSignals[s.id] !== false })),
  }),
  toggleSignal: async (id) => {
    if (!(id in state.enabledSignals)) throw new Error('404 unknown signal')
    state.enabledSignals[id] = !state.enabledSignals[id]
    const affected = allInsights()
      .filter((i) => i.contributions.some((c) => c.signal === id))
      .map((i) => ({ id: i.id, title: i.title, confidence: computeConfidence(i) }))
    return { id, enabled: state.enabledSignals[id], affected }
  },
  agentRuns: async () => state.agentRuns,
  search: async (q) => {
    const query = String(q || '').toLowerCase().trim()
    const terms = query.split(/\s+/).filter((t) => t.length > 2)
    let hits = SEARCH_DOCS
    if (terms.length) {
      hits = SEARCH_DOCS
        .map((d) => {
          const hay = (d.title + ' ' + d.snippet).toLowerCase()
          return { d, score: terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) }
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.d)
      if (!hits.length) hits = SEARCH_DOCS
    }
    return { count: hits.length, results: hits }
  },
  assistant: async (message) => {
    const lk = String(message || '').toLowerCase()
    let reply = ASSISTANT_REPLIES.default
    if (lk.includes('reassign') || lk.includes('review')) reply = ASSISTANT_REPLIES.reassign
    else if (lk.includes('who') || lk.includes('person') || lk.includes('owner')) reply = ASSISTANT_REPLIES.who
    await delay(350)
    return { reply, cites: ['gh', 'jira'], llm: false }
  },
}

// Fake EventSource that mirrors the backend's SSE agent stream.
class FakeEventSource {
  constructor(id) {
    this.handlers = {}
    this.onerror = null
    this._closed = false
    setTimeout(() => this._run(id), 60)
  }
  addEventListener(type, cb) {
    ;(this.handlers[type] ||= []).push(cb)
  }
  _emit(type, data) {
    if (this._closed) return
    ;(this.handlers[type] || []).forEach((cb) => cb({ data: JSON.stringify(data) }))
  }
  close() {
    this._closed = true
  }
  async _run(id) {
    const script = AGENT_SCRIPTS[id]
    if (!script) {
      this.onerror?.()
      return
    }
    this._emit('start', { insightId: id, total: script.steps.length })
    for (let n = 0; n < script.steps.length; n++) {
      await delay(700)
      if (this._closed) return
      this._emit('step', { index: n, text: script.steps[n], done: n })
    }
    await delay(500)
    if (this._closed) return
    state.agentRuns.unshift({
      id: 'run-' + id + '-' + state.agentRuns.length,
      insightId: id,
      title: (findInsight(id)?.title || id).slice(0, 60),
      summary: script.title,
      status: 'wait', label: 'Awaiting approval',
    })
    this._emit('done', { title: script.title, options: script.options })
    this.close()
  }
}

export function runAgent(id) {
  return new FakeEventSource(id)
}
