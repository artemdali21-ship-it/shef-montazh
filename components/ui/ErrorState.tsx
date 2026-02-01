import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  title?: string
  message: string
  onRetry?: () => void
  variant?: 'default' | 'compact'
}

export default function ErrorState({
  title = "Что-то пошло не так",
  message,
  onRetry,
  variant = 'default'
}: Props) {
  const spacing = variant === 'compact' ? 'py-12' : 'py-16'
  const iconSize = variant === 'compact' ? 'w-16 h-16' : 'w-20 h-20'
  const iconSvgSize = variant === 'compact' ? 32 : 40

  return (
    <div className={`flex flex-col items-center justify-center ${spacing} px-4`}>
      {/* Error icon */}
      <div className={`${iconSize} rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4`}>
        <AlertCircle size={iconSvgSize} className="text-red-400" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 text-center">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-400 text-center max-w-sm mb-6">
        {message}
      </p>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            flex items-center gap-2 px-6 py-3
            bg-orange-500 text-white rounded-xl
            hover:bg-orange-600 active:scale-95
            transition-all duration-200 font-medium
          "
        >
          <RefreshCw size={20} />
          Попробовать снова
        </button>
      )}
    </div>
  )
}
