/**
 * EmptyState Component - Usage Examples
 *
 * This file shows various use cases for the EmptyState component.
 * Copy and paste these examples into your pages as needed.
 */

import { useRouter } from 'next/navigation'
import EmptyState from './EmptyState'
import {
  Search,
  MessageSquare,
  Star,
  Inbox,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Briefcase,
  MapPin
} from 'lucide-react'

// ============================================
// 1. ПОИСК СМЕН (без результатов)
// ============================================
function SearchShiftsEmpty() {
  return (
    <EmptyState
      icon={Search}
      title="Ничего не найдено"
      description="Попробуйте изменить фильтры поиска или категорию"
    />
  )
}

// ============================================
// 2. ПОИСК WORKERS (без результатов)
// ============================================
function SearchWorkersEmpty() {
  const router = useRouter()

  return (
    <EmptyState
      icon={Users}
      title="Специалисты не найдены"
      description="Попробуйте расширить параметры поиска или изменить категорию"
      action={{
        label: "Сбросить фильтры",
        onClick: () => {
          // Reset filters logic
        }
      }}
    />
  )
}

// ============================================
// 3. ЧАТЫ (пустой список)
// ============================================
function ChatsEmpty() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Нет сообщений"
      description="Начните общение с заказчиками или исполнителями"
      variant="compact"
    />
  )
}

// ============================================
// 4. ИЗБРАННОЕ (пустой список)
// ============================================
function FavoritesEmpty() {
  const router = useRouter()

  return (
    <EmptyState
      icon={Star}
      title="Нет избранных"
      description="Добавьте специалистов в избранное для быстрого доступа"
      action={{
        label: "Найти специалистов",
        onClick: () => router.push('/workers')
      }}
    />
  )
}

// ============================================
// 5. ДОКУМЕНТЫ (пустой список)
// ============================================
function DocumentsEmpty() {
  return (
    <EmptyState
      icon={Inbox}
      title="Нет документов"
      description="Документы будут появляться здесь после завершения смен"
    />
  )
}

// ============================================
// 6. ИСТОРИЯ ПЛАТЕЖЕЙ (пустая)
// ============================================
function PaymentsEmpty() {
  return (
    <EmptyState
      icon={CreditCard}
      title="Нет платежей"
      description="История ваших платежей будет отображаться здесь"
    />
  )
}

// ============================================
// 7. МОИ СМЕНЫ (нет активных смен)
// ============================================
function MyShiftsEmpty() {
  const router = useRouter()

  return (
    <EmptyState
      icon={Briefcase}
      title="Нет активных смен"
      description="Откликнитесь на открытые вакансии, чтобы начать работать"
      action={{
        label: "Найти смены",
        onClick: () => router.push('/shifts')
      }}
    />
  )
}

// ============================================
// 8. СОЗДАННЫЕ СМЕНЫ (для клиента)
// ============================================
function CreatedShiftsEmpty() {
  const router = useRouter()

  return (
    <EmptyState
      icon={Calendar}
      title="Вы ещё не создали смен"
      description="Создайте первую смену и найдите исполнителей"
      action={{
        label: "Создать смену",
        onClick: () => router.push('/create-shift')
      }}
    />
  )
}

// ============================================
// 9. ЗАБЛОКИРОВАННЫЕ (пустой список)
// ============================================
function BlockedEmpty() {
  return (
    <EmptyState
      icon={Users}
      title="Нет заблокированных"
      description="Здесь будут отображаться заблокированные пользователи"
      variant="compact"
    />
  )
}

// ============================================
// 10. ОТКЛИКИ НА СМЕНУ (нет откликов)
// ============================================
function ApplicationsEmpty() {
  return (
    <EmptyState
      icon={FileText}
      title="Нет откликов"
      description="Подождите, пока специалисты откликнутся на вашу смену"
      variant="compact"
    />
  )
}

// ============================================
// 11. БЛИЖАЙШИЕ СМЕНЫ (нет поблизости)
// ============================================
function NearbyShiftsEmpty() {
  return (
    <EmptyState
      icon={MapPin}
      title="Нет смен поблизости"
      description="Попробуйте увеличить радиус поиска или выбрать другую локацию"
    />
  )
}

export {
  SearchShiftsEmpty,
  SearchWorkersEmpty,
  ChatsEmpty,
  FavoritesEmpty,
  DocumentsEmpty,
  PaymentsEmpty,
  MyShiftsEmpty,
  CreatedShiftsEmpty,
  BlockedEmpty,
  ApplicationsEmpty,
  NearbyShiftsEmpty
}
