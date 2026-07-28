// Choice — tarjetas grandes seleccionables (onboarding).
export default function Choice({ value, onChange, options, id }) {
  return (
    <div className="choice" role="radiogroup" aria-labelledby={id}>
      {options.map((o) => {
        const on = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={`choice-card${on ? ' choice-card--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            <span className="choice-title">{o.label}</span>
            {o.hint && <span className="choice-hint">{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}
