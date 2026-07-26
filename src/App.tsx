import { Navigate, Route, Routes } from 'react-router-dom'
import { Moon } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { SleepProvider } from './context/SleepContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Track from './pages/Track'
import History from './pages/History'
import Stats from './pages/Stats'
import Premium from './pages/Premium'
import Contact from './pages/Contact'
import Settings from './pages/Settings'

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Moon size={40} className="animate-pulse-slow text-moon-400" />
        <span className="text-sm">Cargando Descansa...</span>
      </div>
    </div>
  )
}

/** Rutas protegidas: requieren sesión y montan los providers de datos. */
function ProtectedApp() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (!user) return <Auth />

  return (
    <ProfileProvider>
      <SleepProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="track" element={<Track />} />
            <Route path="history" element={<History />} />
            <Route path="stats" element={<Stats />} />
            <Route path="premium" element={<Premium />} />
            <Route path="contact" element={<Contact />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SleepProvider>
    </ProfileProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  )
}
