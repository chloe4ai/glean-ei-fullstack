// Mutable server-side state + the "intelligence" computations that make this a
// real backend: confidence is recomputed from enabled signals, and feedback
// shifts calibration. Persisted to feedback.json so it survives restarts.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PERSONAS, SIGNAL_CATALOG } from './data/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PERSIST = path.join(__dirname, 'feedback.json');

const catalogIds = new Set(SIGNAL_CATALOG.map(s => s.id));

const state = {
  enabledSignals: Object.fromEntries(SIGNAL_CATALOG.map(s => [s.id, true])),
  feedback: {},        // insightId -> [{ kind, ts }]
  confidenceDelta: {}, // insightId -> number
  agentRuns: [
    { id: 'seed-1', insightId: 'atlas',     title: 'Atlas mitigation plan',          summary: 'Drafted 3 options · posted to #atlas-leads', status: 'wait', label: 'Awaiting approval' },
    { id: 'seed-2', insightId: 'win',       title: 'Onboarding runbook · Mobile + Data Platform', summary: '2 runbooks drafted from Checkout template', status: 'ok', label: 'Approved' },
    { id: 'seed-3', insightId: 'bus',       title: 'Re-sequence payments items',      summary: 'Moved BILL-2231 out of PTO window', status: 'ok', label: 'Done' },
    { id: 'seed-4', insightId: 'theme',     title: 'Route auth-flake theme to Platform PM', summary: 'Epic created · 15 items linked', status: 'run', label: 'Running' },
  ],
};

try {
  if (fs.existsSync(PERSIST)) {
    const saved = JSON.parse(fs.readFileSync(PERSIST, 'utf8'));
    Object.assign(state.feedback, saved.feedback || {});
    Object.assign(state.confidenceDelta, saved.confidenceDelta || {});
    if (saved.enabledSignals) Object.assign(state.enabledSignals, saved.enabledSignals);
  }
} catch { /* ignore corrupt persistence */ }

function persist() {
  try {
    fs.writeFileSync(PERSIST, JSON.stringify({
      feedback: state.feedback,
      confidenceDelta: state.confidenceDelta,
      enabledSignals: state.enabledSignals,
    }, null, 2));
  } catch { /* best effort */ }
}

const clamp = (n, lo = 0.05, hi = 0.99) => Math.max(lo, Math.min(hi, n));

export const allInsights = () =>
  [...PERSONAS.delivery.insights, ...PERSONAS.revenue.insights];

export function findInsight(id) {
  return allInsights().find(i => i.id === id) || null;
}

function signalEnabled(sig) {
  // Togglable catalog signals respect the store; non-catalog contributions are always on.
  return catalogIds.has(sig) ? !!state.enabledSignals[sig] : true;
}

// The real computation: composite confidence from currently-enabled signals + feedback.
export function computeConfidence(insight) {
  const total = insight.contributions.reduce((s, c) => s + c.weight, 0) || 1;
  const live = insight.contributions.reduce((s, c) => s + (signalEnabled(c.signal) ? c.weight : 0), 0);
  const coverage = live / total;
  const delta = state.confidenceDelta[insight.id] || 0;
  return Math.round(clamp(insight.baseConfidence * coverage + delta) * 100) / 100;
}

// Each contribution annotated with whether its signal is currently live.
export function liveContributions(insight) {
  return insight.contributions.map(c => ({ ...c, enabled: signalEnabled(c.signal) }));
}

export function getEnabledSignals() {
  return { ...state.enabledSignals };
}

export function toggleSignal(id) {
  if (!(id in state.enabledSignals)) return null;
  state.enabledSignals[id] = !state.enabledSignals[id];
  persist();
  // Return which insights changed and their new confidence.
  const affected = allInsights()
    .filter(i => i.contributions.some(c => c.signal === id))
    .map(i => ({ id: i.id, title: i.title, confidence: computeConfidence(i) }));
  return { id, enabled: state.enabledSignals[id], affected };
}

export function recordFeedback(insightId, kind) {
  if (!findInsight(insightId)) return null;
  (state.feedback[insightId] ||= []).push({ kind, ts: Date.now() });
  // Calibration: "confidence too high" lowers it; "useful" reinforces slightly.
  if (kind === 'cal')      state.confidenceDelta[insightId] = (state.confidenceDelta[insightId] || 0) - 0.08;
  else if (kind === 'useful') state.confidenceDelta[insightId] = (state.confidenceDelta[insightId] || 0) + 0.01;
  persist();
  const messages = {
    useful: '✓ Logged. Glean reinforces this signal pattern and will keep surfacing similar risks early.',
    noise:  '✓ Logged. Glean will down-weight this pattern for your team and re-score similar insights.',
    cal:    '✓ Logged. Confidence lowered for this pattern and re-calibrated across similar insights.',
    late:   '✓ Logged. Glean will widen the lead-time window so this surfaces earlier next time.',
  };
  const insight = findInsight(insightId);
  return {
    message: messages[kind] || '✓ Feedback logged.',
    confidence: computeConfidence(insight),
    feedbackCount: state.feedback[insightId].length,
  };
}

export function addAgentRun(run) {
  state.agentRuns.unshift(run);
  if (state.agentRuns.length > 30) state.agentRuns.length = 30;
}

export function getAgentRuns() {
  return state.agentRuns;
}
