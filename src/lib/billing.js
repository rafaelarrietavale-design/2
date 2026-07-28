// ============================================================
// billing — capa de pagos (Stripe).
// HOY: checkout simulado (activa el plan localmente, sin cobrar
// ni pedir datos de tarjeta). MAÑANA: startCheckout() crea una
// Checkout Session en el backend y redirige a Stripe; el alta la
// confirma el webhook, no el cliente.
// ============================================================
import { activatePremium } from './dataClient.js'

export const PRICE = { amount: 8, currency: 'USD', interval: 'mes' }

export const PREMIUM_BENEFITS = [
  { title: 'Reporte con IA', desc: 'Análisis semanal más profundo, escrito por Claude.' },
  { title: 'Comparativas mes a mes', desc: 'Mira cómo evoluciona tu señal en el tiempo.' },
  { title: 'Historial ilimitado', desc: 'Todos tus registros, sin límite de semanas.' },
  { title: 'Insights detallados', desc: 'Más patrones y recomendaciones accionables.' },
]

const USE_REMOTE = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Inicia el "checkout". Devuelve { ok } en la demo.
export async function startCheckout() {
  if (USE_REMOTE) {
    // TODO(stripe): POST /api/create-checkout-session -> { url }
    //   const { url } = await fetch('/api/create-checkout-session', { method: 'POST' }).then(r => r.json())
    //   window.location.href = url  // redirige a Stripe Checkout
    throw new Error('Stripe no conectado: falta el endpoint de Checkout Session')
  }
  // Demo: activamos el plan sin pasar por un pago real.
  await activatePremium()
  return { ok: true, simulated: true }
}
