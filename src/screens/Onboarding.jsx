import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Choice from '../components/Choice.jsx'
import Logo from '../components/Logo.jsx'
import { saveProfile } from '../lib/dataClient.js'

// ============================================================
// Onboarding — 3 pasos: objetivo -> nivel -> días de entreno.
// Numeración legítima (es una secuencia real). Al terminar,
// guarda el perfil y entra a la Home.
// ============================================================

const GOALS = [
  { value: 'ganar_musculo', label: 'Ganar músculo', hint: 'Fuerza y volumen' },
  { value: 'bajar_grasa', label: 'Bajar grasa', hint: 'Recomposición' },
  { value: 'rendimiento', label: 'Rendimiento', hint: 'Rendir más, competir' },
  { value: 'salud_general', label: 'Salud general', hint: 'Sentirte mejor' },
]

const LEVELS = [
  { value: 'principiante', label: 'Principiante', hint: 'Menos de 1 año entrenando' },
  { value: 'intermedio', label: 'Intermedio', hint: '1 a 3 años, técnica sólida' },
  { value: 'avanzado', label: 'Avanzado', hint: 'Más de 3 años, entrenás en serie' },
]

const STEPS = [
  { key: 'goal', eyebrow: 'Paso 1 de 3', title: '¿Qué buscás?', help: 'Ajustamos la lectura a tu objetivo.' },
  { key: 'level', eyebrow: 'Paso 2 de 3', title: '¿Cuánto entrenás hace?', help: 'Nos dice cuánto exigirte.' },
  { key: 'days', eyebrow: 'Paso 3 de 3', title: '¿Cuántos días por semana?', help: 'Tu ritmo base de entrenamiento.' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ goal: null, experience_level: null, training_days_per_week: null })

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const current = STEPS[step]
  const canNext =
    (step === 0 && form.goal) ||
    (step === 1 && form.experience_level) ||
    (step === 2 && form.training_days_per_week)

  async function next() {
    if (!canNext) return
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      await saveProfile(form)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="shell shell--zona ob">
      <header className="ob-head">
        <Logo />
        <div className="ob-progress" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`ob-dot${i <= step ? ' ob-dot--on' : ''}`} />
          ))}
        </div>
      </header>

      <div className="ob-body">
        <span className="eyebrow">{current.eyebrow}</span>
        <h1 className="ob-title">{current.title}</h1>
        <p className="ob-help">{current.help}</p>

        {step === 0 && <Choice id="goal" value={form.goal} onChange={(v) => set({ goal: v })} options={GOALS} />}
        {step === 1 && (
          <Choice id="level" value={form.experience_level} onChange={(v) => set({ experience_level: v })} options={LEVELS} />
        )}
        {step === 2 && (
          <div className="ob-days">
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={form.training_days_per_week === n}
                className={`ob-day${form.training_days_per_week === n ? ' ob-day--on' : ''}`}
                onClick={() => set({ training_days_per_week: n })}
              >
                <span className="data">{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ob-foot">
        {step > 0 && (
          <button type="button" className="ob-back" onClick={() => setStep(step - 1)}>
            Atrás
          </button>
        )}
        <button type="button" className="zona-cta ob-next" disabled={!canNext} onClick={next}>
          <span className="zona-cta-title">{step < STEPS.length - 1 ? 'Seguir' : 'Empezar'}</span>
        </button>
      </div>
    </div>
  )
}
