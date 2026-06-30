export default function AboutFooter() {
  return (
    <footer className="about">
      <details>
        <summary>
          ℹ️&nbsp; About this prototype <span className="chev">▾</span>
        </summary>
        <div className="ab-body">
          <p>
            A <b>functional prototype</b> built by <b>Chloe Tan</b> for the{' '}
            <b>Glean · Product Manager, Enterprise Intelligence</b> interview. Everything is
            clickable, talking to a real backend — the data is illustrative; the product thinking is
            the point.
          </p>
          <h5>The thesis</h5>
          <p>
            The Enterprise Graph that powers great <i>search</i> is also the substrate for proactive{' '}
            <i>intelligence</i> — turning horizontal context into "what changed, where value is
            being created or lost, and where to act," pushed to the right leader before they ask.
          </p>
          <h5>Design decisions you can see</h5>
          <p>
            <b>① Proactive, not reactive</b> — the feed is push, ranked by value-at-risk; search is
            demoted to a secondary tab. <b>② Cross-system synthesis is the moat</b> — every insight
            states its signal contribution across ≥2 systems. <b>③ Trust is a first-class surface</b>{' '}
            — provenance, a calibrated confidence score, and a feedback loop on every insight. (I
            come from human-in-the-loop AI evaluation; for proactive intelligence, calibration{' '}
            <i>is</i> the product.) <b>④ Close the loop with human-in-the-loop agents</b> — they
            draft, you approve. <b>⑤ The primitive generalizes</b> — use the persona switch on the
            Pulse tab to watch the same engine re-skin from Engineering to Revenue.
          </p>
          <h5>Built with</h5>
          <p>
            React + Vite talking to an Express backend over REST and SSE. Confidence is recomputed
            server-side from enabled signals; feedback shifts calibration; agent runs stream live.
          </p>
        </div>
      </details>
    </footer>
  )
}
