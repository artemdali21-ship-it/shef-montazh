'use client'

interface TrustStatusBadgeProps {
  status: 'ok' | 'warning' | 'restricted' | 'blocked'
  trustScore: number
}

export default function TrustStatusBadge({ status, trustScore }: TrustStatusBadgeProps) {
  const colors = {
    ok: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    restricted: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    blocked: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const labels = {
    ok: 'Надёжный ✓',
    warning: 'Внимание',
    restricted: 'Ограничен',
    blocked: 'Заблокирован'
  }

  return (
    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${colors[status]}`}>
      {labels[status]} ({trustScore})
    </div>
  )
}
