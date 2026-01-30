export default function ShiftCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-white/10 rounded w-24"></div>
        <div className="h-8 bg-white/10 rounded w-20"></div>
      </div>
    </div>
  )
}
