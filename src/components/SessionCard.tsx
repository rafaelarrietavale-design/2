import { Moon, Sun } from 'lucide-react'
import type { SleepSession } from '../data/types'
import { dateLabel, durationMinutes, formatHm, timeLabel } from '../lib/sleepMath'
import QualityStars from './QualityStars'

interface SessionCardProps {
  session: SleepSession
  onClick?: () => void
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const mins = durationMinutes(session)
  return (
    <button
      onClick={onClick}
      className="card flex w-full items-center gap-4 p-4 text-left transition-transform hover:scale-[1.01] hover:border-white/10"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          session.kind === 'night'
            ? 'bg-moon-600/15 text-moon-400'
            : 'bg-amber-500/15 text-amber-400'
        }`}
      >
        {session.kind === 'night' ? <Moon size={20} /> : <Sun size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{formatHm(mins)}</span>
          {session.quality > 0 && (
            <QualityStars value={session.quality} size={12} />
          )}
        </div>
        <div className="mt-0.5 truncate text-sm text-gray-400">
          {dateLabel(session.end)} · {timeLabel(session.start)}–{timeLabel(session.end)}
        </div>
        {session.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {session.tags.slice(0, 4).map((t) => (
              <span key={t} className="chip bg-white/5 text-gray-400">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
