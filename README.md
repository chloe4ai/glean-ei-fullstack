# Enterprise Intelligence

**A push surface has to prove itself every time, because nobody asked to see it.**

Enterprise search is a place you go. This prototype inverts that: a VP opens a brief that was assembled while they were away — what changed, where value is being created or lost, what to do about it. Everything that arrives uninvited carries its provenance with it, because an unexplained proactive alert is indistinguishable from spam.

▶ **[Live demo](https://chloe4ai.github.io/glean-ei-live/)** — `chloe4ai/glean-ei-live` is the deployed build of this source. It runs serverless by reimplementing the backend's computations client-side in `frontend/src/mock/`, so the behavior is identical.

---

## The product argument

**1. Confidence is recomputed on the server, never carried on the payload.**
`computeConfidence()` in `backend/store.js` is the whole thesis in six lines: composite = `baseConfidence × (live signal weight / total weight) + feedback delta`, clamped to 0.05–0.99. Disable "PR review latency" in the Signals tab and the Atlas launch-slip insight loses 29 of its 100 contribution points — 0.84 falls to 0.60 — and the toggle response names every insight that moved. If confidence were a stored field, disconnecting a source would leave the number intact and the insight would keep asserting evidence it no longer has. The score has to be a function of what is currently readable, not a claim made once at generation time.

**2. Feedback moves calibration asymmetrically — 8:1.**
"Confidence too high" subtracts 0.08. "Useful & acted" adds 0.01. That ratio is deliberate: on a surface the user did not ask for, a false positive costs an order of magnitude more than a false negative, because it is what makes someone turn the whole product off. Symmetric weights would let a well-liked insight inflate its own score. Deltas persist to `backend/feedback.json`, so calibration survives a restart rather than resetting to the seeded optimism.

**3. Agents draft. They do not ship.**
The SSE run at `GET /api/agent/:id/run` streams each step (`Reading Atlas board + 47 open Jira items`, `Diffing last 2 sprint velocities`, …) and then writes a run record with `status: 'wait'`, `label: 'Awaiting approval'`. The Atlas agent returns **three** options — unblock, rescope, move the date — with the slip probability each one implies, rather than the single best one. An agent that picks reduces the human to a rubber stamp, and a rubber stamp is not a control.

**4. Provenance is a field, not a footnote.**
Every insight carries `contributions[]` — signal, human label, percentage weight, source system — plus a dated evidence timeline and a calibration record (`precision`, `sampleSize`, `leadTimeDays`; Atlas: 86% at this score band, n=142, 19 days of lead time). Contributions whose signal is disabled render dimmed rather than vanishing, so the drawer shows what is missing, not just what is present. A proactive insight without a visible chain back to the source document is a rumor.

**5. Intelligence is not only risk.**
Two of the eight insights are `VALUE CREATED` — a runbook that cut new-hire ramp 22%, an exec-review play correlated with 2.1× expansion — and both label themselves honestly: samples of 6 and 18, "correlational, not proven causal." A system that only surfaces bad news trains people to dread the notification.

---

## What's in it

| Surface | What it does |
|---|---|
| **Pulse** | The proactive brief — severity, value-at-risk, live confidence per insight |
| **Insight drawer** | Narrative, weighted contributions, evidence timeline, calibration, actions, feedback |
| **Signals** | 6 connectors and a 9-signal catalog; toggle one and watch scores recompute |
| **Agents** | Run history with approval state; agent runs stream step-by-step over SSE |
| **Search · Assistant** | Term-scored search over the graph; assistant answers grounded in the current persona's insights (live Claude if `ANTHROPIC_API_KEY` is set, otherwise canned) |
| **Persona switch** | Delivery (VP Engineering) and Revenue (VP Revenue) read from one seed through one `hydrate()` |

## Stack

Node + Express (REST + SSE) · React 18 + Vite · no database — mutable server state with JSON persistence.

```bash
npm run install:all
npm run dev        # backend :8787, frontend :5173
```

`npm run build && npm start` serves the React build and `/api` from one Node process — same origin, no CORS, SSE intact. `render.yaml` and a `Dockerfile` are included; see `DEPLOY.md`.

## Known limits

- **The insights are fixtures.** The semantic clustering, sentiment analysis and cross-team theme detection described in the copy are asserted, not implemented. What is real is the arithmetic on top: coverage-weighted confidence, feedback deltas, the SSE run loop, persistence.
- **Calibration numbers are seeded, not earned.** "86% precision, 142 prior predictions" is a string in `seed.js`. Nothing scores a prediction against what actually happened, which is exactly the property this product would most need in order to be believed.
- **Feedback is global and unbounded.** One person's "confidence too high" moves the score for everyone, limited only by the 0.05–0.99 clamp — twelve clicks floor any insight regardless of evidence.
- **No permission model.** `/api/search` scores substring hits across 7 seeded documents and returns everything when nothing matches. Permission-aware retrieval is the hard part of enterprise search and none of it is here.

## What I'd build next

- **Grade the pushes.** Log every insight with its score, its lead time and its eventual outcome, then publish observed precision per confidence band. Right now confidence is internally consistent and externally unvalidated; the measurement that matters is whether a 0.84 means 0.84.
- **An interruption budget.** Measure insights shown against insights actioned per person per week, and let the ratio — not a threshold on severity — decide what gets pushed. The failure mode of proactive intelligence is volume, and nothing in this build counts it.
- **Per-team calibration with decay.** The same loop, scoped and time-weighted, measured on whether the delta converges or oscillates.
