import type { ContactMessage } from '../data/types'

/**
 * Envío opcional del formulario de contacto por EmailJS.
 * Si no hay claves en .env, no hace nada (el mensaje ya se guarda en el DataStore).
 * Usa la API REST de EmailJS para no añadir otra dependencia.
 */
export function emailjsConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_EMAILJS_SERVICE_ID &&
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  )
}

export async function sendContactEmail(msg: ContactMessage): Promise<void> {
  if (!emailjsConfigured()) return
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      template_params: {
        from_name: msg.name,
        from_email: msg.email,
        message: msg.message,
        sent_at: msg.createdAt,
      },
    }),
  })
  if (!res.ok) {
    throw new Error('No se pudo enviar el email de contacto.')
  }
}
