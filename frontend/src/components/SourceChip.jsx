import { useApp } from '../context.jsx'

// A colored square (label[0]) + the source label. Falls back gracefully.
export default function SourceChip({ srcKey }) {
  const { sources } = useApp()
  const s = sources[srcKey] || { label: srcKey, color: '#727272' }
  return (
    <span className="src">
      <span className="sq" style={{ background: s.color }}>
        {s.label[0]}
      </span>
      {s.label}
    </span>
  )
}
