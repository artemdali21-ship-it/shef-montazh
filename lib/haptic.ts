/**
 * Haptic Feedback для Telegram Mini App
 * Добавляет тактильные ощущения при взаимодействии
 */

// Проверяем доступность Telegram WebApp API
const isTelegramWebApp = typeof window !== 'undefined' &&
  window.Telegram?.WebApp?.HapticFeedback

/**
 * Легкая вибрация при касании (кнопки, переключатели)
 */
export const hapticLight = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

/**
 * Средняя вибрация при важных действиях
 */
export const hapticMedium = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

/**
 * Сильная вибрация при критичных действиях
 */
export const hapticHeavy = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy')
  }
}

/**
 * Уведомление об успехе
 */
export const hapticSuccess = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
  }
}

/**
 * Уведомление об ошибке
 */
export const hapticError = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error')
  }
}

/**
 * Уведомление о предупреждении
 */
export const hapticWarning = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning')
  }
}

/**
 * Вибрация при изменении выбора (радио, чекбоксы)
 */
export const hapticSelection = () => {
  if (isTelegramWebApp) {
    window.Telegram.WebApp.HapticFeedback.selectionChanged()
  }
}
