'use client'

import { Asterisk } from 'lucide-react'

export function OnboardingHeader() {
  return (
    <div className="mb-8">
      {/* Logo + Brand Mark */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Asterisk size={20} className="text-[#9EBAC8]" strokeWidth={2.5} />
        <h1 className="text-2xl font-bold text-foreground uppercase tracking-wider">
          ШЕФ-МОНТАЖ
        </h1>
      </div>
      
      {/* Tagline */}
      <p className="text-sm font-normal text-secondary text-center tracking-tight">
        Финтех-платформа гарантированных смен
      </p>
    </div>
  )
}
