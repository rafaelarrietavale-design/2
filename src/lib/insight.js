// ============================================================
// insight — genera el "insight semanal".
// HOY: reglas locales sobre los daily_logs (simulado, sin costo).
// MAÑANA: reemplazar generateInsight() por una llamada a Claude
// usando INSIGHT_SYSTEM_PROMPT + buildInsightPayload() desde una
// edge function (la ANTHROPIC_API_KEY nunca va al cliente).
// ============================================================
import { isLogged, readiness, dayLabel, GOAL_LABEL } from '../data/mock.js'

// Prompt base (de CLAUDE.md) — referencia para el wiring real.
export const INSIGHT_SYSTEM_PROMPT =
  'Sos un asistente fitness que analiza datos semanales de un usuario. ' +
  'Dado este JSON de registros diarios (entrenamiento, sueño, energía), generá ' +
  '1-2 insights breves, concretos y accionables sobre patrones que notes. ' +
  'Tono directo y motivador, sin sonar clínico.'

// Payload que se le mandaría a Claude (misma forma para el mock y el real).
export function buildInsightPayload(profile, weekLogs) {
  return {
    goal: profile.goal,
    experience_level: profile.experience_level,
    training_days_per_week: profile.training_days_per_week,
    logs: weekLogs
      .filter(isLogged)
      .map((l) => ({
        date: l.log_date,
        trained: l.trained,
        perceived_effort: l.perceived_effort,
        sleep_hours: l.sleep_hours,
        sleep_quality: l.sleep_quality,
        energy_level: l.energy_level,
      })),
  }
}

const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null)
const r1 = (n) => Math.round(n * 10) / 10

// Genera el insight (versión por reglas).
export function generateInsight(profile, weekLogs) {
  const logged = weekLogs.filter(isLogged)
  const trained = logged.filter((l) => l.trained === true)

  const stats = {
    daysLogged: logged.length,
    trainedCount: trained.length,
    goalDays: profile.training_days_per_week,
    avgSleep: r1(avg(logged.map((l) => l.sleep_hours)) ?? 0),
    avgEnergy: Math.round(avg(logged.map((l) => l.energy_level)) ?? 0),
    avgReadiness: Math.round(avg(logged.map((l) => readiness(l))) ?? 0),
  }

  if (logged.length < 2) {
    return {
      headline: 'Todavía no hay señal suficiente.',
      lead: 'Registra un par de días más y esta semana empieza a hablar.',
      observations: [],
      stats,
      generatedBy: 'reglas',
    }
  }

  const observations = []

  // 1) Sueño -> energía
  const goodSleep = logged.filter((l) => l.sleep_hours >= 7 && l.sleep_quality >= 7)
  const poorSleep = logged.filter((l) => l.sleep_hours < 7)
  const eGood = avg(goodSleep.map((l) => l.energy_level))
  const ePoor = avg(poorSleep.map((l) => l.energy_level))
  if (eGood != null && ePoor != null && eGood - ePoor >= 1) {
    observations.push({
      tag: 'Sueño → energía',
      text: `Cuando duermes 7 h o más y con buena calidad, tu energía promedia ${r1(eGood)}/10; cuando bajas de 7 h, cae a ${r1(ePoor)}/10. El sueño te mueve la aguja más que ninguna otra cosa.`,
    })
  }

  // 2) Sesión exigente con poco sueño
  const hardLowSleep = trained.find((l) => l.perceived_effort >= 8 && l.sleep_hours < 7)
  if (hardLowSleep) {
    observations.push({
      tag: 'Carga vs. recuperación',
      text: `El ${dayLabel(hardLowSleep.log_date).toLowerCase()} fuiste al ${hardLowSleep.perceived_effort}/10 con solo ${r1(hardLowSleep.sleep_hours)} h de sueño. Reserva las sesiones más pesadas para después de una buena noche y las rendirás mejor.`,
    })
  }

  // 3) Frecuencia vs. objetivo
  if (observations.length < 2) {
    if (stats.trainedCount < stats.goalDays) {
      observations.push({
        tag: 'Constancia',
        text: `Entrenaste ${stats.trainedCount} de tus ${stats.goalDays} días. Para ${GOAL_LABEL[profile.goal].toLowerCase()}, sumar una sesión más por semana es lo que acelera el progreso.`,
      })
    } else {
      observations.push({
        tag: 'Constancia',
        text: `Cumpliste tus ${stats.goalDays} días de entrenamiento. Constancia sostenida — así se construye el resultado que buscas.`,
      })
    }
  }

  // Headline según la señal más fuerte
  let headline = 'Semana sólida y pareja.'
  let lead = 'Sin altibajos grandes: buena base para apretar la próxima.'
  if (observations[0]?.tag === 'Sueño → energía') {
    headline = 'Tu semana la definió el sueño.'
    lead = 'La energía siguió a las horas de descanso, no al revés.'
  } else if (stats.trainedCount < stats.goalDays) {
    headline = 'Buena base, falta volumen.'
    lead = 'La calidad estuvo; ahora es cuestión de sumar frecuencia.'
  }

  return { headline, lead, observations: observations.slice(0, 2), stats, generatedBy: 'reglas' }
}
