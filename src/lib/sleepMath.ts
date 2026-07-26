import type { SleepSession } from '../data/types'

/** Milisegundos entre inicio y fin. Maneja cruce de medianoche porque usa timestamps completos. */
export function durationMs(session: Pick<SleepSession, 'start' | 'end'>): number {
  return Math.max(0, new Date(session.end).getTime() - new Date(session.start).getTime())
}

/** Duración en minutos (entero, redondeado). */
export function durationMinutes(session: Pick<SleepSession, 'start' | 'end'>): number {
  return Math.round(durationMs(session) / 60000)
}

/** Formatea minutos como "7h 32min" (horas exactas). */
export function formatHm(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '-' : ''
  const m = Math.abs(Math.round(totalMinutes))
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${sign}${min}min`
  if (min === 0) return `${sign}${h}h`
  return `${sign}${h}h ${min}min`
}

/** Formatea una duración con horas decimales, p. ej. "7,5 h". */
export function formatDecimalHours(totalMinutes: number): string {
  return (totalMinutes / 60).toFixed(1).replace('.', ',') + ' h'
}

/** Formatea un cronómetro en vivo HH:MM:SS a partir de milisegundos. */
export function formatClock(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/** Hora local "HH:mm" de un ISO. */
export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "lun 14 jul" de un ISO. */
export function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Minutos desde medianoche de una hora local (para promediar horas de acostarse/despertar). */
export function minutesSinceMidnight(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * Promedia horas del día tratándolas como ángulos (circular), para que 23:30 y 00:30
 * promedien en 00:00 y no en 12:00. Devuelve minutos desde medianoche.
 */
export function averageTimeOfDay(isos: string[]): number | null {
  if (isos.length === 0) return null
  let sumSin = 0
  let sumCos = 0
  for (const iso of isos) {
    const mins = minutesSinceMidnight(iso)
    const angle = (mins / 1440) * 2 * Math.PI
    sumSin += Math.sin(angle)
    sumCos += Math.cos(angle)
  }
  let angle = Math.atan2(sumSin / isos.length, sumCos / isos.length)
  if (angle < 0) angle += 2 * Math.PI
  return Math.round((angle / (2 * Math.PI)) * 1440) % 1440
}

/** Formatea minutos-desde-medianoche como "23:15". */
export function formatMinutesOfDay(mins: number | null): string {
  if (mins == null) return '--:--'
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}`
}

export interface DailyTotal {
  /** Clave de día "YYYY-MM-DD" (según la hora de despertar). */
  day: string
  minutes: number
}

/** Clave de día local a partir de un ISO. */
export function dayKey(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Agrupa el sueño por día (asignado al día en que se despierta) sumando siestas y noche.
 * Devuelve los últimos `days` días, incluidos los días sin datos (minutes = 0).
 */
export function dailyTotals(sessions: SleepSession[], days: number): DailyTotal[] {
  const totals = new Map<string, number>()
  for (const s of sessions) {
    const key = dayKey(s.end)
    totals.set(key, (totals.get(key) ?? 0) + durationMinutes(s))
  }
  const out: DailyTotal[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const pad = (n: number) => n.toString().padStart(2, '0')
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    out.push({ day: key, minutes: totals.get(key) ?? 0 })
  }
  return out
}

/** Media de minutos por noche (solo días con registro) en los últimos `days` días. */
export function averagePerNight(sessions: SleepSession[], days: number): number {
  const totals = dailyTotals(sessions, days).filter((t) => t.minutes > 0)
  if (totals.length === 0) return 0
  return Math.round(totals.reduce((a, t) => a + t.minutes, 0) / totals.length)
}

/**
 * Deuda de sueño acumulada (minutos) en los últimos `days` días respecto al objetivo diario.
 * Positivo = duermes menos del objetivo. Solo cuenta días con algún registro para no
 * penalizar días sin datos.
 */
export function sleepDebt(
  sessions: SleepSession[],
  goalMinutes: number,
  days: number,
): number {
  const totals = dailyTotals(sessions, days).filter((t) => t.minutes > 0)
  return totals.reduce((debt, t) => debt + (goalMinutes - t.minutes), 0)
}

/**
 * Puntuación de consistencia 0-100: qué tan regular es la hora de acostarse.
 * Se basa en la desviación circular de las horas de inicio de las sesiones nocturnas.
 * 0 min de desviación -> 100; >=180 min -> 0.
 */
export function consistencyScore(sessions: SleepSession[], days: number): number {
  const cutoff = Date.now() - days * 86400000
  const nights = sessions.filter(
    (s) => s.kind === 'night' && new Date(s.start).getTime() >= cutoff,
  )
  if (nights.length < 2) return 0
  const avg = averageTimeOfDay(nights.map((s) => s.start))
  if (avg == null) return 0
  // Desviación circular media en minutos.
  let sum = 0
  for (const s of nights) {
    const mins = minutesSinceMidnight(s.start)
    let diff = Math.abs(mins - avg)
    if (diff > 720) diff = 1440 - diff // distancia circular
    sum += diff
  }
  const meanDev = sum / nights.length
  const score = Math.max(0, 100 - (meanDev / 180) * 100)
  return Math.round(score)
}

/** Genera un CSV del historial (para exportar, función premium). */
export function sessionsToCsv(sessions: SleepSession[]): string {
  const header = [
    'inicio',
    'fin',
    'duracion_min',
    'duracion',
    'tipo',
    'calidad',
    'etiquetas',
    'notas',
  ]
  const rows = sessions.map((s) => [
    s.start,
    s.end,
    String(durationMinutes(s)),
    formatHm(durationMinutes(s)),
    s.kind,
    String(s.quality),
    s.tags.join('|'),
    s.notes.replace(/[\r\n]+/g, ' ').replace(/"/g, "'"),
  ])
  return [header, ...rows]
    .map((r) => r.map((cell) => `"${cell}"`).join(','))
    .join('\n')
}
