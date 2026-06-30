import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  PERSONAS, PROJECTS, CONNECTORS, SIGNAL_CATALOG, SOURCES,
  AGENT_SCRIPTS, SEARCH_DOCS, ASSISTANT_REPLIES,
} from './data/seed.js';
import {
  findInsight, computeConfidence, liveContributions,
  getEnabledSignals, toggleSignal, recordFeedback,
  addAgentRun, getAgentRuns,
} from './store.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- helper: hydrate an insight with live (computed) confidence -------------
function hydrate(insight, { full = false } = {}) {
  const base = {
    id: insight.id, persona: insight.persona, severity: insight.severity,
    sevLabel: insight.sevLabel, title: insight.title, meta: insight.meta,
    body: insight.body, sources: insight.sources, win: !!insight.win,
    confColor: insight.confColor, valueAtRisk: insight.valueAtRisk,
    confidence: computeConfidence(insight),
    baseConfidence: insight.baseConfidence,
    actions: insight.actions,
  };
  if (!full) return base;
  return {
    ...base,
    narrative: insight.narrative,
    contributions: liveContributions(insight),
    timeline: insight.timeline,
    calibration: insight.calibration,
    precision: insight.precision, sampleSize: insight.sampleSize, leadTimeDays: insight.leadTimeDays,
  };
}

// --- meta -------------------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true, llm: !!process.env.ANTHROPIC_API_KEY }));
app.get('/api/sources', (_req, res) => res.json(SOURCES));

app.get('/api/personas', (_req, res) => {
  res.json(Object.values(PERSONAS).map(p => ({
    key: p.key, who: p.who, product: p.product,
  })));
});

// Full pulse payload for a persona.
app.get('/api/pulse/:persona', (req, res) => {
  const p = PERSONAS[req.params.persona];
  if (!p) return res.status(404).json({ error: 'unknown persona' });
  res.json({
    key: p.key, who: p.who, product: p.product,
    eyebrow: p.eyebrow, head: p.head, sub: p.sub, stats: p.stats,
    insights: p.insights.map(i => hydrate(i)),
  });
});

// Single insight, full detail (with live confidence + contributions).
app.get('/api/insight/:id', (req, res) => {
  const i = findInsight(req.params.id);
  if (!i) return res.status(404).json({ error: 'not found' });
  res.json(hydrate(i, { full: true }));
});

// Feedback -> calibration.
app.post('/api/insight/:id/feedback', (req, res) => {
  const result = recordFeedback(req.params.id, req.body?.kind);
  if (!result) return res.status(404).json({ error: 'not found' });
  res.json(result);
});

// Projects portfolio (health + link to driving insight).
app.get('/api/projects', (_req, res) => res.json(PROJECTS));

// Signals: connectors + catalog with live enabled state.
app.get('/api/signals', (_req, res) => {
  const enabled = getEnabledSignals();
  res.json({
    connectors: CONNECTORS,
    signals: SIGNAL_CATALOG.map(s => ({ ...s, enabled: enabled[s.id] !== false })),
  });
});

app.post('/api/signals/:id/toggle', (req, res) => {
  const result = toggleSignal(req.params.id);
  if (!result) return res.status(404).json({ error: 'unknown signal' });
  res.json(result);
});

// Agent runs list.
app.get('/api/agents/runs', (_req, res) => res.json(getAgentRuns()));

// Search across the graph (permission-aware in a real system).
app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  const terms = q.split(/\s+/).filter(t => t.length > 2);
  let hits = SEARCH_DOCS;
  if (terms.length) {
    hits = SEARCH_DOCS
      .map(d => {
        const hay = (d.title + ' ' + d.snippet).toLowerCase();
        const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
        return { d, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.d);
    if (!hits.length) hits = SEARCH_DOCS;
  }
  res.json({ count: hits.length, results: hits });
});

// --- Agent run: SSE streaming -----------------------------------------------
app.get('/api/agent/:id/run', async (req, res) => {
  const insight = findInsight(req.params.id);
  const script = AGENT_SCRIPTS[req.params.id];
  if (!insight || !script) return res.status(404).json({ error: 'no agent for this insight' });

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  send('start', { insightId: insight.id, total: script.steps.length });
  for (let n = 0; n < script.steps.length; n++) {
    await sleep(700);
    send('step', { index: n, text: script.steps[n], done: n });
  }
  await sleep(500);

  addAgentRun({
    id: 'run-' + req.params.id + '-' + getAgentRuns().length,
    insightId: insight.id,
    title: insight.title.slice(0, 60),
    summary: script.title,
    status: 'wait', label: 'Awaiting approval',
  });

  send('done', { title: script.title, options: script.options });
  res.end();
});

// --- Assistant: optional Claude, else canned --------------------------------
app.post('/api/assistant', async (req, res) => {
  const message = String(req.body?.message || '');
  const persona = req.body?.persona || 'delivery';
  const lk = message.toLowerCase();

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic();
      const p = PERSONAS[persona] || PERSONAS.delivery;
      const ctx = p.insights.map(i =>
        `- [${i.sevLabel}] ${i.title} (confidence ${computeConfidence(i)}). ${i.body.replace(/<[^>]+>/g, '')}`
      ).join('\n');
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are Glean's Enterprise Intelligence assistant for a ${p.who.role}. Answer ONLY from the proactive insights below. Be concise (2-3 sentences), specific, and decision-oriented. You may use <b> tags for emphasis. Current insights:\n${ctx}`,
        messages: [{ role: 'user', content: message }],
      });
      const reply = msg.content.map(b => (b.type === 'text' ? b.text : '')).join('');
      return res.json({ reply, cites: ['gh', 'jira'], llm: true });
    } catch (e) {
      // fall through to canned
    }
  }

  let reply = ASSISTANT_REPLIES.default;
  if (lk.includes('reassign') || lk.includes('review')) reply = ASSISTANT_REPLIES.reassign;
  else if (lk.includes('who') || lk.includes('person') || lk.includes('owner')) reply = ASSISTANT_REPLIES.who;
  res.json({ reply, cites: ['gh', 'jira'], llm: false });
});

// --- Serve the built frontend (single-service deploy) -----------------------
// In production the React build is served from the same origin as /api, so
// there's no CORS and SSE works on a persistent Node host.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback for client-side routes (but never for /api/*).
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
  console.log('[glean-ei] serving frontend build from', distDir);
} else {
  console.log('[glean-ei] no frontend build found — API only (run `npm run build` for single-service mode)');
}

app.listen(PORT, () => console.log(`[glean-ei] listening on http://localhost:${PORT}`));
