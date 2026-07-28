// ============================================================
// dataClient — única puerta a los datos.
// HOY: estado en memoria + localStorage, sembrado desde mock.
// MAÑANA: implementá estos mismos métodos contra Supabase
// (ver .env.example) sin tocar la UI.
// ============================================================
import { seedProfile, seedWeek, TODAY } from '../data/mock.js'

const KEY = 'pulso-state-v1'
const USE_REMOTE = !!import.meta.env.VITE_SUPABASE_URL

function seed() {
  return { profile: { ...seedProfile }, logs: seedWeek.map((l) => ({ ...l })) }
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
export function getWeek() {
  const logs = state.logs
  const today = logs.find((l) => l.log_date === TODAY) ?? null
  const lastLogged = [...logs].reverse().find((l) => l.energy_level != null) ?? null
  return { logs, today, lastLogged }
}

export function getLog(date) {
  return state.logs.find((l) => l.log_date === date) ?? null
}

export async function saveLog(date, data) {
  if (USE_REMOTE) throw new Error('Supabase no conectado')
  const logs = state.logs.map((l) => (l.log_date === date ? { ...l, ...data } : l))
  state = { ...state, logs }
  persist()
  return getLog(date)
}

// Sólo para la demo: volver al estado semilla (usado por "Reiniciar demo").
export function resetDemo() {
  state = seed()
  persist()
}
