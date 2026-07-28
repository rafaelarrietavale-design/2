import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar.jsx'
import { getProfile, getWeek, getAllLogs, isPremium } from '../lib/dataClient.js'
import { generateInsight } from '../lib/insight.js'
import { weekStartISO, shortDate, TODAY, groupByWeek } from '../data/mock.js'

// ============================================================
// Insight semanal — pantalla-reporte. Toma los daily_logs de la
// semana y devuelve 1-2 observaciones concretas y accionables.
// Hoy el análisis es por reglas (mock); al conectar la API de
// Claude, sólo cambia generateInsight() por la llamada real.
// ============================================================

export default function InsightSemanal() {
  const navigate = useNavigate()
  const profile = getProfile()
  const week = getWeek()
  const insight = generateInsight(profile, week.logs)
  const s = insight.stats
  const premium = isPremium()

  // Comparativa entre las dos últimas semanas con datos
  const weeks = groupByWeek(getAllLogs())
  const [cur, prev] = weeks
  const delta = cur && prev && cur.avgReadiness != null && prev.avgReadiness != null
    ? cur.avgReadiness - prev.avgReadiness
    : null

  return (
    <div className="shell shell--zona ins">
      <header className="reg-head">
        <button type="button" className="reg-close" aria-label="Volver" onClick={() => navigate('/')}>
          ←
        </button>
        <div>
          <span className="eyebrow">Insight · Semana del {shortDate(weekStartISO(TODAY))}</span>
          <h1 className="reg-title">Tu reporte</h1>
        </div>
      </header>

      {/* Portada del reporte */}
      <section className="ins-hero">
        <span className="ins-kicker eyebrow">La lectura de la semana</span>
        <h2 className="ins-headline">{insight.headline}</h2>
        <p className="ins-lead">{insight.lead}</p>
      </section>

      {/* Números de respaldo */}
      <section className="ins-stats" aria-label="Resumen de la semana">
        <div className="ins-stat">
          <span className="data ins-num">{s.trainedCount}<small>/{s.goalDays}</small></span>
          <span className="eyebrow">Entrenos</span>
        </div>
        <div className="ins-stat">
          <span className="data ins-num">{s.avgSleep}<small>h</small></span>
          <span className="eyebrow">Sueño prom.</span>
        </div>
        <div className="ins-stat">
          <span className="data ins-num">{s.avgReadiness}</span>
          <span className="eyebrow">Disponib.</span>
        </div>
      </section>

      {/* Observaciones */}
      <section className="ins-obs" aria-label="Observaciones">
        {insight.observations.map((o, i) => (
          <article key={i} className="ins-card">
            <span className="ins-tag eyebrow">{o.tag}</span>
            <p className="ins-text">{o.text}</p>
          </article>
        ))}
        {insight.observations.length === 0 && (
          <article className="ins-card">
            <p className="ins-text">Registra algunos días más de la semana y tu reporte empieza a leer patrones.</p>
          </article>
        )}
      </section>

      {/* Comparativa mes a mes — feature premium */}
      {premium ? (
        <section className="ins-compare" aria-label="Comparativa entre semanas">
          <span className="eyebrow">Vs. semana anterior</span>
          <div className="ins-compare-row">
            <span className="data ins-compare-num">{cur?.avgReadiness ?? '—'}</span>
            {delta != null && (
              <span className={`ins-delta data${delta >= 0 ? ' up' : ' down'}`}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
              </span>
            )}
            <span className="ins-compare-prev data">antes {prev?.avgReadiness ?? '—'}</span>
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="ins-locked"
          onClick={() => navigate('/premium')}
          aria-label="Desbloquear comparativa mes a mes con Premium"
        >
          <span className="ins-locked-blur data" aria-hidden="true">
            72 ▲ 4 · antes 68
          </span>
          <span className="ins-locked-over">
            <span className="ins-lock" aria-hidden="true">🔒</span>
            <span>
              <strong>Comparativa mes a mes</strong>
              <span className="ins-locked-cta data">Desbloquear con Premium →</span>
            </span>
          </span>
        </button>
      )}

      {/* Nota de origen */}
      <div className="ins-foot">
        <p className="ins-origin">
          Análisis por reglas sobre tus registros.{' '}
          {!premium && (
            <>El reporte con IA, más profundo, llega con <strong>Pulso Premium</strong>.</>
          )}
        </p>
      </div>

      <TabBar active="home" onNavigate={navigate} />
    </div>
  )
}
