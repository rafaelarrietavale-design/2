import ZoneMeter, { ZONES } from '../components/ZoneMeter.jsx'
import TabBar from '../components/TabBar.jsx'
import { GOAL_LABEL } from '../data/mock.js'

// ============================================================
// Home — dirección "Zona / Heat".
// Adrenalina y foco: superficie oscura de "training floor",
// números grandes en mono, y el medidor de zona del día como
// firma. Energía sin ruido.
// ============================================================

// Zona recomendada para HOY a partir de la disponibilidad reciente:
// más recuperado -> más margen para exigir. Devuelve 1..5.
function recommendedZone(avg) {
  if (avg == null) return null
  if (avg >= 80) return 2
  if (avg >= 62) return 3
  if (avg >= 46) return 4
  return 5
}

export default function HomeZona({ profile, week, series }) {
  const last = week.lastLogged
  const logged = series.filter((d) => d.readiness != null)
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.readiness, 0) / logged.length) : null
  const zone = recommendedZone(avg)
  const z = ZONES.find((x) => x.z === zone)
  const trainedCount = series.filter((d) => d.trained === true).length

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

      {/* CTA grande */}
      <button className="zona-cta">
        <span className="zona-cta-title">Registrar hoy</span>
        <span className="eyebrow" style={{ color: '#0d0f13', opacity: 0.7 }}>Leé tu señal →</span>
      </button>

      {/* Números de la semana */}
      <section className="zona-stats" aria-label="Tu semana en números">
        <div className="zona-stat">
          <span className="data zona-big">{trainedCount}</span>
          <span className="eyebrow">Entrenos / {profile.training_days_per_week}</span>
        </div>
        <div className="zona-stat">
          <span className="data zona-big">{last.sleep_hours}<small>h</small></span>
          <span className="eyebrow">Sueño · ayer</span>
        </div>
        <div className="zona-stat">
          <span className="data zona-big">{last.energy_level}<small>/10</small></span>
          <span className="eyebrow">Energía · ayer</span>
        </div>
      </section>

      {/* Lectura corta — el diferenciador: interpreta, no sólo registra */}
      <p className="zona-read">
        <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>La señal</span>
        Tus mejores entrenos caen tras dormir <strong>+7 h</strong>. El jueves fuiste al 9 con 6.5 h — y la energía lo pagó.
      </p>

      <TabBar active="home" />
    </div>
  )
}
