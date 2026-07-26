import { useState } from 'react'
import { Moon, Sun, Trash2, X } from 'lucide-react'
import { newId } from '../data/store'
import { AVAILABLE_TAGS, type SessionKind, type SleepSession } from '../data/types'
import { durationMinutes, formatHm } from '../lib/sleepMath'
import QualityStars from './QualityStars'

interface SessionEditorProps {
  /** Sesión a editar; si es null se crea una nueva. */
  session: SleepSession | null
  onClose: () => void
  onSave: (session: SleepSession) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

/** ISO -> valor para <input type="datetime-local"> en hora local. */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

/** valor local del input -> ISO. */
function fromLocalInput(v: string): string {
  return new Date(v).toISOString()
}

function defaultSession(): SleepSession {
  const now = new Date()
  const end = now.toISOString()
  const start = new Date(now.getTime() - 8 * 3600000).toISOString()
  return { id: newId(), start, end, quality: 0, notes: '', tags: [], kind: 'night' }
}

export default function SessionEditor({
  session,
  onClose,
  onSave,
  onDelete,
}: SessionEditorProps) {
  const isNew = session == null
  const [draft, setDraft] = useState<SleepSession>(session ?? defaultSession())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const mins = durationMinutes(draft)
  const invalid = new Date(draft.end).getTime() <= new Date(draft.start).getTime()

  const toggleTag = (tag: string) => {
    setDraft((d) => ({
      ...d,
      tags: d.tags.includes(tag)
        ? d.tags.filter((t) => t !== tag)
        : [...d.tags, tag],
    }))
  }

  const handleSave = async () => {
    if (invalid) {
      setError('La hora de despertar debe ser posterior a la de dormir.')
      return
    }
    setSaving(true)
    try {
      await onSave(draft)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isNew) return
    setSaving(true)
    await onDelete(draft.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-2xl p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {isNew ? 'Añadir registro' : 'Editar registro'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tipo */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(['night', 'nap'] as SessionKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, kind: k }))}
              className={`btn ${
                draft.kind === k ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {k === 'night' ? <Moon size={16} /> : <Sun size={16} />}
              {k === 'night' ? 'Noche' : 'Siesta'}
            </button>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Me acosté</label>
            <input
              type="datetime-local"
              className="input"
              value={toLocalInput(draft.start)}
              onChange={(e) =>
                setDraft((d) => ({ ...d, start: fromLocalInput(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="label">Me desperté</label>
            <input
              type="datetime-local"
              className="input"
              value={toLocalInput(draft.end)}
              onChange={(e) =>
                setDraft((d) => ({ ...d, end: fromLocalInput(e.target.value) }))
              }
            />
          </div>
        </div>

        <div
          className={`mb-4 rounded-xl px-4 py-3 text-center text-sm font-semibold ${
            invalid
              ? 'bg-rose-500/10 text-rose-300'
              : 'bg-moon-600/10 text-moon-300'
          }`}
        >
          {invalid ? 'Rango de horas inválido' : `Duración: ${formatHm(mins)}`}
        </div>

        <div className="mb-4">
          <label className="label">Calidad</label>
          <QualityStars
            value={draft.quality}
            onChange={(q) => setDraft((d) => ({ ...d, quality: q }))}
            size={26}
          />
        </div>

        <div className="mb-4">
          <label className="label">Factores</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`chip ${
                  draft.tags.includes(tag)
                    ? 'bg-moon-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Notas</label>
          <textarea
            className="input min-h-[72px] resize-y"
            placeholder="Cómo dormiste, sueños, despertares..."
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          />
        </div>

        {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

        <div className="flex items-center gap-2">
          {!isNew && onDelete && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="btn bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
            >
              <Trash2 size={16} /> Borrar
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || invalid}
            className="btn-primary"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
