import { useApp } from '../context.jsx'

export default function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <span className="tk">✓</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}
