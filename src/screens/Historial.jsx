import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar.jsx'
import Logo from '../components/Logo.jsx'
import { getAllLogs } from '../lib/dataClient.js'
import { groupByWeek, dayLabel, shortDate, readiness } from '../data/mock.js'

// ============================================================
// Historial — registros pasados, agrupados por semana.
// Cada semana muestra su resumen (entrenos + disponibilidad) y
// el detalle día por día, con la lectura de readiness a color.
// ============================================================

function readinessColor(r) {
  if (r == null) return 'var(--muted)'
  if (r >= 75) return 'var(--steady)'
  if (r >= 60) return 'var(--z3)'
  if (r >= 45) return 'var(--z4)'
  return 'var(--z5)'
}

export default function Historial() {
  const navigate = useNavigate()
  const weeks = groupByWeek(getAllLogs())

  return (
    <div className="shell shell--zona">
      <header className="zona-head">
        <Logo />
        <span className="zona-goal data">HISTORIAL</span>
      </header>

      {weeks.map((w) => (
        <section key={w.weekStart} className="hist-week" aria-label={w.label}>
          <div className="hist-week-head">
            <h2 className="hist-week-title">{w.label}</h2>
            <div className="hist-week-meta">
              <span className="data">{w.trainedCount} entrenos</span>
              <span className="hist-pill data" style={{ color: readinessColor(w.avgReadiness) }}>
                {w.avgReadiness}
              </span>
            </div>
          </div>

          <div className="hist-days">
            {w.logs.map((l) => {
              const r = readiness(l)
              return (
                <div key={l.log_date} className="hist-row">
                  <div className="hist-day">
                    <span className="hist-dow">{dayLabel(l.log_date)}</span>
                    <span className="hist-date data">{shortDate(l.log_date)}</span>
                  </div>
                  <div className="hist-tags">
                    <span className={`hist-chip${l.trained ? ' hist-chip--on' : ''}`}>
                      {l.trained ? `Entrenó · ${l.perceived_effort}` : 'Descanso'}
                    </span>
                    <span className="hist-metric data">{l.sleep_hours}h</span>
                    <span className="hist-metric data">⚡{l.energy_level}</span>
                  </div>
                  <span className="hist-readiness data" style={{ color: readinessColor(r) }}>
                    {r}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <TabBar active="history" onNavigate={navigate} />
    </div>
  )
}
