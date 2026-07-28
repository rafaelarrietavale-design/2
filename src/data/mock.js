// ============================================================
// PULSO — datos semilla (mock) + helpers puros
// Espeja el schema de Supabase (profiles, daily_logs). El estado
// vivo lo maneja dataClient.js; acá va lo estático y las funciones.
// ============================================================

export const TODAY = '2026-07-25' // sábado (demo)

export const seedProfile = {
  id: 'mock-user',
  name: 'Vale',
  goal: 'ganar_musculo', // ganar_musculo | bajar_grasa | rendimiento | salud_general
  experience_level: 'intermedio', // principiante | intermedio | avanzado
  training_days_per_week: 4,
  plan: 'free', // free | premium
  onboarded: true,
}

export const GOAL_LABEL = {
  ganar_musculo: 'Ganar músculo',
  bajar_grasa: 'Bajar grasa',
  rendimiento: 'Rendimiento',
  salud_general: 'Salud general',
}

export const EXPERIENCE_LABEL = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

// Registros diarios de varias semanas. "Hoy" = TODAY, aún sin registrar.
// (Sin campo `day`: se deriva de log_date, como en el schema real.)
export const seedLogs = [
  // --- Semana actual (Lun 20 – Dom 26) ---
  { log_date: '2026-07-20', trained: true, perceived_effort: 8, sleep_hours: 7.5, sleep_quality: 8, energy_level: 7, training_notes: 'Pierna, PR en sentadilla' },
  { log_date: '2026-07-21', trained: false, perceived_effort: null, sleep_hours: 6.2, sleep_quality: 5, energy_level: 5, training_notes: '' },
  { log_date: '2026-07-22', trained: true, perceived_effort: 7, sleep_hours: 7.8, sleep_quality: 8, energy_level: 8, training_notes: 'Empuje' },
  { log_date: '2026-07-23', trained: true, perceived_effort: 9, sleep_hours: 6.5, sleep_quality: 6, energy_level: 6, training_notes: 'Tirón, cansado' },
  { log_date: '2026-07-24', trained: false, perceived_effort: null, sleep_hours: 8.1, sleep_quality: 9, energy_level: 8, training_notes: 'Descanso' },
  { log_date: '2026-07-25', trained: null, perceived_effort: null, sleep_hours: null, sleep_quality: null, energy_level: null, training_notes: '' },
  { log_date: '2026-07-26', trained: null, perceived_effort: null, sleep_hours: null, sleep_quality: null, energy_level: null, training_notes: '' },

  // --- Semana previa (Lun 13 – Dom 19) ---
  { log_date: '2026-07-13', trained: true, perceived_effort: 7, sleep_hours: 7.2, sleep_quality: 7, energy_level: 7, training_notes: 'Full body' },
  { log_date: '2026-07-14', trained: false, perceived_effort: null, sleep_hours: 6.8, sleep_quality: 6, energy_level: 6, training_notes: '' },
  { log_date: '2026-07-15', trained: true, perceived_effort: 8, sleep_hours: 7.6, sleep_quality: 8, energy_level: 8, training_notes: 'Empuje sólido' },
  { log_date: '2026-07-16', trained: true, perceived_effort: 6, sleep_hours: 5.9, sleep_quality: 5, energy_level: 5, training_notes: 'Corto, poco dormido' },
  { log_date: '2026-07-17', trained: false, perceived_effort: null, sleep_hours: 8.4, sleep_quality: 9, energy_level: 8, training_notes: 'Descanso' },
  { log_date: '2026-07-18', trained: true, perceived_effort: 8, sleep_hours: 7.9, sleep_quality: 8, energy_level: 8, training_notes: 'Pierna' },
  { log_date: '2026-07-19', trained: false, perceived_effort: null, sleep_hours: 7.1, sleep_quality: 7, energy_level: 6, training_notes: '' },

  // --- Dos semanas atrás (Lun 6 – Dom 12) ---
  { log_date: '2026-07-06', trained: true, perceived_effort: 9, sleep_hours: 6.4, sleep_quality: 6, energy_level: 6, training_notes: 'Intenso' },
  { log_date: '2026-07-07', trained: false, perceived_effort: null, sleep_hours: 6.1, sleep_quality: 5, energy_level: 4, training_notes: 'Cansado' },
  { log_date: '2026-07-08', trained: true, perceived_effort: 7, sleep_hours: 7.0, sleep_quality: 7, energy_level: 7, training_notes: 'Empuje' },
  { log_date: '2026-07-09', trained: false, perceived_effort: null, sleep_hours: 7.7, sleep_quality: 8, energy_level: 7, training_notes: '' },
  { log_date: '2026-07-10', trained: true, perceived_effort: 8, sleep_hours: 7.3, sleep_quality: 7, energy_level: 7, training_notes: 'Tirón' },
  { log_date: '2026-07-11', trained: false, perceived_effort: null, sleep_hours: 6.6, sleep_quality: 6, energy_level: 6, training_notes: '' },
  { log_date: '2026-07-12', trained: false, perceived_effort: null, sleep_hours: 8.0, sleep_quality: 8, energy_level: 8, training_notes: 'Descanso activo' },
]

