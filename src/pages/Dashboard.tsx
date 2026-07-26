import { Link } from 'react-router-dom'
import {
  Bed,
  Clock,
  Flame,
  Gauge,
  Moon,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { useSleep } from '../context/SleepContext'
import {
  averagePerNight,
  consistencyScore,
  dailyTotals,
  durationMinutes,
  formatHm,
  sleepDebt,
} from '../lib/sleepMath'
import StatCard from '../components/StatCard'
import SessionCard from '../components/SessionCard'
import AdSlot from '../components/AdSlot'

export default function Dashboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { sessions } = useSleep()

  const last = sessions[0]
  const avg7 = averagePerNight(sessions, 7)
  const debt = sleepDebt(sessions, profile.goalMinutes, 7)
  const consistency = consistencyScore(sessions, 14)

  const chartData = dailyTotals(sessions, 7).map((t) => ({
    day: new Date(t.day).toLocaleDateString('es', { weekday: 'short' }),
    horas: +(t.minutes / 60).toFixed(2),
  }))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6) return 'Buenas noches'
    if (h < 13) return 'Buenos días'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <p className="text-sm text-gray-400">{greeting()},</p>
        <h1 className="text-2xl font-extrabold text-white">
          {user?.displayName || 'bienvenid@'} 👋
        </h1>
      </header>

      {sessions.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 p-8 text-center">
          <Moon size={40} className="text-moon-400" />
          <div>
            <p className="text-lg font-semibold text-white">
              Aún no hay registros
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Empieza esta noche para ver tus estadísticas de sueño.
            </p>
          </div>
          <Link to="/track" className="btn-primary">
            <Clock size={16} /> Registrar sueño
          </Link>
        </div>
      ) : (
        <>
          {/* Última noche */}
          {last && (
            <div className="card mb-4 overflow-hidden">
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Último registro
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-white">
                    {formatHm(durationMinutes(last))}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Objetivo: {formatHm(profile.goalMinutes)}
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-moon-600/15 text-moon-400">
                  <Bed size={30} />
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-moon-500 to-aurora-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (durationMinutes(last) / profile.goalMinutes) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* KPIs */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              label="Media 7 días"
              value={avg7 ? formatHm(avg7) : '--'}
              icon={<TrendingUp size={18} />}
              accent="aurora"
            />
            <StatCard
              label="Deuda de sueño"
              value={debt > 0 ? formatHm(debt) : 'Al día ✓'}
              hint={debt > 0 ? 'Últimos 7 días' : 'Buen trabajo'}
              icon={<Flame size={18} />}
              accent={debt > 0 ? 'rose' : 'aurora'}
            />
            <StatCard
              label="Consistencia"
              value={consistency ? `${consistency}%` : '--'}
              hint="Regularidad de horarios"
              icon={<Gauge size={18} />}
              accent="moon"
            />
          </div>

          {/* Mini gráfico */}
          <div className="card mb-4 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Últimos 7 días</h2>
              <Link to="/stats" className="text-xs font-semibold text-moon-400">
                Ver más
              </Link>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111834',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                    }}
                    formatter={(v: number) => [`${v} h`, 'Sueño']}
                  />
                  <Area
                    type="monotone"
                    dataKey="horas"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#g1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <AdSlot className="mb-4" />

          {/* Recientes */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">Registros recientes</h2>
            <Link to="/history" className="text-xs font-semibold text-moon-400">
              Ver historial
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 4).map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
