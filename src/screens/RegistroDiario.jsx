import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toggle from '../components/Toggle.jsx'
import Scale from '../components/Scale.jsx'
import Stepper from '../components/Stepper.jsx'
import { saveLog, getLog } from '../lib/dataClient.js'
import { TODAY } from '../data/mock.js'

// ============================================================
// Registro diario — la pantalla core. 3 bloques: entrenamiento,
// sueño y energía. Directo, un dato por bloque. Al guardar,
// vuelve a la Home con la señal del día ya leída.
// ============================================================

export default function RegistroDiario() {
  const navigate = useNavigate()
  const existing = getLog(TODAY) || {}
  const [trained, setTrained] = useState(existing.trained ?? null)
  const [effort, setEffort] = useState(existing.perceived_effort ?? null)
  const [sleepHours, setSleepHours] = useState(existing.sleep_hours ?? null)
  const [sleepQuality, setSleepQuality] = useState(existing.sleep_quality ?? null)
  const [energy, setEnergy] = useState(existing.energy_level ?? null)

  const canSave = trained != null && energy != null && sleepQuality != null && sleepHours != null && (!trained || effort != null)

  async function save() {
    if (!canSave) return
    await saveLog(TODAY, {
      trained,
      perceived_effort: trained ? effort : null,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      energy_level: energy,
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="shell shell--zona reg">
      <header className="reg-head">
        <button type="button" className="reg-close" aria-label="Cerrar" onClick={() => navigate('/')}>
          ←
        </button>
        <div>
          <span className="eyebrow">Sábado · Hoy</span>
          <h1 className="reg-title">Registrar hoy</h1>
        </div>
      </header>

      {/* Entrenamiento */}
      <section className="reg-block">
        <span className="eyebrow" id="q-trained">Entrenamiento</span>
        <h2 className="reg-q">¿Entrenaste?</h2>
        <Toggle
          id="q-trained"
          value={trained}
          onChange={setTrained}
          options={[
            { value: true, label: 'Sí' },
            { value: false, label: 'No' },
          ]}
        />
        {trained && (
          <div className="reg-sub">
            <span className="eyebrow" id="q-effort">Esfuerzo percibido</span>
            <Scale id="q-effort" value={effort} onChange={setEffort} tone="effort" lowLabel="Suave" highLabel="Al límite" />
          </div>
        )}
      </section>

      {/* Sueño */}
      <section className="reg-block">
        <span className="eyebrow" id="q-sleep">Sueño</span>
        <h2 className="reg-q">¿Cuánto dormiste?</h2>
        <Stepper id="q-sleep" value={sleepHours} onChange={setSleepHours} unit="h" />
        <div className="reg-sub">
          <span className="eyebrow" id="q-sq">Calidad del sueño</span>
          <Scale id="q-sq" value={sleepQuality} onChange={setSleepQuality} lowLabel="Mala" highLabel="Excelente" />
        </div>
      </section>

      {/* Energía */}
      <section className="reg-block">
        <span className="eyebrow" id="q-energy">Energía / ánimo</span>
        <h2 className="reg-q">¿Cómo venís hoy?</h2>
        <Scale id="q-energy" value={energy} onChange={setEnergy} lowLabel="En el piso" highLabel="A full" />
      </section>

      <button type="button" className="zona-cta reg-save" disabled={!canSave} onClick={save}>
        <span className="zona-cta-title">Guardar y leer mi señal</span>
      </button>
    </div>
  )
}
