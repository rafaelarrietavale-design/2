import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { Link } from 'react-router-dom'

interface AdSlotProps {
  /** Identificador del slot (data-ad-slot de AdSense). */
  slot?: string
  className?: string
}

/**
 * Espacio publicitario del tier gratuito.
 * - Premium: no renderiza nada.
 * - Con VITE_ADSENSE_CLIENT: inserta una unidad real de Google AdSense.
 * - Sin configurar: muestra un placeholder que invita a quitar anuncios (upsell).
 */
export default function AdSlot({ slot = '0000000000', className = '' }: AdSlotProps) {
  const { profile } = useProfile()
  const adRef = useRef<HTMLModElement>(null)
  const client = import.meta.env.VITE_ADSENSE_CLIENT

  useEffect(() => {
    if (profile.premium || !client) return
    try {
      // @ts-expect-error - adsbygoogle lo inyecta el script de AdSense.
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      /* AdSense aún no cargado */
    }
  }, [profile.premium, client])

  if (profile.premium) return null

  if (client) {
    return (
      <ins
        ref={adRef}
        className={`adsbygoogle block ${className}`}
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    )
  }

  // Placeholder (listo para AdSense) + upsell a premium.
  return (
    <div
      className={`card flex items-center justify-between gap-4 border-dashed border-white/10 px-4 py-3 text-sm ${className}`}
      aria-label="Espacio publicitario"
    >
      <div className="flex items-center gap-3 text-gray-400">
        <span className="chip bg-white/5 text-gray-400">Anuncio</span>
        <span className="hidden sm:inline">
          Espacio publicitario · versión gratuita
        </span>
      </div>
      <Link
        to="/premium"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-moon-400 hover:text-moon-500"
      >
        <Sparkles size={14} /> Quitar anuncios
      </Link>
    </div>
  )
}
