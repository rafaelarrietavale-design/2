// TabBar — navegación inferior mobile-first.
// Hoy y Registrar ya enrutan; Historial y Perfil quedan como
// placeholders hasta que existan sus pantallas.
const TABS = [
  { id: 'home', label: 'Hoy', to: '/', icon: 'M3 11.5 12 4l9 7.5M5 10v9h5v-6h4v6h5v-9' },
  { id: 'log', label: 'Registrar', to: '/registro', icon: 'M12 5v14M5 12h14', center: true },
  { id: 'history', label: 'Historial', to: '/historial', icon: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'profile', label: 'Perfil', to: '/perfil', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c1.5-4 5-5 8-5s6.5 1 8 5' },
]

export default function TabBar({ active = 'home', onNavigate }) {
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {TABS.map((t) => {
        const disabled = !t.to
        return (
          <button
            key={t.id}
            type="button"
            className={`tab${t.id === active ? ' tab--active' : ''}${t.center ? ' tab--center' : ''}`}
            aria-current={t.id === active ? 'page' : undefined}
            aria-disabled={disabled || undefined}
            title={disabled ? 'Próximamente' : undefined}
            onClick={() => t.to && onNavigate?.(t.to)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
