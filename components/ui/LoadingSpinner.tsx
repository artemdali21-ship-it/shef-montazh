import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'orange' | 'white' | 'gray'
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  color = 'orange',
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  const colorClasses = {
    orange: 'border-orange-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  }

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Загрузка"
    >
      <span className="sr-only">Загрузка...</span>
    </div>
  )
}

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Загрузка...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner size="xl" color="orange" className="mx-auto mb-4" />
        <p className="text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  show: boolean
}

export function LoadingOverlay({ message, show }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
        <LoadingSpinner size="lg" color="orange" className="mx-auto mb-4" />
        {message && <p className="text-white text-lg">{message}</p>}
      </div>
    </div>
  )
}
