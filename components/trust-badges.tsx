'use client'

import { Shield, CheckCircle, Zap } from 'lucide-react'

export function TrustBadges() {
  const badges = [
    {
      icon: <Shield size={14} className="text-[#9EBAC8]" />,
      text: 'Эскроу-оплата',
    },
    {
      icon: <CheckCircle size={14} className="text-[#9EBAC8]" />,
      text: 'Верификация',
    },
    {
      icon: <Zap size={14} className="text-[#9EBAC8]" />,
      text: 'Бригада за 15 минут',
    },
  ]

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 bg-white border border-border rounded-full px-4 py-2.5"
        >
          {badge.icon}
          <span className="text-xs font-normal text-secondary tracking-tight">
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  )
}
