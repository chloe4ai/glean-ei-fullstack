# Deploying the full-stack app

This is **one Node service**: the Express server serves both the React build and the `/api` endpoints (including the SSE agent stream). So any host that runs a persistent Node process works — no separate frontend/backend hosting, no CORS.

## Option A — Render (recommended, free, one click)

The repo includes `render.yaml`, so Render can deploy it as a Blueprint:

1. Go to **https://render.com** and sign in with GitHub (free).
2. **New → Blueprint**, then pick this repo — or use the direct link:
   `https://render.com/deploy?repo=https://github.com/chloe4ai/glean-ei-fullstack`
3. Render reads `render.yaml`, runs `npm run install:all && npm run build`, and starts `node backend/server.js`.
4. You get a public URL like `https://glean-enterprise-intelligence.onrender.com`.

> Free Render services sleep after ~15 min idle and cold-start (~50s) on the next hit. Fine for a shareable interview link; upgrade to the $7 plan if you want it always-warm.

Optional: in the Render dashboard add an env var `ANTHROPIC_API_KEY` to enable the live-Claude Assistant.

## Option B — Railway / Fly.io (Docker)

A `Dockerfile` is included.
- **Railway:** New Project → Deploy from GitHub repo → it autodetects the Dockerfile. ($5 free credit.)
- **Fly.io:** `fly launch` (uses the Dockerfile), then `fly deploy`.

## Local production build

```bash
npm run install:all
npm run build      # builds frontend/dist
npm start          # one server on :8787 serving app + API
```
