export default function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 animate-pulse">
      {/* Header badges */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-20 bg-white/10 rounded-full"></div>
        <div className="h-6 w-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Title */}
      <div className="h-5 bg-white/10 rounded w-3/4 mb-3"></div>

      {/* Description */}
      <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-2/3 mb-4"></div>

      {/* Info rows */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white/10 rounded"></div>
          <div className="h-3 bg-white/10 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white/10 rounded"></div>
          <div className="h-3 bg-white/10 rounded w-24"></div>
        </div>
      </div>

      {/* Button */}
      <div className="h-11 bg-white/10 rounded-xl"></div>
    </div>
  )
}
