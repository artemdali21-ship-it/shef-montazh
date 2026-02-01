import {
  Wrench,
  Palette,
  Zap,
  Flame,
  Mountain,
  Paintbrush,
  HardHat,
  type LucideIcon
} from 'lucide-react'

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'montazhnik',
    name: 'Монтажник',
    icon: Wrench,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  {
    id: 'dekorator',
    name: 'Декоратор',
    icon: Palette,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'elektrik',
    name: 'Электрик',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  {
    id: 'svarshchik',
    name: 'Сварщик',
    icon: Flame,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  {
    id: 'alpinist',
    name: 'Альпинист',
    icon: Mountain,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'butafor',
    name: 'Бутафор',
    icon: Paintbrush,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30'
  },
  {
    id: 'raznorabochiy',
    name: 'Разнорабочий',
    icon: HardHat,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30'
  }
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(cat => cat.id === id)
}

export function getCategoriesByIds(ids: string[]): Category[] {
  return ids
    .map(id => getCategoryById(id))
    .filter((cat): cat is Category => cat !== undefined)
}
