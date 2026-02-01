export default function SkeletonMessage() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Message from partner */}
      <div className="flex justify-start">
        <div className="max-w-[75%]">
          <div className="bg-white/10 rounded-2xl rounded-bl-sm p-4 w-64 h-16"></div>
          <div className="h-2 bg-white/5 rounded w-12 mt-1"></div>
        </div>
      </div>

      {/* Own message */}
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="bg-white/10 rounded-2xl rounded-br-sm p-4 w-48 h-12"></div>
          <div className="h-2 bg-white/5 rounded w-12 mt-1 ml-auto"></div>
        </div>
      </div>

      {/* Message from partner */}
      <div className="flex justify-start">
        <div className="max-w-[75%]">
          <div className="bg-white/10 rounded-2xl rounded-bl-sm p-4 w-56 h-20"></div>
          <div className="h-2 bg-white/5 rounded w-12 mt-1"></div>
        </div>
      </div>

      {/* Own message */}
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="bg-white/10 rounded-2xl rounded-br-sm p-4 w-40 h-14"></div>
          <div className="h-2 bg-white/5 rounded w-12 mt-1 ml-auto"></div>
        </div>
      </div>
    </div>
  )
}
