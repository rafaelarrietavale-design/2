// StatTile — celda de lectura (etiqueta mono + valor grande + unidad).
// Reutilizable por ambas direcciones; el estilo lo dan los tokens.
export default function StatTile({ label, value, unit, hint, empty }) {
  return (
    <div className="stat-tile">
      <span className="eyebrow">{label}</span>
      {empty ? (
        <span className="stat-empty">—</span>
      ) : (
        <span className="stat-value data">
          {value}
          {unit && <span className="stat-unit"> {unit}</span>}
        </span>
      )}
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}
