import { useEffect, useState } from 'react'
import { Moon, Plus, Sun, X } from 'lucide-react'
import { useSleep } from '../context/SleepContext'
import { formatClock, timeLabel } from '../lib/sleepMath'
import type { SleepSession } from '../data/types'
import SessionEditor from '../components/SessionEditor'
import AdSlot from '../components/AdSlot'

export default function Track() {
  const { ongoing, startSleep, stopSleep, cancelSleep, saveSession } = useSleep()
  const [elapsed, setElapsed] = useState(0)
  const [editing, setEditing] = useState<SleepSession | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [justCreated, setJustCreated] = useState<SleepSession | null>(null)

  // Cronómetro en vivo mientras hay una sesión en curso.
  useEffect(() => {
    if (!ongoing) return
    const tick = () =>
      setElapsed(Date.now() - new Date(ongoing.start).getTime())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [ongoing])

  const handleStop = async () => {
    const created = await stopSleep()
    if (created) {
      // Abre el editor para calificar/etiquetar la sesión recién creada.
      setJustCreated(created)
      setEditing(created)
      setShowEditor(true)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Registrar sueño</h1>
        <p className="text-sm text-gray-400">
          Marca las horas exactas al dormir y al despertar.
        </p>
      </header>

      {!ongoing ? (
        <div className="card flex flex-col items-center gap-6 p-8 text-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-night-800 to-night-900 shadow-glow">
            <div className="absolute inset-3 rounded-full border border-white/5" />
            <Moon size={56} className="text-moon-400 animate-pulse-slow" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              ¿List@ para dormir?
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Pulsa al acostarte. El cronómetro contará tu descanso.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              onClick={() => startSleep('night')}
              className="btn-primary py-3.5 text-base"
            >
              <Moon size={18} /> Ir a dormir
            </button>
            <button
              onClick={() => startSleep('nap')}
              className="btn bg-amber-500/15 py-3.5 text-base text-amber-300 hover:bg-amber-500/25"
            >
              <Sun size={18} /> Siesta
            </button>
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setJustCreated(null)
              setShowEditor(true)
            }}
            className="btn-ghost"
          >
            <Plus size={16} /> Añadir registro manual
          </button>
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-6 p-8 text-center">
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-gradient-to-br from-moon-600/20 to-aurora-500/10 shadow-glow">
            <div className="absolute inset-0 animate-pulse-slow rounded-full border-2 border-moon-500/30" />
            {ongoing.kind === 'night' ? (
              <Moon size={40} className="absolute top-8 text-moon-400" />
            ) : (
              <Sun size={40} className="absolute top-8 text-amber-400" />
            )}
            <div className="mt-6">
              <div className="font-mono text-3xl font-bold tabular-nums text-white">
                {formatClock(elapsed)}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Desde las {timeLabel(ongoing.start)}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {ongoing.kind === 'night' ? 'Durmiendo' : 'Siesta'} en curso... que
            descanses 🌙
          </p>
          <div className="grid w-full grid-cols-1 gap-3">
            <button onClick={handleStop} className="btn-aurora py-3.5 text-base">
              <Sun size={18} /> Ya desperté
            </button>
            <button
              onClick={cancelSleep}
              className="btn text-gray-400 hover:text-rose-300"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <AdSlot />
      </div>

      {showEditor && (
        <SessionEditor
          session={editing}
          onClose={() => {
            setShowEditor(false)
            setEditing(null)
            setJustCreated(null)
          }}
          onSave={saveSession}
        />
      )}

      {justCreated && !showEditor && (
        <p className="mt-4 text-center text-sm text-aurora-400">
          Registro guardado ✓
        </p>
      )}
    </div>
  )
}
