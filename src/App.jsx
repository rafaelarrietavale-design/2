import { useEffect, useState } from 'react'
import HomeInstrumento from './screens/HomeInstrumento.jsx'
import HomeZona from './screens/HomeZona.jsx'
import { getProfile, getWeek } from './lib/dataClient.js'
import { weekSeries } from './data/mock.js'

// El switcher es sólo para esta etapa de validación de diseño:
// deja comparar las dos direcciones en pantalla. Se elimina al
// congelar la dirección ganadora.
const DIRS = [
  { id: 'instrumento', label: 'Instrumento' },
  { id: 'zona', label: 'Zona / Heat' },
]

export default function App() {
  const [dir, setDir] = useState(() => localStorage.getItem('pulso-dir') || 'instrumento')
  const [data, setData] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-dir', dir)
    localStorage.setItem('pulso-dir', dir)
  }, [dir])

  useEffect(() => {
    Promise.all([getProfile(), getWeek()]).then(([profile, week]) => {
      setData({ profile, week, series: weekSeries() })
    })
  }, [])

  if (!data) return null

  return (
    <>
      <div className="dir-switch" role="tablist" aria-label="Dirección de diseño">
        <span className="dir-switch-tag">Vista de diseño</span>
        {DIRS.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={dir === d.id}
            className={`dir-btn${dir === d.id ? ' dir-btn--on' : ''}`}
            onClick={() => setDir(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {dir === 'instrumento' ? (
        <HomeInstrumento profile={data.profile} week={data.week} series={data.series} />
      ) : (
        <HomeZona profile={data.profile} week={data.week} series={data.series} />
      )}
    </>
  )
}
