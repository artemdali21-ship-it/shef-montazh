import SkeletonCard from './SkeletonCard'

interface Props {
  count?: number
  columns?: 1 | 2 | 3
}

export default function SkeletonList({ count = 6, columns = 2 }: Props) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
