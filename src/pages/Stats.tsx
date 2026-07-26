import { Download, Lock, Moon, Sunrise } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useProfile } from '../context/ProfileContext'
import { useSleep } from '../context/SleepContext'
import {
  averagePerNight,
  averageTimeOfDay,
  consistencyScore,
  dailyTotals,
  formatHm,
  formatMinutesOfDay,
  sessionsToCsv,
} from '../lib/sleepMath'
import StatCard from '../components/StatCard'
import AdSlot from '../components/AdSlot'

export default function Stats() {
  const { profile } = useProfile()
  const { sessions } = useSleep()
  const premium = profile.premium

  const range = premium ? 30 : 7
  const data = dailyTotals(sessions, range).map((t) => ({
    day: new Date(t.day).toLocaleDateString('es', {
      day: 'numeric',
      month: premium ? 'short' : undefined,
    }),
    horas: +(t.minutes / 60).toFixed(2),
    minutes: t.minutes,
  }))

  const nights = sessions.filter((s) => s.kind === 'night')
  const avgBed = averageTimeOfDay(nights.map((s) => s.start))
  const avgWake = averageTimeOfDay(nights.map((s) => s.end))
  const avg = averagePerNight(sessions, range)
  const consistency = consistencyScore(sessions, range)
  const goalHours = profile.goalMinutes / 60

  const exportCsv = () => {
    const csv = sessionsToCsv(sessions)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `descansa-historial-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Estadísticas</h1>
          <p className="text-sm text-gray-400">
            {premium ? 'Últimos 30 días' : 'Últimos 7 días'}
          </p>
        </div>
        <button
          onClick={premium ? exportCsv : undefined}
          disabled={!premium}
          className={premium ? 'btn-ghost' : 'btn-ghost opacity-60'}
          title={premium ? 'Exportar CSV' : 'Función premium'}
        >
          {premium ? <Download size={16} /> : <Lock size={16} />} CSV
        </button>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Media" value={avg ? formatHm(avg) : '--'} accent="aurora" />
        <StatCard
          label="Consistencia"
          value={consistency ? `${consistency}%` : '--'}
          accent="moon"
        />
        <StatCard
          label="Hora media dormir"
          value={formatMinutesOfDay(avgBed)}
          icon={<Moon size={18} />}
          accent="moon"
        />
        <StatCard
          label="Hora media despertar"
          value={formatMinutesOfDay(avgWake)}
          icon={<Sunrise size={18} />}
          accent="amber"
        />
      </div>

      {/* Gráfico de barras por día */}
      <div className="card mb-4 p-5">
        <h2 className="mb-4 font-semibold text-white">Horas de sueño por día</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={premium ? 2 : 8}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
                unit="h"
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: '#111834',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                }}
                formatter={(v: number) => [`${v} h`, 'Sueño']}
              />
              <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.horas >= goalHours ? '#2dd4bf' : '#6366f1'}
                    opacity={d.horas === 0 ? 0.15 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          <span className="text-aurora-400">■</span> Cumple objetivo ·{' '}
          <span className="text-moon-500">■</span> Por debajo del objetivo (
          {formatHm(profile.goalMinutes)})
        </p>
      </div>

      {!premium && (
        <>
          <AdSlot className="mb-4" />
          <Link
            to="/premium"
            className="card flex flex-col items-center gap-2 border-dashed border-moon-500/20 p-6 text-center"
          >
            <Lock size={22} className="text-moon-400" />
            <p className="font-semibold text-white">Estadísticas avanzadas</p>
            <p className="text-sm text-gray-400">
              Historial de 30 días, exportación a CSV y más con Premium.
            </p>
            <span className="btn-primary mt-1">Desbloquear Premium</span>
          </Link>
        </>
      )}
    </div>
  )
}
