import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { store, newId } from '../data/store'
import type { OngoingSession, SessionKind, SleepSession } from '../data/types'
import { useAuth } from './AuthContext'

const ONGOING_KEY = 'descansa.ongoing'

interface SleepContextValue {
  sessions: SleepSession[]
  loading: boolean
  ongoing: OngoingSession | null
  /** Empieza a registrar sueño ahora (marca timestamp de inicio exacto). */
  startSleep: (kind: SessionKind) => void
  /** Cancela una sesión en curso sin guardarla. */
  cancelSleep: () => void
  /** Termina la sesión en curso (marca fin exacto) y la guarda. Devuelve la sesión creada. */
  stopSleep: () => Promise<SleepSession | null>
  /** Crea o actualiza una sesión (edición manual). */
  saveSession: (session: SleepSession) => Promise<void>
  deleteSession: (id: string) => Promise<void>
}

const SleepContext = createContext<SleepContextValue | null>(null)

function readOngoing(): OngoingSession | null {
  try {
    const raw = localStorage.getItem(ONGOING_KEY)
    return raw ? (JSON.parse(raw) as OngoingSession) : null
  } catch {
    return null
  }
}

export function SleepProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SleepSession[]>([])
  const [loading, setLoading] = useState(true)
  const [ongoing, setOngoing] = useState<OngoingSession | null>(readOngoing)

  useEffect(() => {
    let active = true
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    store.listSessions(user.uid).then((list) => {
      if (!active) return
      setSessions(list)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [user])

  const startSleep = useCallback((kind: SessionKind) => {
    const next: OngoingSession = { start: new Date().toISOString(), kind }
    localStorage.setItem(ONGOING_KEY, JSON.stringify(next))
    setOngoing(next)
  }, [])

  const cancelSleep = useCallback(() => {
    localStorage.removeItem(ONGOING_KEY)
    setOngoing(null)
  }, [])

  const stopSleep = useCallback(async (): Promise<SleepSession | null> => {
    if (!ongoing || !user) return null
    const session: SleepSession = {
      id: newId(),
      start: ongoing.start,
      end: new Date().toISOString(),
      quality: 0,
      notes: '',
      tags: [],
      kind: ongoing.kind,
    }
    await store.upsertSession(user.uid, session)
    setSessions((prev) =>
      [session, ...prev].sort((a, b) => b.start.localeCompare(a.start)),
    )
    localStorage.removeItem(ONGOING_KEY)
    setOngoing(null)
    return session
  }, [ongoing, user])

  const saveSession = useCallback(
    async (session: SleepSession) => {
      if (!user) return
      await store.upsertSession(user.uid, session)
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === session.id)
        const next = idx >= 0 ? prev.map((s) => (s.id === session.id ? session : s)) : [session, ...prev]
        return next.sort((a, b) => b.start.localeCompare(a.start))
      })
    },
    [user],
  )

  const deleteSession = useCallback(
    async (id: string) => {
      if (!user) return
      await store.deleteSession(user.uid, id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    },
    [user],
  )

  const value = useMemo<SleepContextValue>(
    () => ({
      sessions,
      loading,
      ongoing,
      startSleep,
      cancelSleep,
      stopSleep,
      saveSession,
      deleteSession,
    }),
    [sessions, loading, ongoing, startSleep, cancelSleep, stopSleep, saveSession, deleteSession],
  )

  return <SleepContext.Provider value={value}>{children}</SleepContext.Provider>
}

export function useSleep(): SleepContextValue {
  const ctx = useContext(SleepContext)
  if (!ctx) throw new Error('useSleep debe usarse dentro de <SleepProvider>')
  return ctx
}
