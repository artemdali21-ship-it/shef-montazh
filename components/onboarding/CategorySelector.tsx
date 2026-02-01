import { Check, ChevronLeft } from 'lucide-react'

const CATEGORIES = [
  { id: 'грузчик', label: 'Грузчик', icon: '📦' },
  { id: 'монтажник', label: 'Монтажник', icon: '🔧' },
  { id: 'электрик', label: 'Электрик', icon: '⚡' },
  { id: 'сантехник', label: 'Сантехник', icon: '🚰' },
  { id: 'отделочник', label: 'Отделочник', icon: '🎨' },
  { id: 'уборщик', label: 'Уборщик', icon: '🧹' },
  { id: 'официант', label: 'Официант', icon: '🍽️' },
  { id: 'промоутер', label: 'Промоутер', icon: '📢' },
  { id: 'курьер', label: 'Курьер', icon: '🚴' },
  { id: 'водитель', label: 'Водитель', icon: '🚗' }
]

interface Props {
  selected: string[]
  onSelect: (categories: string[]) => void
  onNext: () => void
  onBack: () => void
}

export default function CategorySelector({ selected, onSelect, onNext, onBack }: Props) {
  const toggleCategory = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      onSelect(selected.filter(id => id !== categoryId))
    } else {
      onSelect([...selected, categoryId])
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Назад</span>
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">
        Ваши специализации 🔨
      </h1>
      <p className="text-gray-400 mb-6">
        Выберите категории, в которых вы работаете (можно несколько)
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {CATEGORIES.map((category) => {
          const isSelected = selected.includes(category.id)

          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-xl
                border-2 transition-all duration-200
                ${isSelected
                  ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <span className="text-3xl">{category.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                {category.label}
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400 text-center">
            ✓ Выбрано категорий: {selected.length}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={selected.length === 0}
        className="
          w-full py-4 bg-orange-500 text-white rounded-xl
          hover:bg-orange-600 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          transition-all duration-200 font-bold text-lg
        "
      >
        {selected.length === 0 ? 'Выберите хотя бы одну категорию' : 'Продолжить'}
      </button>
    </div>
  )
}
