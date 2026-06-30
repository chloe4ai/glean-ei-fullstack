import { useApp } from '../context.jsx'
import SourceChip from './SourceChip.jsx'
import Html from './Html.jsx'

export default function InsightCard({ card }) {
  const { openInsight, pushToast } = useApp()
  const pct = Math.round((card.confidence || 0) * 100)
  const primary = card.actions?.[0]

  const runPrimary = (e) => {
    e.stopPropagation()
    if (!primary) return openInsight(card.id)
    if (primary.agentic) openInsight(card.id, true)
    else {
      pushToast(primary.t)
      openInsight(card.id)
    }
  }

  return (
    <div className={`card ${card.win ? 'win' : ''}`} onClick={() => openInsight(card.id)}>
      <div className={`rail ${card.severity}`} />
      <div className="chead">
        <span className={`sev ${card.severity}`}>{card.sevLabel}</span>
        <div>
          <div className="ctitle">{card.title}</div>
          <div className="cmeta">{card.meta}</div>
        </div>
      </div>
      <Html as="div" className="cbody" html={card.body} />
      <div className="signals">
        {card.sources.map((s) => (
          <SourceChip key={s} srcKey={s} />
        ))}
      </div>
      <div className="cfoot">
        <span className="conf">
          confidence
          <span className="confbar">
            <i style={{ width: `${pct}%`, background: card.confColor }} />
          </span>
          {card.confidence?.toFixed(2)}
        </span>
        <span className="grow" />
        <button
          className="btn outline"
          onClick={(e) => {
            e.stopPropagation()
            openInsight(card.id)
          }}
        >
          See evidence
        </button>
        {primary && (
          <button className="btn primary" onClick={runPrimary}>
            {primary.ic} {primary.ab}
          </button>
        )}
      </div>
    </div>
  )
}
