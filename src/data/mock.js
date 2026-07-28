// ============================================================
// PULSO — Capa de datos MOCK
// Espeja el schema de Supabase (profiles, daily_logs) para que
// la UI se construya contra datos realistas. Cuando conectemos
// Supabase, dataClient.js cambia la fuente sin tocar la UI.
// ============================================================

export const profile = {
  id: 'mock-user',
  name: 'Vale',
  goal: 'ganar_musculo', // ganar_musculo | bajar_grasa | rendimiento | salud_general
  experience_level: 'intermedio', // principiante | intermedio | avanzado
  training_days_per_week: 4,
  plan: 'free', // free | premium
}

export const GOAL_LABEL = {
  ganar_musculo: 'Ganar músculo',
  bajar_grasa: 'Bajar grasa',
  rendimiento: 'Rendimiento',
  salud_general: 'Salud general',
}

// Una semana de registros (lunes -> domingo). Hoy = índice 5 (sábado),
// aún sin registrar, para mostrar el estado "registrá hoy".
export const weekLogs = [
  { day: 'Lun', log_date: '2026-07-20', trained: true, perceived_effort: 8, sleep_hours: 7.5, sleep_quality: 8, energy_level: 7, training_notes: 'Pierna, PR en sentadilla' },
  { day: 'Mar', log_date: '2026-07-21', trained: false, perceived_effort: null, sleep_hours: 6.2, sleep_quality: 5, energy_level: 5, training_notes: '' },
  { day: 'Mié', log_date: '2026-07-22', trained: true, perceived_effort: 7, sleep_hours: 7.8, sleep_quality: 8, energy_level: 8, training_notes: 'Empuje' },
  { day: 'Jue', log_date: '2026-07-23', trained: true, perceived_effort: 9, sleep_hours: 6.5, sleep_quality: 6, energy_level: 6, training_notes: 'Tirón, cansado' },
  { day: 'Vie', log_date: '2026-07-24', trained: false, perceived_effort: null, sleep_hours: 8.1, sleep_quality: 9, energy_level: 8, training_notes: 'Descanso' },
  { day: 'Sáb', log_date: '2026-07-25', trained: null, perceived_effort: null, sleep_hours: null, sleep_quality: null, energy_level: null, training_notes: '', isToday: true },
  { day: 'Dom', log_date: '2026-07-26', trained: null, perceived_effort: null, sleep_hours: null, sleep_quality: null, energy_level: null, training_notes: '', isFuture: true },
]

// ---------- Helpers derivados (la "interpretación") ----------

// Readiness 0..100: mezcla de calidad de sueño, energía y carga (esfuerzo
// alto sin descanso baja la disponibilidad). Devuelve null si no hay datos.
export function readiness(log) {
  if (!log || log.energy_level == null || log.sleep_quality == null) return null
  const sleep = (log.sleep_quality / 10) * 45
  const energy = (log.energy_level / 10) * 45
  const load = log.trained && log.perceived_effort ? (log.perceived_effort / 10) * 10 : 0
  return Math.round(Math.max(0, Math.min(100, sleep + energy + (10 - load))))
}

// Serie de la semana con readiness por día (para "el trazo")
export function weekSeries() {
  return weekLogs.map((l) => ({ ...l, readiness: readiness(l) }))
}

// Zona 1..5 del día a partir de esfuerzo + energía (para el medidor)
export function dayZone(log) {
  if (!log || log.energy_level == null) return null
  const effort = log.trained && log.perceived_effort ? log.perceived_effort : 3
  const raw = (effort * 0.6 + (10 - log.energy_level) * 0.4) / 2
  return Math.max(1, Math.min(5, Math.round(raw)))
}

// Último día con datos completos (para el resumen "de ayer")
export function lastLoggedDay() {
  for (let i = weekLogs.length - 1; i >= 0; i--) {
    if (weekLogs[i].energy_level != null) return weekLogs[i]
  }
  return null
}

export const todayLog = weekLogs.find((l) => l.isToday) ?? null
