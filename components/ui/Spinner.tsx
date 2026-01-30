import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <Loader2
      className="animate-spin text-[#E85D2F]"
      size={size}
    />
  )
}
