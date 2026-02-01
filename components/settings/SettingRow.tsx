import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface SettingRowProps {
  label: string
  value?: string
  onClick?: () => void
  children?: ReactNode
}

export default function SettingRow({ label, value, onClick, children }: SettingRowProps) {
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between py-3 border-b border-white/5 last:border-0
        ${isClickable ? 'cursor-pointer hover:bg-white/5 -mx-5 px-5 transition' : ''}
      `}
    >
      <span className="text-sm text-white">{label}</span>

      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-gray-400">{value}</span>}
        {children}
        {isClickable && <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
    </div>
  )
}
