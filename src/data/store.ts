import type { DataStore } from './DataStore'
export { newId } from './DataStore'
import { LocalAdapter } from './localAdapter'
import { FirebaseAdapter, type FirebaseConfig } from './firebaseAdapter'

/** Lee la config de Firebase de las variables de entorno, si está completa. */
function readFirebaseConfig(): FirebaseConfig | null {
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
  const complete = Object.values(cfg).every(
    (v) => typeof v === 'string' && v.length > 0,
  )
  return complete ? (cfg as FirebaseConfig) : null
}

/**
 * Selecciona el backend automáticamente:
 *  - Firebase si hay .env completo.
 *  - Local (localStorage) en caso contrario, para que la app corra sin configurar nada.
 */
function createStore(): DataStore {
  const fbConfig = readFirebaseConfig()
  if (fbConfig) {
    try {
      return new FirebaseAdapter(fbConfig)
    } catch (err) {
      console.error('Firebase falló al iniciar, usando almacenamiento local.', err)
    }
  }
  return new LocalAdapter()
}

/** Instancia única compartida por toda la app. */
export const store: DataStore = createStore()
