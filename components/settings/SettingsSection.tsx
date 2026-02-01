import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  icon: LucideIcon
  children: ReactNode
}

export default function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-orange-400" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>

      {/* Content */}
      <div className="px-5 py-2">
        {children}
      </div>
    </div>
  )
}
