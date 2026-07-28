import { useMemo, useId } from 'react'

// ============================================================
// SignalTrace — FIRMA de la dirección "Instrumento".
// Una sola curva continua que teje el readiness de la semana
// (sueño + energía + carga) en una onda legible. El color del
// trazo recorre una rampa fría->cálida (recuperado -> exigido).
// Se dibuja al cargar; respeta prefers-reduced-motion vía CSS.
// ============================================================

const W = 440
const H = 150
const PAD_X = 12
const PAD_Y = 22

// Catmull-Rom -> path suave que pasa por todos los puntos
function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

export default function SignalTrace({ series }) {
  const gid = useId().replace(/:/g, '')
  const logged = series.filter((d) => d.readiness != null)

  const { linePath, areaPath, points, todayPoint } = useMemo(() => {
    const n = series.length
    const xAt = (i) => PAD_X + (i * (W - PAD_X * 2)) / (n - 1)
    const yAt = (v) => PAD_Y + (1 - v / 100) * (H - PAD_Y * 2)

    const pts = series
      .map((d, i) => (d.readiness != null ? { x: xAt(i), y: yAt(d.readiness), i, v: d.readiness } : null))
      .filter(Boolean)

    const line = smoothPath(pts)
    const area = pts.length
      ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD_Y} L ${pts[0].x.toFixed(1)} ${H - PAD_Y} Z`
      : ''

    const todayIdx = series.findIndex((d) => d.isToday)
    const tp = todayIdx >= 0 ? { x: xAt(todayIdx) } : null

    return { linePath: line, areaPath: area, points: pts, todayPoint: tp }
  }, [series])

  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.readiness, 0) / logged.length) : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="signal-svg"
      role="img"
      aria-label={`Tu señal de la semana. Disponibilidad promedio ${avg ?? 'sin datos'} sobre 100.`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="55%" stopColor="var(--steady)" />
          <stop offset="100%" stopColor="var(--effort)" />
        </linearGradient>
        <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Marcador vertical de "hoy" */}
      {todayPoint && (
        <line
          x1={todayPoint.x}
          y1={PAD_Y - 8}
          x2={todayPoint.x}
          y2={H - PAD_Y}
          stroke="var(--line)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
      )}

      {areaPath && <path d={areaPath} fill={`url(#fill-${gid})`} />}
      {linePath && (
        <path
          className="signal-line"
          d={linePath}
          fill="none"
          stroke={`url(#stroke-${gid})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Nodos por día registrado */}
      {points.map((p) => (
        <circle key={p.i} cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      ))}
    </svg>
  )
}
