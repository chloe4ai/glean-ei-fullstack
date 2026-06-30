import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useApp } from '../context.jsx'

function leadLabel(v) {
  return v < 35 ? 'Precision' : v > 65 ? 'Early warning' : 'Balanced'
}

export default function Settings() {
  const { pushToast } = useApp()
  const [thr, setThr] = useState(65)
  const [noise, setNoise] = useState(4)
  const [lead, setLead] = useState(60)
  const [toggles, setToggles] = useState({ scope: true, weekend: true, autodispatch: false })
  const [connectors, setConnectors] = useState([])

  useEffect(() => {
    api.signals().then((d) => setConnectors(d.connectors)).catch(() => {})
  }, [])

  const flip = (key, msg) => {
    setToggles((t) => ({ ...t, [key]: !t[key] }))
    pushToast(msg)
  }

  return (
    <>
      <div className="lead">
        <span className="eyebrow">⚙ Calibration &amp; trust</span>
        <h2>Tune the signal-to-noise yourself</h2>
        <p>
          Proactive intelligence lives or dies on precision. These controls let each leader set how
          aggressive the feed is — and the system learns from every piece of feedback.
        </p>
      </div>

      <div className="blocktitle">Calibration</div>
      <div className="panel">
        <div className="setrow">
          <div className="sl">
            <b>Confidence threshold</b>
            <span>Only surface insights scored above this. Higher = quieter, more precise.</span>
          </div>
          <input type="range" min="40" max="95" value={thr} onChange={(e) => setThr(+e.target.value)} />
          <span className="valbadge">{(thr / 100).toFixed(2)}</span>
        </div>
        <div className="setrow">
          <div className="sl">
            <b>Noise sensitivity</b>
            <span>How readily borderline patterns are flagged as emerging themes.</span>
          </div>
          <input type="range" min="1" max="10" value={noise} onChange={(e) => setNoise(+e.target.value)} />
          <span className="valbadge">{noise} / 10</span>
        </div>
        <div className="setrow">
          <div className="sl">
            <b>Lead-time vs. precision</b>
            <span>Earlier warnings trade some accuracy. Slide toward whichever you need.</span>
          </div>
          <input type="range" min="0" max="100" value={lead} onChange={(e) => setLead(+e.target.value)} />
          <span className="valbadge">{leadLabel(lead)}</span>
        </div>
      </div>

      <div className="blocktitle">Scope</div>
      <div className="panel">
        <div className="setrow">
          <div className="sl">
            <b>Watch all 6 teams</b>
            <span>Or narrow to the teams you own.</span>
          </div>
          <button
            className={`tog ${toggles.scope ? 'on' : ''}`}
            onClick={() => flip('scope', 'Team scope updated')}
          />
        </div>
        <div className="setrow">
          <div className="sl">
            <b>Weekend synthesis</b>
            <span>Run the brief Sun night so it's ready Monday 7am.</span>
          </div>
          <button
            className={`tog ${toggles.weekend ? 'on' : ''}`}
            onClick={() => flip('weekend', 'Weekend synthesis on')}
          />
        </div>
        <div className="setrow">
          <div className="sl">
            <b>Auto-dispatch low-risk agents</b>
            <span>Off by default — keeps a human in the loop on every action.</span>
          </div>
          <button
            className={`tog ${toggles.autodispatch ? 'on' : ''}`}
            onClick={() =>
              flip('autodispatch', 'Heads up: this reduces human-in-the-loop control')
            }
          />
        </div>
      </div>

      <div className="blocktitle">Connectors</div>
      <div className="grid3">
        {connectors.map((c) => (
          <div className="panel connset" key={c.key}>
            <div className="ci" style={{ background: c.color }}>
              {c.initial}
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 12.5 }}>{c.name}</b>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>connected</div>
            </div>
            <button className="tog on" onClick={() => pushToast(`${c.name} connector toggled`)} />
          </div>
        ))}
      </div>
    </>
  )
}