// ---------- Helpers de fecha ----------
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function parts(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { y, m, d, date: new Date(Date.UTC(y, m - 1, d)) }
}
export function dayLabel(dateStr) {
  return DOW[parts(dateStr).date.getUTCDay()]
}
export function shortDate(dateStr) {
  const { d, m } = parts(dateStr)
  return `${d} ${MONTH[m - 1]}`
}
// Lunes ISO de la semana que contiene dateStr
export function weekStartISO(dateStr) {
  const { date } = parts(dateStr)
  const dow = (date.getUTCDay() + 6) % 7 // 0 = lunes
  date.setUTCDate(date.getUTCDate() - dow)
  return date.toISOString().slice(0, 10)
}

// ---------- Helpers derivados (la "interpretación") ----------

export function isLogged(log) {
  return !!log && log.energy_level != null && log.sleep_quality != null
}

// Readiness 0..100: mezcla de calidad de sueño, energía y carga.
export function readiness(log) {
  if (!isLogged(log)) return null
  const sleep = (log.sleep_quality / 10) * 45
  const energy = (log.energy_level / 10) * 45
  const load = log.trained && log.perceived_effort ? (log.perceived_effort / 10) * 10 : 0
  return Math.round(Math.max(0, Math.min(100, sleep + energy + (10 - load))))
}

// Serie de una semana (logs) con readiness + isToday por día
export function weekSeries(logs) {
  return logs.map((l) => ({ ...l, readiness: readiness(l), isToday: l.log_date === TODAY }))
}

export function weekAvgReadiness(series) {
  const done = series.filter((d) => d.readiness != null)
  return done.length ? Math.round(done.reduce((s, d) => s + d.readiness, 0) / done.length) : null
}

// Zona recomendada para HOY según disponibilidad reciente (1..5)
export function recommendedZone(avg) {
  if (avg == null) return null
  if (avg >= 80) return 2
  if (avg >= 62) return 3
  if (avg >= 46) return 4
  return 5
}

// Agrupa logs (con datos) por semana, orden descendente. Cada grupo:
// { weekStart, label, logs[], trainedCount, avgReadiness }
export function groupByWeek(logs) {
  const map = new Map()
  for (const l of logs) {
    if (!isLogged(l)) continue
    const ws = weekStartISO(l.log_date)
    if (!map.has(ws)) map.set(ws, [])
    map.get(ws).push(l)
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([weekStart, weekLogs]) => {
      const sorted = [...weekLogs].sort((a, b) => (a.log_date < b.log_date ? -1 : 1))
      const series = weekSeries(sorted)
      return {
        weekStart,
        label: `Semana del ${shortDate(weekStart)}`,
        logs: sorted,
        trainedCount: sorted.filter((l) => l.trained === true).length,
        avgReadiness: weekAvgReadiness(series),
      }
    })
}
