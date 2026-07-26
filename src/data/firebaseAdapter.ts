import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type Auth,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { DataStore } from './DataStore'
import type {
  AuthUser,
  ContactMessage,
  SleepSession,
  UserProfile,
} from './types'
import { DEFAULT_PROFILE } from './types'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

/**
 * Adaptador Firebase (Auth + Firestore).
 * Estructura en Firestore:
 *   users/{uid}                       -> perfil (UserProfile)
 *   users/{uid}/sessions/{sessionId}  -> SleepSession
 *   contactMessages/{id}              -> ContactMessage
 */
export class FirebaseAdapter implements DataStore {
  readonly backend = 'firebase' as const
  private app: FirebaseApp
  private auth: Auth
  private db: Firestore

  constructor(config: FirebaseConfig) {
    this.app = initializeApp(config)
    this.auth = getAuth(this.app)
    this.db = getFirestore(this.app)
  }

  onAuthChange(cb: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (u) => {
      cb(
        u
          ? {
              uid: u.uid,
              email: u.email ?? '',
              displayName: u.displayName ?? (u.email ?? '').split('@')[0],
            }
          : null,
      )
    })
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthUser> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password)
    const name = displayName.trim() || email.split('@')[0]
    await updateProfile(cred.user, { displayName: name })
    const user: AuthUser = { uid: cred.user.uid, email, displayName: name }
    await this.saveProfile(user.uid, DEFAULT_PROFILE)
    return user
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password)
    return {
      uid: cred.user.uid,
      email: cred.user.email ?? email,
      displayName: cred.user.displayName ?? email.split('@')[0],
    }
  }

  async signOut(): Promise<void> {
    await fbSignOut(this.auth)
  }

  async getProfile(uid: string): Promise<UserProfile> {
    const snap = await getDoc(doc(this.db, 'users', uid))
    if (!snap.exists()) return DEFAULT_PROFILE
    return { ...DEFAULT_PROFILE, ...(snap.data() as Partial<UserProfile>) }
  }

  async saveProfile(uid: string, profile: UserProfile): Promise<void> {
    await setDoc(doc(this.db, 'users', uid), profile, { merge: true })
  }

  async listSessions(uid: string): Promise<SleepSession[]> {
    const snap = await getDocs(collection(this.db, 'users', uid, 'sessions'))
    const list = snap.docs.map((d) => d.data() as SleepSession)
    list.sort((a, b) => b.start.localeCompare(a.start))
    return list
  }

  async upsertSession(uid: string, session: SleepSession): Promise<void> {
    await setDoc(
      doc(this.db, 'users', uid, 'sessions', session.id),
      session,
    )
  }

  async deleteSession(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'users', uid, 'sessions', id))
  }

  async saveContactMessage(msg: ContactMessage): Promise<void> {
    await setDoc(doc(this.db, 'contactMessages', msg.id), msg)
  }
}
