import { useState } from 'react'
import {
  Bell,
  Cloud,
  HardDrive,
  Lock,
  LogOut,
  Moon,
  Palette,
  Target,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { requestNotificationPermission } from '../lib/notifications'
import { formatHm } from '../lib/sleepMath'
import type { ThemeName } from '../data/types'

const themes: { id: ThemeName; label: string; from: string; to: string; premium: boolean }[] = [
  { id: 'aurora', label: 'Aurora', from: '#818cf8', to: '#2dd4bf', premium: false },
  { id: 'lavender', label: 'Lavanda', from: '#a78bfa', to: '#f0abfc', premium: true },
  { id: 'midnight', label: 'Medianoche', from: '#38bdf8', to: '#6366f1', premium: true },
]

const goalOptions = [360, 420, 450, 480, 510, 540]

export default function Settings() {
  const { user, backend, signOut } = useAuth()
  const { profile, updateProfile } = useProfile()
  const [savingReminder, setSavingReminder] = useState(false)

  const toggleReminder = async () => {
    if (!profile.reminderEnabled) {
      setSavingReminder(true)
      const perm = await requestNotificationPermission()
      setSavingReminder(false)
      if (perm !== 'granted') {
        await updateProfile({ reminderEnabled: false })
        alert('Debes permitir las notificaciones para activar el recordatorio.')
        return
      }
    }
    await updateProfile({ reminderEnabled: !profile.reminderEnabled })
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Ajustes</h1>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </header>

      {/* Objetivo de sueño */}
      <section className="card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} className="text-moon-400" />
          <h2 className="font-semibold text-white">Objetivo de sueño</h2>
        </div>
        <p className="mb-3 text-sm text-gray-400">
          Cuánto quieres dormir cada noche: {formatHm(profile.goalMinutes)}
        </p>
        <div className="flex flex-wrap gap-2">
          {goalOptions.map((g) => (
            <button
              key={g}
              onClick={() => updateProfile({ goalMinutes: g })}
              className={`chip ${
                profile.goalMinutes === g
                  ? 'bg-moon-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {formatHm(g)}
            </button>
          ))}
        </div>
      </section>

      {/* Recordatorio */}
      <section className="card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell size={18} className="text-moon-400" />
          <h2 className="font-semibold text-white">Recordatorio para dormir</h2>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-300">Avísame a mi hora de acostarme</p>
            <input
              type="time"
              value={profile.bedtime}
              onChange={(e) => updateProfile({ bedtime: e.target.value })}
              className="input mt-2 w-32"
            />
          </div>
          <button
            onClick={toggleReminder}
            disabled={savingReminder}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              profile.reminderEnabled ? 'bg-moon-600' : 'bg-white/10'
            }`}
            aria-pressed={profile.reminderEnabled}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                profile.reminderEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Temas */}
      <section className="card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Palette size={18} className="text-moon-400" />
          <h2 className="font-semibold text-white">Tema</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const locked = t.premium && !profile.premium
            return (
              <button
                key={t.id}
                onClick={() => !locked && updateProfile({ theme: t.id })}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${
                  profile.theme === t.id
                    ? 'border-moon-500'
                    : 'border-white/10 hover:border-white/20'
                } ${locked ? 'opacity-60' : ''}`}
              >
                <span
                  className="h-9 w-9 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                  }}
                />
                <span className="text-xs text-gray-300">{t.label}</span>
                {locked && (
                  <Lock size={12} className="absolute right-2 top-2 text-gray-400" />
                )}
              </button>
            )
          })}
        </div>
        {!profile.premium && (
          <p className="mt-3 text-xs text-gray-500">
            Algunos temas son exclusivos de Premium.
          </p>
        )}
      </section>

      {/* Cuenta / backend */}
      <section className="card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          {backend === 'firebase' ? (
            <Cloud size={18} className="text-aurora-400" />
          ) : (
            <HardDrive size={18} className="text-gray-400" />
          )}
          <h2 className="font-semibold text-white">Datos</h2>
        </div>
        <p className="text-sm text-gray-400">
          {backend === 'firebase'
            ? 'Sincronizados en la nube con Firebase.'
            : 'Guardados localmente en este dispositivo. Configura Firebase para sincronizar entre dispositivos.'}
        </p>
      </section>

      <button
        onClick={signOut}
        className="btn w-full bg-white/5 text-gray-300 hover:bg-white/10"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-600">
        <Moon size={12} /> Descansa · v0.1.0
      </div>
    </div>
  )
}
