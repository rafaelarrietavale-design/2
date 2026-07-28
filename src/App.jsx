import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './screens/HomeZona.jsx'
import Onboarding from './screens/Onboarding.jsx'
import RegistroDiario from './screens/RegistroDiario.jsx'
import Historial from './screens/Historial.jsx'
import InsightSemanal from './screens/InsightSemanal.jsx'
import Perfil from './screens/Perfil.jsx'
import { hasProfile } from './lib/dataClient.js'

// Puerta simple: sin perfil -> onboarding. (El seed viene onboardeado;
// para ver el flujo, entrá a /onboarding.)
function RequireProfile({ children }) {
  return hasProfile() ? children : <Navigate to="/onboarding" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RequireProfile><Home /></RequireProfile>} />
      <Route path="/registro" element={<RequireProfile><RegistroDiario /></RequireProfile>} />
      <Route path="/historial" element={<RequireProfile><Historial /></RequireProfile>} />
      <Route path="/insight" element={<RequireProfile><InsightSemanal /></RequireProfile>} />
      <Route path="/perfil" element={<RequireProfile><Perfil /></RequireProfile>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
