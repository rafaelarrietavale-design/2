import { Star } from 'lucide-react'

interface QualityStarsProps {
  value: number
  onChange?: (value: number) => void
  size?: number
}

/** Selector/visualización de calidad 1-5 con estrellas. */
export default function QualityStars({ value, onChange, size = 18 }: QualityStarsProps) {
  const readOnly = !onChange
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          aria-label={`Calidad ${n}`}
        >
          <Star
            size={size}
            className={
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  )
}
