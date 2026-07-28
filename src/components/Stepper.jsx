// Stepper — valor numérico con - / + (ej. horas de sueño).
export default function Stepper({ value, onChange, step = 0.5, min = 0, max = 14, unit = '', id }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, Math.round(v * 2) / 2)))
  const has = value != null
  return (
    <div className="stepper" aria-labelledby={id}>
      <button type="button" className="stepper-btn" aria-label="Restar" onClick={() => set((has ? value : 7) - step)}>
        −
      </button>
      <span className="stepper-val data" aria-live="polite">
        {has ? value : '—'}
        {has && unit ? <small>{unit}</small> : null}
      </span>
      <button type="button" className="stepper-btn" aria-label="Sumar" onClick={() => set((has ? value : 7) + step)}>
        +
      </button>
    </div>
  )
}
