import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar.jsx'
import Logo from '../components/Logo.jsx'
import Choice from '../components/Choice.jsx'
import { getProfile, saveProfile, resetDemo } from '../lib/dataClient.js'
import { GOAL_LABEL, EXPERIENCE_LABEL } from '../data/mock.js'

// ============================================================
// Perfil / Configuración — editar objetivo, nivel y días; ver el
// plan (free/premium) y acciones de cuenta. Los cambios se
// guardan al instante.
// ============================================================

const GOALS = Object.entries(GOAL_LABEL).map(([value, label]) => ({ value, label }))
const LEVELS = Object.entries(EXPERIENCE_LABEL).map(([value, label]) => ({ value, label }))

export default function Perfil() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(getProfile())

  async function update(patch) {
    const next = await saveProfile(patch)
    setProfile({ ...next })
  }

  function logout() {
    resetDemo()
    navigate('/onboarding')
  }

  const isPremium = profile.plan === 'premium'

  return (
    <div className="shell shell--zona perfil">
      <header className="zona-head">
        <Logo />
        <span className="zona-goal data">PERFIL</span>
      </header>

      {/* Plan */}
      <section className={`plan-card${isPremium ? ' plan-card--premium' : ''}`}>
        <div>
          <span className="eyebrow">Tu plan</span>
          <span className="plan-name">{isPremium ? 'Pulso Premium' : 'Pulso Free'}</span>
        </div>
        {isPremium ? (
          <button type="button" className="plan-badge-btn data" onClick={() => navigate('/premium')}>
            GESTIONAR
          </button>
        ) : (
          <button type="button" className="plan-cta" onClick={() => navigate('/premium')}>
            Probar Premium
          </button>
        )}
      </section>
      {!isPremium && (
        <p className="perfil-hint">Premium suma reporte con IA, historial ilimitado y comparativas mes a mes.</p>
      )}

      {/* Objetivo */}
      <section className="perfil-block">
        <span className="eyebrow" id="p-goal">Objetivo</span>
        <Choice id="p-goal" value={profile.goal} onChange={(v) => update({ goal: v })} options={GOALS} />
      </section>

      {/* Nivel */}
      <section className="perfil-block">
        <span className="eyebrow" id="p-level">Nivel de experiencia</span>
        <Choice
          id="p-level"
          value={profile.experience_level}
          onChange={(v) => update({ experience_level: v })}
          options={LEVELS}
        />
      </section>

      {/* Días por semana */}
      <section className="perfil-block">
        <span className="eyebrow" id="p-days">Días de entrenamiento por semana</span>
        <div className="ob-days" role="radiogroup" aria-labelledby="p-days">
          {[2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={profile.training_days_per_week === n}
              className={`ob-day${profile.training_days_per_week === n ? ' ob-day--on' : ''}`}
              onClick={() => update({ training_days_per_week: n })}
            >
              <span className="data">{n}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Acciones */}
      <section className="perfil-actions">
        <button
          type="button"
          className="perfil-action"
          onClick={() => {
            resetDemo()
            window.location.reload()
          }}
        >
          Reiniciar datos de demo
        </button>
        <button type="button" className="perfil-action perfil-action--danger" onClick={logout}>
          Cerrar sesión
        </button>
      </section>

      <TabBar active="profile" onNavigate={navigate} />
    </div>
  )
}
