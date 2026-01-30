import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        'skeleton bg-white/5',
        variantClasses[variant],
        className
      )}
      style={style}
    />
  )
}

// Pre-built skeleton components
export function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton className="h-5 mb-2" width="60%" />
          <Skeleton className="h-4" width="40%" />
        </div>
      </div>
      <Skeleton className="h-4 mb-2" />
      <Skeleton className="h-4 mb-2" width="80%" />
      <Skeleton className="h-4" width="60%" />
    </div>
  )
}

export function SkeletonShiftCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 mb-2" width="70%" />
          <Skeleton className="h-4" width="40%" />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} className="rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4" width="50%" />
        <Skeleton className="h-4" width="60%" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Skeleton className="h-5" width={100} />
        <Skeleton className="h-6" width={120} />
      </div>
    </div>
  )
}

export function SkeletonProfileHeader() {
  return (
    <div className="relative p-6">
      <div className="flex flex-col items-center">
        <Skeleton variant="circular" width={112} height={112} className="mb-4" />
        <Skeleton className="h-8 mb-2" width={200} />
        <Skeleton className="h-5 mb-4" width={150} />
        <Skeleton variant="rectangular" width={180} height={40} className="rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
        >
          <div className="flex flex-col items-center">
            <Skeleton variant="circular" width={40} height={40} className="mb-2" />
            <Skeleton className="h-8 mb-1" width={60} />
            <Skeleton className="h-3" width={80} />
          </div>
        </div>
      ))}
    </div>
  )
}
