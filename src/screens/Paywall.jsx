import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isPremium, getSubscription, cancelPremium } from '../lib/dataClient.js'
import { startCheckout, PRICE, PREMIUM_BENEFITS } from '../lib/billing.js'
import { shortDate } from '../data/mock.js'

// ============================================================
// Paywall — Pulso Premium. Checkout simulado (no cobra ni pide
// tarjeta): activa el plan localmente. Con Stripe conectado, el
// botón abre el Checkout real (ver lib/billing.js).
// ============================================================

export default function Paywall() {
  const navigate = useNavigate()
  const [premium, setPremium] = useState(isPremium())
  const [busy, setBusy] = useState(false)
  const sub = getSubscription()

  async function activate() {
    setBusy(true)
    await startCheckout()
    setBusy(false)
    setPremium(true)
  }

  async function cancel() {
    await cancelPremium()
    setPremium(false)
  }

  return (
    <div className="shell shell--zona pay">
      <header className="reg-head">
        <button type="button" className="reg-close" aria-label="Volver" onClick={() => navigate(-1)}>
          ←
        </button>
        <div>
          <span className="eyebrow">Plan</span>
          <h1 className="reg-title">Pulso Premium</h1>
        </div>
      </header>

      {premium ? (
        <section className="pay-active">
          <span className="pay-active-badge data">PREMIUM ACTIVO</span>
          <p className="pay-active-text">
            Tienes todo desbloqueado.{' '}
            {sub?.current_period_end && <>Se renueva el {shortDate(sub.current_period_end.slice(0, 10))}.</>}
          </p>
          <button type="button" className="perfil-action perfil-action--danger" onClick={cancel}>
            Cancelar plan
          </button>
        </section>
      ) : (
        <>
          <section className="pay-hero">
            <span className="eyebrow">Desbloquea tu señal completa</span>
            <div className="pay-price">
              <span className="data pay-amount">${PRICE.amount}</span>
              <span className="pay-per">/ {PRICE.interval}</span>
            </div>
          </section>

          <ul className="pay-benefits">
            {PREMIUM_BENEFITS.map((b) => (
              <li key={b.title} className="pay-benefit">
                <span className="pay-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span>
                  <strong className="pay-benefit-title">{b.title}</strong>
                  <span className="pay-benefit-desc">{b.desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <button type="button" className="zona-cta pay-cta" disabled={busy} onClick={activate}>
            <span className="zona-cta-title">{busy ? 'Activando…' : `Activar Premium · $${PRICE.amount}/${PRICE.interval}`}</span>
          </button>
          <p className="pay-note">
            Checkout simulado para la demo. Con Stripe conectado, este botón abre el pago real y no se
            guarda ningún dato de tarjeta en la app.
          </p>
        </>
      )}
    </div>
  )
}
