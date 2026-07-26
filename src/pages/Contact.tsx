import { useState } from 'react'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { store, newId } from '../data/store'
import { useAuth } from '../context/AuthContext'
import { emailjsConfigured, sendContactEmail } from '../lib/emailjs'
import type { ContactMessage } from '../data/types'

export default function Contact() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const msg: ContactMessage = {
      id: newId(),
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    }
    try {
      // Se guarda siempre en el DataStore (Firestore si está configurado).
      await store.saveContactMessage(msg)
      // Y opcionalmente se envía por email si EmailJS está configurado.
      await sendContactEmail(msg)
      setStatus('sent')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar.')
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <header className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-moon-600/15 text-moon-400">
          <MessageCircle size={24} />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Contacto</h1>
        <p className="text-sm text-gray-400">
          ¿Dudas, ideas o problemas? Escríbenos y te responderemos.
        </p>
      </header>

      {status === 'sent' ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-aurora-500/15 text-aurora-400">
            <Send size={26} />
          </div>
          <p className="text-lg font-semibold text-white">¡Mensaje enviado!</p>
          <p className="text-sm text-gray-400">
            Gracias por escribirnos. Te responderemos pronto
            {emailjsConfigured() ? ' por correo' : ''}.
          </p>
          <button onClick={() => setStatus('idle')} className="btn-ghost mt-2">
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="card flex flex-col gap-4 p-6">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="label">Correo</label>
            <input
              type="email"
              className="input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="label">Mensaje</label>
            <textarea
              className="input min-h-[120px] resize-y"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntanos en qué podemos ayudarte..."
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary"
          >
            <Send size={16} />
            {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
          </button>

          <a
            href="mailto:hola@descansa.app"
            className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300"
          >
            <Mail size={14} /> o escríbenos a hola@descansa.app
          </a>
        </form>
      )}
    </div>
  )
}
