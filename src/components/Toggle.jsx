// Toggle — elección segmentada de 2+ opciones (ej. entrenaste Sí/No).
export default function Toggle({ value, onChange, options, id }) {
  return (
    <div className="toggle" role="radiogroup" aria-labelledby={id}>
      {options.map((o) => {
        const on = value === o.value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            className={`toggle-opt${on ? ' toggle-opt--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
