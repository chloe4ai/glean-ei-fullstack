import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api.js'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

let toastSeq = 0

export function AppProvider({ children }) {
  const [personaKey, setPersonaKey] = useState('delivery')
  const [personas, setPersonas] = useState({}) // key -> {key, who, product}
  const [sources, setSources] = useState({}) // srcKey -> {key,label,color}
  const [toasts, setToasts] = useState([])
  const [drawer, setDrawer] = useState(null) // { id, autoAgent }

  useEffect(() => {
    api
      .personas()
      .then((list) => setPersonas(Object.fromEntries(list.map((p) => [p.key, p]))))
      .catch(() => {})
    api.sources().then(setSources).catch(() => {})
  }, [])

  const pushToast = useCallback((text) => {
    const id = ++toastSeq
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  const openInsight = useCallback((id, autoAgent = false) => setDrawer({ id, autoAgent }), [])
  const closeDrawer = useCallback(() => setDrawer(null), [])

  const current = personas[personaKey]

  const value = {
    personaKey,
    setPersonaKey,
    personas,
    current,
    sources,
    toasts,
    pushToast,
    drawer,
    openInsight,
    closeDrawer,
  }
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
