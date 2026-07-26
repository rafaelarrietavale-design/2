/**
 * Recordatorio de hora de dormir mediante notificaciones web.
 * Programa un timeout hasta la próxima hora "HH:mm" y muestra una notificación.
 * Es best-effort: solo funciona con la pestaña abierta (sin service worker push).
 */

let timer: number | undefined

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

/** Milisegundos desde ahora hasta la próxima ocurrencia de "HH:mm". */
function msUntil(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

export function scheduleBedtimeReminder(bedtime: string): void {
  clearBedtimeReminder()
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const ms = msUntil(bedtime)
  timer = window.setTimeout(() => {
    new Notification('Hora de dormir 🌙', {
      body: 'Es tu hora objetivo de acostarte. Prepárate para descansar bien.',
      icon: '/favicon.svg',
    })
    // Reprograma para el día siguiente.
    scheduleBedtimeReminder(bedtime)
  }, ms)
}

export function clearBedtimeReminder(): void {
  if (timer !== undefined) {
    window.clearTimeout(timer)
    timer = undefined
  }
}
