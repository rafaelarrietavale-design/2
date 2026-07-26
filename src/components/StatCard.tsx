import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  accent?: 'moon' | 'aurora' | 'amber' | 'rose'
}

const accents: Record<NonNullable<StatCardProps['accent']>, string> = {
  moon: 'text-moon-400',
  aurora: 'text-aurora-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
}

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'moon',
}: StatCardProps) {
  return (
    <div className="card animate-fade-in p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>
        {icon && <span className={accents[accent]}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  )
}
