// Logo — lockup de marca: badge (la onda de pulso) + wordmark "PULSO".
// Reusa la identidad del ícono de la app. `badgeOnly` para usos compactos.
export default function Logo({ size = 28, badgeOnly = false }) {
  return (
    <span className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lg-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1e222a" />
            <stop offset="1" stopColor="#121419" />
          </linearGradient>
          <linearGradient id="lg-pulse" x1="70" y1="256" x2="442" y2="256" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2E6BE6" />
            <stop offset="0.5" stopColor="#16D19A" />
            <stop offset="1" stopColor="#FF7A18" />
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="464" height="464" rx="132" fill="url(#lg-bg)" stroke="#30343c" strokeWidth="2" />
        <polyline
          points="86,292 176,292 214,326 256,150 298,362 336,292 426,292"
          fill="none"
          stroke="url(#lg-pulse)"
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="256" cy="150" r="22" fill="#F2F3F5" />
      </svg>
      {!badgeOnly && <span className="logo-word">PULSO</span>}
    </span>
  )
}
