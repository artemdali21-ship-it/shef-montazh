import { getCategoryById } from '@/lib/constants/categories'

interface Props {
  categoryId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined'
}

export default function CategoryBadge({ categoryId, size = 'md', variant = 'default' }: Props) {
  const category = getCategoryById(categoryId)

  if (!category) return null

  const Icon = category.icon

  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  }

  const baseClasses = `inline-flex items-center ${sizes[size]} rounded-full font-medium transition`

  if (variant === 'outlined') {
    return (
      <span className={`${baseClasses} ${category.color} border ${category.borderColor} bg-transparent`}>
        <Icon size={iconSizes[size]} />
        {category.name}
      </span>
    )
  }

  return (
    <span className={`${baseClasses} ${category.bgColor} ${category.color} border ${category.borderColor}`}>
      <Icon size={iconSizes[size]} />
      {category.name}
    </span>
  )
}
