'use client'

import { CATEGORIES } from '@/lib/constants/categories'

interface Props {
  selectedCategory: string | null
  onChange: (categoryId: string | null) => void
  label?: string
  showAllOption?: boolean
  allOptionLabel?: string
}

/**
 * Category filter dropdown for filtering shifts or workers
 *
 * @example
 * const [category, setCategory] = useState<string | null>(null)
 * <CategoryFilter selectedCategory={category} onChange={setCategory} />
 */
export default function CategoryFilter({
  selectedCategory,
  onChange,
  label = 'Категория',
  showAllOption = true,
  allOptionLabel = 'Все категории'
}: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <select
        value={selectedCategory || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
      >
        {showAllOption && <option value="">{allOptionLabel}</option>}
        {CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
