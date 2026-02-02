/**
 * Shift Status State Machine
 *
 * Определяет все возможные статусы смены и валидные переходы между ними
 */

export enum ShiftStatus {
  DRAFT = 'draft',                    // Черновик (не опубликована)
  PUBLISHED = 'published',            // Опубликована (открыта для откликов)
  APPLICATIONS = 'applications',      // Есть отклики (не обязательный статус)
  ACCEPTED = 'accepted',              // Исполнитель назначен
  CHECKING_IN = 'checking_in',        // Исполнитель делает check-in
  IN_PROGRESS = 'in_progress',        // Смена идёт
  COMPLETED = 'completed',            // Работа завершена
  REVIEWED = 'reviewed',              // Стороны оценили друг друга
  CANCELLED = 'cancelled'             // Отменена
}

/**
 * Граф валидных переходов статусов
 * Ключ: текущий статус
 * Значение: массив допустимых следующих статусов
 */
const STATUS_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  [ShiftStatus.DRAFT]: [
    ShiftStatus.PUBLISHED,
    ShiftStatus.CANCELLED
  ],
  [ShiftStatus.PUBLISHED]: [
    ShiftStatus.APPLICATIONS,
    ShiftStatus.ACCEPTED,
    ShiftStatus.CANCELLED
  ],
  [ShiftStatus.APPLICATIONS]: [
    ShiftStatus.ACCEPTED,
    ShiftStatus.CANCELLED
  ],
  [ShiftStatus.ACCEPTED]: [
    ShiftStatus.CHECKING_IN,
    ShiftStatus.IN_PROGRESS,
    ShiftStatus.CANCELLED
  ],
  [ShiftStatus.CHECKING_IN]: [
    ShiftStatus.IN_PROGRESS,
    ShiftStatus.CANCELLED
  ],
  [ShiftStatus.IN_PROGRESS]: [
    ShiftStatus.COMPLETED,
    ShiftStatus.CANCELLED
  ],
  [ShiftStatus.COMPLETED]: [
    ShiftStatus.REVIEWED
  ],
  [ShiftStatus.REVIEWED]: [
    // Финальный статус - переходов нет
  ],
  [ShiftStatus.CANCELLED]: [
    // Финальный статус - переходов нет
  ]
}

/**
 * Валидация перехода статуса
 *
 * @param currentStatus - текущий статус смены
 * @param newStatus - желаемый новый статус
 * @returns true если переход валиден, false если нет
 */
export function validateStatusTransition(
  currentStatus: ShiftStatus,
  newStatus: ShiftStatus
): boolean {
  // Проверка что оба статуса валидны
  if (!Object.values(ShiftStatus).includes(currentStatus)) {
    throw new Error(`Invalid current status: ${currentStatus}`)
  }
  if (!Object.values(ShiftStatus).includes(newStatus)) {
    throw new Error(`Invalid new status: ${newStatus}`)
  }

  // Нельзя установить тот же статус
  if (currentStatus === newStatus) {
    return false
  }

  // Проверка допустимого перехода
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus]
  return allowedTransitions.includes(newStatus)
}

/**
 * Получить список допустимых следующих статусов
 *
 * @param currentStatus - текущий статус смены
 * @returns массив допустимых следующих статусов
 */
export function getAllowedTransitions(currentStatus: ShiftStatus): ShiftStatus[] {
  if (!Object.values(ShiftStatus).includes(currentStatus)) {
    throw new Error(`Invalid status: ${currentStatus}`)
  }
  return STATUS_TRANSITIONS[currentStatus]
}

/**
 * Проверка является ли статус финальным (нет дальнейших переходов)
 *
 * @param status - статус для проверки
 * @returns true если финальный, false если нет
 */
export function isFinalStatus(status: ShiftStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0
}

/**
 * Получить человекочитаемое название статуса
 *
 * @param status - статус смены
 * @returns русское название статуса
 */
export function getStatusLabel(status: ShiftStatus): string {
  const labels: Record<ShiftStatus, string> = {
    [ShiftStatus.DRAFT]: 'Черновик',
    [ShiftStatus.PUBLISHED]: 'Опубликована',
    [ShiftStatus.APPLICATIONS]: 'Есть отклики',
    [ShiftStatus.ACCEPTED]: 'Исполнитель назначен',
    [ShiftStatus.CHECKING_IN]: 'Check-in',
    [ShiftStatus.IN_PROGRESS]: 'В процессе',
    [ShiftStatus.COMPLETED]: 'Завершена',
    [ShiftStatus.REVIEWED]: 'Оценена',
    [ShiftStatus.CANCELLED]: 'Отменена'
  }
  return labels[status]
}

/**
 * Получить цвет статуса для UI
 *
 * @param status - статус смены
 * @returns CSS класс или hex цвет
 */
export function getStatusColor(status: ShiftStatus): string {
  const colors: Record<ShiftStatus, string> = {
    [ShiftStatus.DRAFT]: 'gray',
    [ShiftStatus.PUBLISHED]: 'blue',
    [ShiftStatus.APPLICATIONS]: 'cyan',
    [ShiftStatus.ACCEPTED]: 'green',
    [ShiftStatus.CHECKING_IN]: 'yellow',
    [ShiftStatus.IN_PROGRESS]: 'orange',
    [ShiftStatus.COMPLETED]: 'purple',
    [ShiftStatus.REVIEWED]: 'emerald',
    [ShiftStatus.CANCELLED]: 'red'
  }
  return colors[status]
}
