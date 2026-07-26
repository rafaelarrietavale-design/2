// Tipos centrales de la app.

export type SessionKind = 'night' | 'nap'

export interface SleepSession {
  id: string
  /** Momento exacto en que empezó a dormir (ISO 8601). */
  start: string
  /** Momento exacto en que se despertó (ISO 8601). */
  end: string
  /** Calidad percibida del 1 (mala) al 5 (excelente). 0 = sin calificar. */
  quality: number
  /** Notas libres. */
  notes: string
  /** Etiquetas: café, ejercicio, pantalla, alcohol, estrés... */
  tags: string[]
  /** Sueño nocturno o siesta. */
  kind: SessionKind
}

/** Sesión en curso (aún durmiendo): solo tenemos el inicio. */
export interface OngoingSession {
  start: string
  kind: SessionKind
}

export type ThemeName = 'aurora' | 'lavender' | 'midnight'

export interface UserProfile {
  /** Objetivo de sueño en minutos (p. ej. 480 = 8 h). */
  goalMinutes: number
  /** Hora objetivo de acostarse "HH:mm" para el recordatorio. */
  bedtime: string
  /** Recordatorio de hora de dormir activado. */
  reminderEnabled: boolean
  /** Tema visual (premium desbloquea todos). */
  theme: ThemeName
  /** Suscripción premium activa. */
  premium: boolean
  /** Fecha ISO de renovación simulada de la suscripción. */
  premiumRenewsAt?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

export interface AuthUser {
  uid: string
  email: string
  displayName: string
}

export const DEFAULT_PROFILE: UserProfile = {
  goalMinutes: 480,
  bedtime: '23:00',
  reminderEnabled: false,
  theme: 'aurora',
  premium: false,
}

export const AVAILABLE_TAGS = [
  'café',
  'ejercicio',
  'pantalla',
  'alcohol',
  'estrés',
  'siesta previa',
  'comida tarde',
  'meditación',
] as const
