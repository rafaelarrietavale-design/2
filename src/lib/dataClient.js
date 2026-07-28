// ============================================================
// dataClient — única puerta a los datos.
// HOY: estado en memoria + localStorage, sembrado desde mock.
// MAÑANA: implementá estos mismos métodos contra Supabase
// (ver .env.example) sin tocar la UI.
// ============================================================
import { seedProfile, seedLogs, TODAY, weekStartISO } from '../data/mock.js'

const KEY = 'pulso-state-v2'
const USE_REMOTE = !!import.meta.env.VITE_SUPABASE_URL

function seed() {
  return { profile: { ...seedProfile }, logs: seedLogs.map((l) => ({ ...l })) }
}

function load() {
  if (typeof localStorage === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : seed()
  } catch {
    return seed()
  }
}

let state = load()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* modo privado / sin storage: seguimos en memoria */
  }
}

// ---------- Perfil ----------
export function getProfile() {
  return state.profile
}

export function hasProfile() {
  return !!state.profile?.onboarded
}

export async function saveProfile(patch) {
  if (USE_REMOTE) throw new Error('Supabase no conectado')
  state = { ...state, profile: { ...state.profile, ...patch, onboarded: true } }
  persist()
  return state.profile
}

// ---------- Registros diarios ----------
const currentWeekStart = weekStartISO(TODAY)

// La semana actual (la que contiene TODAY), ordenada lunes -> domingo.
export function getWeek() {
  const logs = state.logs
    .filter((l) => weekStartISO(l.log_date) === currentWeekStart)
    .sort((a, b) => (a.log_date < b.log_date ? -1 : 1))
  const today = logs.find((l) => l.log_date === TODAY) ?? null
  const lastLogged =
    [...logs].reverse().find((l) => l.log_date <= TODAY && l.energy_level != null) ?? null
  return { logs, today, lastLogged }
}

// Todos los registros (para el historial)
export function getAllLogs() {
  return state.logs
}

export function getLog(date) {
  return state.logs.find((l) => l.log_date === date) ?? null
}

export async function saveLog(date, data) {
  if (USE_REMOTE) throw new Error('Supabase no conectado')
  const exists = state.logs.some((l) => l.log_date === date)
  const logs = exists
    ? state.logs.map((l) => (l.log_date === date ? { ...l, ...data } : l))
    : [...state.logs, { log_date: date, training_notes: '', ...data }]
  state = { ...state, logs }
  persist()
  return getLog(date)
}

// Sólo para la demo: volver al estado semilla.
export function resetDemo() {
  state = seed()
  persist()
}
