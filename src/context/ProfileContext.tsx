import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { store } from '../data/store'
import { DEFAULT_PROFILE, type UserProfile } from '../data/types'
import { useAuth } from './AuthContext'
import {
  clearBedtimeReminder,
  requestNotificationPermission,
  scheduleBedtimeReminder,
} from '../lib/notifications'

interface ProfileContextValue {
  profile: UserProfile
  loading: boolean
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
  /** Alta de suscripción simulada ($4,99/mes). Sustituible por Stripe real. */
  subscribePremium: () => Promise<void>
  /** Cancela la suscripción premium. */
  cancelPremium: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!user) {
      setProfile(DEFAULT_PROFILE)
      setLoading(false)
      return
    }
    setLoading(true)
    store.getProfile(user.uid).then((p) => {
      if (!active) return
      setProfile(p)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [user])

  // Mantiene el recordatorio de hora de dormir sincronizado con el perfil.
  useEffect(() => {
    if (profile.reminderEnabled) {
      requestNotificationPermission().then((perm) => {
        if (perm === 'granted') scheduleBedtimeReminder(profile.bedtime)
      })
    } else {
      clearBedtimeReminder()
    }
    return () => clearBedtimeReminder()
  }, [profile.reminderEnabled, profile.bedtime])

  const persist = useCallback(
    async (next: UserProfile) => {
      setProfile(next)
      if (user) await store.saveProfile(user.uid, next)
    },
    [user],
  )

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading,
      updateProfile: (patch) => persist({ ...profile, ...patch }),
      subscribePremium: () => {
        const renews = new Date()
        renews.setMonth(renews.getMonth() + 1)
        return persist({
          ...profile,
          premium: true,
          premiumRenewsAt: renews.toISOString(),
        })
      },
      cancelPremium: () =>
        persist({ ...profile, premium: false, premiumRenewsAt: undefined }),
    }),
    [profile, loading, persist],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile debe usarse dentro de <ProfileProvider>')
  return ctx
}
