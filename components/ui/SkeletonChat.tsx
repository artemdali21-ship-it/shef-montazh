export default function SkeletonChat() {
  return (
    <div className="border-b border-white/10 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-white/10 rounded-full flex-shrink-0"></div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and time */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-white/10 rounded w-32"></div>
            <div className="h-3 bg-white/10 rounded w-12"></div>
          </div>

          {/* Last message */}
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonChatList({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonChat key={i} />
      ))}
    </div>
  )
}
