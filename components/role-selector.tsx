'use client'

import React from "react"

import { useState } from 'react'
import { Building2, HardHat, Wrench, Check } from 'lucide-react'

interface RoleOption {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
}

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState('executor')

  const roles: RoleOption[] = [
    {
      id: 'customer',
      icon: <Building2 size={28} className="text-[#9EBAC8]" />,
      title: 'Заказчик',
      subtitle: 'Агентство, продюсер, компания',
    },
    {
      id: 'executor',
      icon: <HardHat size={28} className="text-[#9EBAC8]" />,
      title: 'Исполнитель',
      subtitle: 'Монтажник, декоратор, техник',
    },
    {
      id: 'supervisor',
      icon: <Wrench size={28} className="text-[#9EBAC8]" />,
      title: 'Шеф-монтажник',
      subtitle: 'Бригадир, координатор',
    },
  ]

  return (
    <div className="mb-6">
      <h3 className="text-2xl font-semibold text-foreground text-center mb-6">
        Кто вы?
      </h3>

      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`w-full relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 active:translate-y-0 ${
              selectedRole === role.id
                ? 'bg-muted border-1.5 border-[#9EBAC8] shadow-md'
                : 'bg-white border border-transparent shadow-sm hover:-translate-y-0.5 hover:shadow-md'
            }`}
            aria-label={`Select ${role.title}`}
            aria-pressed={selectedRole === role.id}
          >
            {/* Icon Container */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              {role.icon}
            </div>

            {/* Text Container */}
            <div className="flex-1 text-left">
              <p className="text-base font-semibold text-foreground mb-0.5">
                {role.title}
              </p>
              <p className="text-sm font-normal text-secondary tracking-tight">
                {role.subtitle}
              </p>
            </div>

            {/* Checkmark Indicator */}
            {selectedRole === role.id && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9EBAC8] flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
