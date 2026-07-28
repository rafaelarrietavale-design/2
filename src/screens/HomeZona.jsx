import { useNavigate } from 'react-router-dom'
import ZoneMeter, { ZONES } from '../components/ZoneMeter.jsx'
import TabBar from '../components/TabBar.jsx'
import { getProfile, getWeek } from '../lib/dataClient.js'
import { GOAL_LABEL, weekSeries, weekAvgReadiness, recommendedZone, readiness } from '../data/mock.js'

// ============================================================
// Home — dirección "Zona / Heat".
// Adrenalina y foco: superficie oscura de "training floor",
// números grandes en mono, y el medidor de zona del día como
// firma. Energía sin ruido.
// ============================================================

export default function HomeZona() {
  const navigate = useNavigate()
  const profile = getProfile()
  const week = getWeek()
  const series = weekSeries(week.logs)

  const last = week.lastLogged
  const avg = weekAvgReadiness(series)
  const zone = recommendedZone(avg)
  const z = ZONES.find((x) => x.z === zone)
  const trainedCount = series.filter((d) => d.trained === true).length
  const registeredToday = week.today && week.today.energy_level != null
  const todayReadiness = registeredToday ? readiness(week.today) : null

  return (
    <div className="shell shell--zona">
      <header className="zona-head">
        <span className="zona-brand">PULSO</span>
        <span className="zona-goal data">{GOAL_LABEL[profile.goal].toUpperCase()}</span>
      </header>

      {/* HERO — medidor de zona */}
      <section className="zona-hero" aria-labelledby="zona-h">
        <span className="eyebrow">Zona de hoy</span>
        <h1 id="zona-h" className="zona-title">
          Vas a ir<br />
          <span className="hl" style={{ color: z?.color }}>
            {z ? z.label.toLowerCase() : '—'}
          </span>
          .
        </h1>
        <ZoneMeter zone={zone} />
      </section>

      {/* CTA — cambia si ya registraste hoy */}
      {registeredToday ? (
        <div className="zona-done">
          <div>
            <span className="eyebrow">Hoy · registrado</span>
            <span className="zona-done-title">Señal leída · {todayReadiness}/100</span>
          </div>
          <button type="button" className="zona-done-edit" onClick={() => navigate('/registro')}>
            Editar
          </button>
        </div>
      ) : (
        <button type="button" className="zona-cta" onClick={() => navigate('/registro')}>
          <span className="zona-cta-title">Registrar hoy</span>
          <span className="eyebrow" style={{ color: '#0d0f13', opacity: 0.7 }}>Leé tu señal →</span>
        </button>
      )}

      {/* Números de la semana */}
      <section className="zona-stats" aria-label="Tu semana en números">
        <div className="zona-stat">
          <span className="data zona-big">{trainedCount}</span>
          <span className="eyebrow">Entrenos / {profile.training_days_per_week}</span>
        </div>
        <div className="zona-stat">
          <span className="data zona-big">{last ? last.sleep_hours : '—'}<small>h</small></span>
          <span className="eyebrow">Sueño · ayer</span>
        </div>
        <div className="zona-stat">
          <span className="data zona-big">{last ? last.energy_level : '—'}<small>/10</small></span>
          <span className="eyebrow">Energía · ayer</span>
        </div>
      </section>

      {/* Lectura corta — el diferenciador: interpreta, no sólo registra */}
      <p className="zona-read">
        <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>La señal</span>
        Tus mejores entrenos caen tras dormir <strong>+7 h</strong>. El jueves fuiste al 9 con 6.5 h — y la energía lo pagó.
      </p>

      <TabBar active="home" onNavigate={navigate} />
    </div>
  )
}
