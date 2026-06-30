# Glean · Enterprise Intelligence — full-stack prototype

A working full-stack prototype built by **Chloe Tan** for the **Glean · Product Manager, Enterprise Intelligence** interview.

It turns Glean's enterprise context layer into a **proactive** intelligence surface: instead of searching, a leader is pushed "what changed, where value is being created or lost, and where to act" — with provenance, calibrated confidence, a feedback loop, and human-in-the-loop agents. The same engine re-skins across departments (Engineering → Revenue) via the persona switch.

## Architecture

```
app/
├── backend/         Node + Express REST + SSE API (the "intelligence" layer)
│   ├── server.js        endpoints: pulse, insight, feedback, signals, agent (SSE), search, assistant
│   ├── store.js         live state: confidence recomputed from enabled signals; feedback shifts calibration
│   └── data/seed.js     single source of truth (personas, insights, projects, signals, agent scripts)
└── frontend/        React + Vite SPA, styled to match Glean's real design tokens
```

**Why it's a real backend, not a mock:** toggling a signal in the Signals tab recomputes the affected insights' composite confidence *on the server*; submitting calibration feedback shifts a per-insight confidence delta that persists to `backend/feedback.json`; the agent "Dispatch" streams its work step-by-step over Server-Sent Events.

## Run it

```bash
cd app
npm run install:all     # installs root + backend + frontend
npm run dev             # backend on :8787, frontend on :5173 (proxies /api)
```

Open http://localhost:5173.

### Optional: live Claude in the Assistant
The Assistant tab answers from canned, grounded replies by default. Set an Anthropic key and it answers with Claude, grounded in the current persona's insights:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm --prefix backend run dev
```

## Design fidelity
Styled to Glean's real tokens: primary `#343BED`, fully-rounded pill buttons, large light-weight (400) headings with tight letter-spacing, monospace eyebrows, Switzer + Space Mono type, white/airy layout.
