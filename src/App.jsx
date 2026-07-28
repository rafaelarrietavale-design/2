import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './screens/HomeZona.jsx'
import Onboarding from './screens/Onboarding.jsx'
import RegistroDiario from './screens/RegistroDiario.jsx'
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
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
