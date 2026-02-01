import CategoryBadge from './CategoryBadge'
import { getCategoriesByIds } from '@/lib/constants/categories'

interface Props {
  categoryIds: string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined'
  maxDisplay?: number
  emptyMessage?: string
}

/**
 * Displays a list of category badges
 *
 * @example
 * <CategoryList categoryIds={['montazhnik', 'elektrik']} size="md" />
 */
export default function CategoryList({
  categoryIds,
  size = 'md',
  variant = 'default',
  maxDisplay,
  emptyMessage = 'Категории не указаны'
}: Props) {
  if (!categoryIds || categoryIds.length === 0) {
    return (
      <div className="text-gray-400 text-sm">{emptyMessage}</div>
    )
  }

  const categories = getCategoriesByIds(categoryIds)
  const displayCategories = maxDisplay ? categories.slice(0, maxDisplay) : categories
  const remaining = categories.length - displayCategories.length

  return (
    <div className="flex flex-wrap gap-2">
      {displayCategories.map((category) => (
        <CategoryBadge
          key={category.id}
          categoryId={category.id}
          size={size}
          variant={variant}
        />
      ))}
      {remaining > 0 && (
        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
          +{remaining}
        </span>
      )}
    </div>
  )
}
