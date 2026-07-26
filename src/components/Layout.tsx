import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Clock,
  Home,
  Mail,
  Moon,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

const nav = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/track', label: 'Dormir', icon: Clock, end: false },
  { to: '/stats', label: 'Estadísticas', icon: BarChart3, end: false },
  { to: '/premium', label: 'Premium', icon: Sparkles, end: false },
  { to: '/settings', label: 'Ajustes', icon: SettingsIcon, end: false },
]

export default function Layout() {
  const { profile } = useProfile()
  const location = useLocation()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-moon-500 to-aurora-500 text-night-950">
            <Moon size={18} />
          </div>
          <span className="text-lg font-extrabold text-white">Descansa</span>
          {profile.premium && (
            <span className="chip bg-aurora-500/15 text-aurora-400">PRO</span>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-moon-600/15 text-moon-300'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-moon-600/15 text-moon-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Mail size={18} /> Contacto
          </NavLink>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
        <Outlet />
      </main>

      {/* Barra inferior (móvil) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-night-950/90 px-2 py-2 backdrop-blur md:hidden">
        {nav.map(({ to, label, icon: Icon, end }) => {
          const active = end
            ? location.pathname === to
            : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium ${
                active ? 'text-moon-400' : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
