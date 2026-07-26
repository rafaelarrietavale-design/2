import { useState } from 'react'
import { Lock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSleep } from '../context/SleepContext'
import { useProfile } from '../context/ProfileContext'
import type { SleepSession } from '../data/types'
import SessionCard from '../components/SessionCard'
import SessionEditor from '../components/SessionEditor'
import AdSlot from '../components/AdSlot'

/** En el tier gratuito el historial visible se limita; premium lo desbloquea. */
const FREE_HISTORY_LIMIT = 14

export default function History() {
  const { sessions, saveSession, deleteSession } = useSleep()
  const { profile } = useProfile()
  const [editing, setEditing] = useState<SleepSession | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const limited = !profile.premium && sessions.length > FREE_HISTORY_LIMIT
  const visible = limited ? sessions.slice(0, FREE_HISTORY_LIMIT) : sessions
  const hiddenCount = sessions.length - visible.length

  const openNew = () => {
    setEditing(null)
    setShowEditor(true)
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Historial</h1>
          <p className="text-sm text-gray-400">
            {sessions.length} registro{sessions.length === 1 ? '' : 's'}
          </p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Añadir
        </button>
      </header>

      {sessions.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          Sin registros todavía.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((s, i) => (
            <div key={s.id}>
              <SessionCard
                session={s}
                onClick={() => {
                  setEditing(s)
                  setShowEditor(true)
                }}
              />
              {i === 3 && <AdSlot className="mt-2" />}
            </div>
          ))}

          {limited && (
            <Link
              to="/premium"
              className="card mt-2 flex flex-col items-center gap-2 border-dashed border-moon-500/20 p-6 text-center"
            >
              <Lock size={22} className="text-moon-400" />
              <p className="font-semibold text-white">
                {hiddenCount} registro{hiddenCount === 1 ? '' : 's'} más en tu historial
              </p>
              <p className="text-sm text-gray-400">
                Desbloquea el historial completo con Descansa Premium.
              </p>
              <span className="btn-primary mt-1">Ver Premium</span>
            </Link>
          )}
        </div>
      )}

      {showEditor && (
        <SessionEditor
          session={editing}
          onClose={() => setShowEditor(false)}
          onSave={saveSession}
          onDelete={deleteSession}
        />
      )}
    </div>
  )
}
