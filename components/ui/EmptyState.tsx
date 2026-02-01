import { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'compact'
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default'
}: Props) {
  const spacing = variant === 'compact' ? 'py-12' : 'py-16'
  const iconSize = variant === 'compact' ? 'w-16 h-16' : 'w-20 h-20'
  const iconSvgSize = variant === 'compact' ? 32 : 40

  return (
    <div className={`flex flex-col items-center justify-center ${spacing} px-4`}>
      {/* Icon circle */}
      <div className={`${iconSize} rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4`}>
        <Icon size={iconSvgSize} className="text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Optional action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="
            px-6 py-3 bg-orange-500 text-white rounded-xl
            hover:bg-orange-600 active:scale-95
            transition-all duration-200 font-medium
          "
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
