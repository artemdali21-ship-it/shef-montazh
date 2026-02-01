export default function SkeletonDocument() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 animate-pulse">
      {/* Icon and badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
        <div className="h-6 w-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Title */}
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>

      {/* Date */}
      <div className="h-3 bg-white/10 rounded w-24 mb-4"></div>

      {/* Download button */}
      <div className="h-10 bg-white/10 rounded-xl"></div>
    </div>
  )
}

export function SkeletonDocumentList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDocument key={i} />
      ))}
    </div>
  )
}
