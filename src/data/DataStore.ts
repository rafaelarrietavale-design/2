import type {
  AuthUser,
  ContactMessage,
  SleepSession,
  UserProfile,
} from './types'

/**
 * Interfaz única que consume toda la app. Dos implementaciones:
 *  - LocalAdapter: localStorage + auth simulada (por defecto, sin credenciales).
 *  - FirebaseAdapter: Firebase Auth + Firestore (si hay .env configurado).
 */
export interface DataStore {
  /** Nombre del backend activo, para mostrarlo en Ajustes. */
  readonly backend: 'local' | 'firebase'

  // --- Autenticación ---
  /** Suscribe a cambios de sesión. Devuelve función para desuscribirse. */
  onAuthChange(cb: (user: AuthUser | null) => void): () => void
  signUp(email: string, password: string, displayName: string): Promise<AuthUser>
  signIn(email: string, password: string): Promise<AuthUser>
  signOut(): Promise<void>

  // --- Perfil ---
  getProfile(uid: string): Promise<UserProfile>
  saveProfile(uid: string, profile: UserProfile): Promise<void>

  // --- Sesiones de sueño ---
  listSessions(uid: string): Promise<SleepSession[]>
  upsertSession(uid: string, session: SleepSession): Promise<void>
  deleteSession(uid: string, id: string): Promise<void>

  // --- Contacto ---
  saveContactMessage(msg: ContactMessage): Promise<void>
}

/** Genera un id único simple sin dependencias externas. */
export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}
