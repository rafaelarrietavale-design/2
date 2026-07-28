// Scale — selector 1..10 (esfuerzo, calidad de sueño, energía).
// tone: 'brand' (frío) o 'effort' (cálido) para el segmento activo.
export default function Scale({ value, onChange, tone = 'brand', min = 1, max = 10, lowLabel, highLabel, id }) {
  const items = []
  for (let n = min; n <= max; n++) items.push(n)
  return (
    <div>
      <div className="scale" role="radiogroup" aria-labelledby={id}>
        {items.map((n) => {
          const on = value === n
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={String(n)}
              className={`scale-pip${on ? ' scale-pip--on' : ''}`}
              data-tone={tone}
              onClick={() => onChange(n)}
            >
              <span className="data">{n}</span>
            </button>
          )
        })}
      </div>
      {(lowLabel || highLabel) && (
        <div className="scale-ends">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )
}
