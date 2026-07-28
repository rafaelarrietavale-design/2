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

// Semana lunes -> domingo. "Hoy" = TODAY, aún sin registrar.
export const seedWeek = [
  { day: 'Lun', log_date: '2026-07-20', trained: true, perceived_effort: 8, sleep_hours: 7.5, sleep_quality: 8, energy_level: 7, training_notes: 'Pierna, PR en sentadilla' },
  { day: 'Mar', log_date: '2026-07-21', trained: false, perceived_effort: null, sleep_hours: 6.2, sleep_quality: 5, energy_level: 5, training_notes: '' },
  { day: 'Mié', log_date: '2026-07-22', trained: true, perceived_effort: 7, sleep_hours: 7.8, sleep_quality: 8, energy_level: 8, training_notes: 'Empuje' },
  { day: 'Jue', log_date: '2026-07-23', trained: true, perceived_effort: 9, sleep_hours: 6.5, sleep_quality: 6, energy_level: 6, training_notes: 'Tirón, cansado' },
  { day: 'Vie', log_date: '2026-07-24', trained: false, perceived_effort: null, sleep_hours: 8.1, sleep_quality: 9, energy_level: 8, training_notes: 'Descanso' },
  { day: 'Sáb', log_date: '2026-07-25', trained: null, perceived_effort: null, sleep_hours: null, sleep_quality: null, energy_level: null, training_notes: '' },
  { day: 'Dom', log_date: '2026-07-26', trained: null, perceived_effort: null, sleep_hours: null, sleep_quality: null, energy_level: null, training_notes: '' },
]

// ---------- Helpers derivados (la "interpretación") ----------

// ¿Ese día tiene datos completos para leer una señal?
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

// Serie de la semana con readiness por día (marca isToday)
export function weekSeries(logs) {
  return logs.map((l) => ({ ...l, readiness: readiness(l), isToday: l.log_date === TODAY }))
}

// Promedio de readiness de los días registrados
export function weekAvgReadiness(series) {
  const done = series.filter((d) => d.readiness != null)
  return done.length ? Math.round(done.reduce((s, d) => s + d.readiness, 0) / done.length) : null
}

// Zona recomendada para HOY según disponibilidad reciente (1..5):
// más recuperado -> más margen para exigir.
export function recommendedZone(avg) {
  if (avg == null) return null
  if (avg >= 80) return 2
  if (avg >= 62) return 3
  if (avg >= 46) return 4
  return 5
}
