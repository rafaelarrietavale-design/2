import { useState } from 'react'
import { Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signIn, signUp, backend } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'in') await signIn(email, password)
      else await signUp(email, password, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal.')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-moon-500 to-aurora-500 text-night-950 shadow-glow">
            <Moon size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Descansa</h1>
          <p className="mt-1 text-sm text-gray-400">
            Registra tus horas exactas de sueño
          </p>
        </div>

        <div className="card p-6">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-night-850 p-1">
            <button
              onClick={() => setMode('in')}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                mode === 'in' ? 'bg-moon-600 text-white' : 'text-gray-400'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode('up')}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                mode === 'up' ? 'bg-moon-600 text-white' : 'text-gray-400'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === 'up' && (
              <div>
                <label className="label">Nombre</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="label">Correo</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary mt-1">
              {busy
                ? 'Un momento...'
                : mode === 'in'
                  ? 'Entrar'
                  : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          {backend === 'firebase'
            ? 'Conectado a Firebase · datos sincronizados en la nube'
            : 'Modo local · tus datos se guardan en este dispositivo'}
        </p>
      </div>
    </div>
  )
}
