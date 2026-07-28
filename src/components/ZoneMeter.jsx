// ============================================================
// ZoneMeter — FIRMA de la dirección "Zona / Heat".
// Barra de rampa de zonas (z1 frío -> z5 caliente) con un
// marcador en la zona calculada del día. Cada zona lleva su
// número en mono. El color codifica intensidad (no decora).
// ============================================================

export const ZONES = [
  { z: 1, label: 'Recuperación', color: 'var(--z1)' },
  { z: 2, label: 'Base', color: 'var(--z2)' },
  { z: 3, label: 'Constante', color: 'var(--z3)' },
  { z: 4, label: 'Exigente', color: 'var(--z4)' },
  { z: 5, label: 'Al límite', color: 'var(--z5)' },
]

export default function ZoneMeter({ zone }) {
  const active = ZONES.find((z) => z.z === zone) ?? null

  return (
    <div>
      <div
        className="zone-track"
        role="img"
        aria-label={active ? `Zona del día: ${active.z}, ${active.label}` : 'Zona del día: sin datos aún'}
      >
        {ZONES.map((z) => {
          const on = zone != null && z.z <= zone
          const isMarker = z.z === zone
          return (
            <div
              key={z.z}
              className={`zone-seg${isMarker ? ' zone-seg--active' : ''}`}
              style={{
                background: on ? z.color : 'var(--surface-2)',
                color: z.color,
                opacity: zone == null ? 0.35 : on ? 1 : 0.4,
              }}
            >
              <span className="data zone-num" style={{ color: on ? '#0d0f13' : 'var(--muted)' }}>
                {z.z}
              </span>
            </div>
          )
        })}
      </div>
      <div className="zone-legend">
        {active ? (
          <>
            <span className="data zone-big">Z{active.z}</span>
            <span className="zone-name">{active.label}</span>
          </>
        ) : (
          <span className="zone-name" style={{ color: 'var(--muted)' }}>
            Registrá hoy para ubicar tu zona
          </span>
        )}
      </div>
    </div>
  )
}
