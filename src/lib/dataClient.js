// ============================================================
// dataClient — única puerta a los datos.
// HOY: lee de la capa mock. MAÑANA: implementá estos mismos
// métodos contra Supabase (ver .env.example) sin tocar la UI.
// ============================================================
import { profile, weekLogs, todayLog, lastLoggedDay } from '../data/mock.js'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL

export async function getProfile() {
  if (USE_MOCK) return profile
  // TODO(supabase): select * from profiles where id = auth.uid()
  throw new Error('Supabase no conectado: falta VITE_SUPABASE_URL')
}

export async function getWeek() {
  if (USE_MOCK) return { logs: weekLogs, today: todayLog, lastLogged: lastLoggedDay() }
  // TODO(supabase): select * from daily_logs where user_id = auth.uid() order by log_date
  throw new Error('Supabase no conectado: falta VITE_SUPABASE_URL')
}
