export default function SkeletonProfile() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-white/10 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded w-48 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-32"></div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="h-8 bg-white/10 rounded w-12 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-16"></div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="h-8 bg-white/10 rounded w-12 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-16"></div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="h-8 bg-white/10 rounded w-12 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-16"></div>
        </div>
      </div>

      {/* Bio section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="h-4 bg-white/10 rounded w-24 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded w-full"></div>
          <div className="h-3 bg-white/10 rounded w-5/6"></div>
          <div className="h-3 bg-white/10 rounded w-4/6"></div>
        </div>
      </div>

      {/* Additional info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded w-40"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
