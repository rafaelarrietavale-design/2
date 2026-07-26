import type { DataStore } from './DataStore'
import type {
  AuthUser,
  ContactMessage,
  SleepSession,
  UserProfile,
} from './types'
import { DEFAULT_PROFILE } from './types'

/**
 * Adaptador local: auth simulada + persistencia en localStorage.
 * Permite ejecutar la app al instante, sin credenciales ni servidor.
 * Las contraseñas se guardan solo para simular el login; NO usar en producción.
 */

const KEY = {
  users: 'descansa.users',
  session: 'descansa.currentUser',
  profile: (uid: string) => `descansa.profile.${uid}`,
  sessions: (uid: string) => `descansa.sessions.${uid}`,
  contact: 'descansa.contact',
}

interface StoredUser extends AuthUser {
  password: string
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function delay<T>(value: T): Promise<T> {
  // Pequeño retardo para imitar una llamada de red.
  return new Promise((resolve) => setTimeout(() => resolve(value), 120))
}

export class LocalAdapter implements DataStore {
  readonly backend = 'local' as const
  private listeners = new Set<(u: AuthUser | null) => void>()

  private currentUser(): AuthUser | null {
    return read<AuthUser | null>(KEY.session, null)
  }

  private emit() {
    const user = this.currentUser()
    this.listeners.forEach((cb) => cb(user))
  }

  onAuthChange(cb: (user: AuthUser | null) => void): () => void {
    this.listeners.add(cb)
    // Emite el estado inicial de forma asíncrona.
    setTimeout(() => cb(this.currentUser()), 0)
    return () => this.listeners.delete(cb)
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthUser> {
    const users = read<StoredUser[]>(KEY.users, [])
    const normalized = email.trim().toLowerCase()
    if (users.some((u) => u.email === normalized)) {
      throw new Error('Ya existe una cuenta con ese correo.')
    }
    const user: StoredUser = {
      uid: 'local_' + Math.random().toString(36).slice(2, 10),
      email: normalized,
      displayName: displayName.trim() || normalized.split('@')[0],
      password,
    }
    users.push(user)
    write(KEY.users, users)
    const authUser: AuthUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    }
    write(KEY.session, authUser)
    // Perfil inicial.
    write(KEY.profile(user.uid), DEFAULT_PROFILE)
    this.emit()
    return delay(authUser)
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const users = read<StoredUser[]>(KEY.users, [])
    const normalized = email.trim().toLowerCase()
    const found = users.find((u) => u.email === normalized)
    if (!found || found.password !== password) {
      throw new Error('Correo o contraseña incorrectos.')
    }
    const authUser: AuthUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName,
    }
    write(KEY.session, authUser)
    this.emit()
    return delay(authUser)
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(KEY.session)
    this.emit()
    return delay(undefined)
  }

  async getProfile(uid: string): Promise<UserProfile> {
    return delay(read<UserProfile>(KEY.profile(uid), DEFAULT_PROFILE))
  }

  async saveProfile(uid: string, profile: UserProfile): Promise<void> {
    write(KEY.profile(uid), profile)
    return delay(undefined)
  }

  async listSessions(uid: string): Promise<SleepSession[]> {
    const list = read<SleepSession[]>(KEY.sessions(uid), [])
    list.sort((a, b) => b.start.localeCompare(a.start))
    return delay(list)
  }

  async upsertSession(uid: string, session: SleepSession): Promise<void> {
    const list = read<SleepSession[]>(KEY.sessions(uid), [])
    const idx = list.findIndex((s) => s.id === session.id)
    if (idx >= 0) list[idx] = session
    else list.push(session)
    write(KEY.sessions(uid), list)
    return delay(undefined)
  }

  async deleteSession(uid: string, id: string): Promise<void> {
    const list = read<SleepSession[]>(KEY.sessions(uid), []).filter(
      (s) => s.id !== id,
    )
    write(KEY.sessions(uid), list)
    return delay(undefined)
  }

  async saveContactMessage(msg: ContactMessage): Promise<void> {
    const list = read<ContactMessage[]>(KEY.contact, [])
    list.push(msg)
    write(KEY.contact, list)
    return delay(undefined)
  }
}
