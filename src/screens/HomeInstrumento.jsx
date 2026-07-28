import SignalTrace from '../components/SignalTrace.jsx'
import StatTile from '../components/StatTile.jsx'
import TabBar from '../components/TabBar.jsx'
import { GOAL_LABEL } from '../data/mock.js'

// ============================================================
// Home — dirección "Instrumento".
// La app como una lectura de instrumento: calma, precisa. El
// hero es "el trazo" (la señal de la semana). Todo lo demás,
// quieto, para que el trazo sea lo memorable.
// ============================================================

export default function HomeInstrumento({ profile, week, series }) {
  const last = week.lastLogged
  const logged = series.filter((d) => d.readiness != null)
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.readiness, 0) / logged.length) : null

  return (
    <div className="shell shell--inst">
      <header className="inst-head">
        <div>
          <span className="eyebrow">Sábado · Semana 30</span>
          <h1 className="inst-hello">
            Hola, {profile.name}.
          </h1>
        </div>
        <span className="inst-goal">{GOAL_LABEL[profile.goal]}</span>
      </header>

      {/* HERO — la señal de la semana */}
      <section className="inst-signal" aria-labelledby="sig-h">
        <div className="inst-signal-top">
          <div>
            <span className="eyebrow">Tu señal · esta semana</span>
            <h2 id="sig-h" className="inst-read">
              Rendís con la <span className="hl">recuperación al día</span>, no con las horas.
            </h2>
          </div>
          <div className="inst-avg">
            <span className="data inst-avg-num">{avg ?? '—'}</span>
            <span className="eyebrow">disponib.</span>
          </div>
        </div>

        <SignalTrace series={series} />

        <div className="inst-axis" aria-hidden="true">
          {series.map((d) => (
            <span key={d.day} className={`data${d.isToday ? ' is-today' : ''}`}>
              {d.day}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <button className="inst-cta">
        <span>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>Sin registro de hoy</span>
          <span className="inst-cta-title">Registrar hoy</span>
        </span>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      {/* Resumen del último día registrado */}
      <section className="inst-summary" aria-label={`Tu último registro: ${last.day}`}>
        <span className="eyebrow">Último registro · {last.day}</span>
        <div className="inst-tiles">
          <StatTile label="Entreno" value={last.trained ? 'Sí' : 'No'} hint={last.trained ? `Esfuerzo ${last.perceived_effort}/10` : 'Descanso'} />
          <StatTile label="Sueño" value={last.sleep_hours} unit="h" hint={`Calidad ${last.sleep_quality}/10`} />
          <StatTile label="Energía" value={last.energy_level} unit="/10" hint={last.energy_level >= 7 ? 'Alta' : 'Media'} />
        </div>
      </section>

      <TabBar active="home" />
    </div>
  )
}
