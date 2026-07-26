import { useState } from 'react'
import {
  BadgeCheck,
  BarChart3,
  Check,
  CreditCard,
  Download,
  History as HistoryIcon,
  Palette,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

const PRICE = '4,99'

const benefits = [
  { icon: Zap, text: 'Sin anuncios en toda la app' },
  { icon: BarChart3, text: 'Estadísticas avanzadas (30 días)' },
  { icon: HistoryIcon, text: 'Historial ilimitado' },
  { icon: Download, text: 'Exportar tus datos a CSV' },
  { icon: Palette, text: 'Temas exclusivos' },
]

export default function Premium() {
  const { profile, subscribePremium, cancelPremium } = useProfile()
  const [checkout, setCheckout] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleSubscribe = async () => {
    setProcessing(true)
    // Pago SIMULADO. Aquí iría la redirección a Stripe Checkout en producción.
    await new Promise((r) => setTimeout(r, 1200))
    await subscribePremium()
    setProcessing(false)
    setCheckout(false)
  }

  if (profile.premium) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-moon-600 to-aurora-500 p-8 text-center text-night-950">
            <BadgeCheck size={48} className="mx-auto mb-3" />
            <h1 className="text-2xl font-extrabold">Eres Premium ✨</h1>
            <p className="mt-1 text-sm opacity-80">
              Gracias por apoyar Descansa.
            </p>
          </div>
          <div className="p-6">
            <p className="mb-4 text-sm text-gray-400">
              Tu suscripción se renueva el{' '}
              <span className="font-semibold text-white">
                {profile.premiumRenewsAt
                  ? new Date(profile.premiumRenewsAt).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
              . Precio: {PRICE} $/mes.
            </p>
            <ul className="mb-6 flex flex-col gap-2">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-gray-200">
                  <Icon size={16} className="text-aurora-400" /> {text}
                </li>
              ))}
            </ul>
            <button
              onClick={cancelPremium}
              className="btn bg-white/5 text-gray-300 hover:bg-white/10"
            >
              Cancelar suscripción
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <header className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-moon-500 to-aurora-500 text-night-950 shadow-glow">
          <Sparkles size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Descansa Premium</h1>
        <p className="mt-1 text-sm text-gray-400">
          Desbloquea todo y elimina los anuncios.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Plan gratis */}
        <div className="card p-6">
          <h2 className="font-bold text-white">Gratis</h2>
          <p className="mt-1 text-3xl font-extrabold text-white">
            0 $<span className="text-sm font-normal text-gray-400">/mes</span>
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-gray-500" /> Registro de sueño
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-gray-500" /> Estadísticas 7 días
            </li>
            <li className="flex items-center gap-2 text-gray-500">
              <X size={16} /> Con anuncios
            </li>
          </ul>
        </div>

        {/* Plan premium */}
        <div className="card relative border-moon-500/40 p-6 shadow-glow">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-moon-500 to-aurora-500 px-3 py-1 text-xs font-bold text-night-950">
            RECOMENDADO
          </span>
          <h2 className="font-bold text-white">Premium</h2>
          <p className="mt-1 text-3xl font-extrabold text-white">
            {PRICE} $<span className="text-sm font-normal text-gray-400">/mes</span>
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-gray-200">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-aurora-400" /> {text}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setCheckout(true)}
            className="btn-primary mt-6 w-full"
          >
            <Sparkles size={16} /> Hazte Premium
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-600">
        Cancela cuando quieras. Facturación mensual de {PRICE} $.
      </p>

      {/* Checkout simulado */}
      {checkout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !processing && setCheckout(false)}
        >
          <div
            className="card w-full max-w-md rounded-b-none rounded-t-2xl p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <CreditCard size={20} className="text-moon-400" /> Pago seguro
              </h2>
              {!processing && (
                <button
                  onClick={() => setCheckout(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="mb-4 rounded-xl bg-night-850 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Descansa Premium (mensual)</span>
                <span className="font-semibold text-white">{PRICE} $</span>
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 opacity-90">
              <div>
                <label className="label">Número de tarjeta</label>
                <input
                  className="input"
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Caducidad</label>
                  <input className="input" placeholder="MM/AA" />
                </div>
                <div>
                  <label className="label">CVC</label>
                  <input className="input" placeholder="123" inputMode="numeric" />
                </div>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Demo: pago simulado, no se realiza ningún cargo real. Listo para
              conectar Stripe.
            </div>

            <button
              onClick={handleSubscribe}
              disabled={processing}
              className="btn-primary w-full py-3"
            >
              {processing ? 'Procesando pago...' : `Pagar ${PRICE} $ y suscribirme`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
