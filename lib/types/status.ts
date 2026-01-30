/**
 * Типы статусов для системы управления сменами
 * Машина состояний для lifecycle смен, откликов и работников
 */

// ============ СТАТУСЫ СМЕН ============
export type ShiftStatus =
  | 'draft'           // черновик
  | 'published'       // опубликовано
  | 'applications'    // есть отклики
  | 'shortlist'       // шортлист
  | 'offer_sent'      // приглашение отправлено
  | 'accepted'        // принято
  | 'check_in'        // идёт выход
  | 'in_progress'     // в работе
  | 'completed'       // завершено
  | 'payout'          // оплачено
  | 'review'          // оценено
  | 'cancelled';      // отменено

// ============ СТАТУСЫ ОТКЛИКОВ ============
export type ApplicationStatus =
  | 'pending'         // ожидает
  | 'shortlisted'     // в шортлисте
  | 'invited'         // приглашён
  | 'accepted'        // принял
  | 'declined'        // отклонён
  | 'cancelled';      // отменён

// ============ СТАТУСЫ РАБОТНИКОВ ============
export type WorkerStatus =
  | 'assigned'        // назначен
  | 'on_way'          // в пути
  | 'checked_in'      // на месте
  | 'completed';      // завершил

// ============ LABELS ДЛЯ UI ============
export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  applications: 'Есть отклики',
  shortlist: 'Шортлист',
  offer_sent: 'Отправлено приглашение',
  accepted: 'Принято',
  check_in: 'Выход на объект',
  in_progress: 'В работе',
  completed: 'Завершено',
  payout: 'Оплачено',
  review: 'Оценено',
  cancelled: 'Отменено'
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Ожидает',
  shortlisted: 'В шортлисте',
  invited: 'Приглашён',
  accepted: 'Принял',
  declined: 'Отклонён',
  cancelled: 'Отменён'
};

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  assigned: 'Назначен',
  on_way: 'В пути',
  checked_in: 'На месте',
  completed: 'Завершил'
};

// ============ ЦВЕТА ДЛЯ BADGES ============
export type BadgeColor =
  | 'gray'
  | 'blue'
  | 'orange'
  | 'green'
  | 'dark-green'
  | 'red'
  | 'purple';

export const SHIFT_STATUS_COLORS: Record<ShiftStatus, BadgeColor> = {
  draft: 'gray',
  published: 'blue',
  applications: 'orange',
  shortlist: 'orange',
  offer_sent: 'orange',
  accepted: 'green',
  check_in: 'green',
  in_progress: 'dark-green',
  completed: 'dark-green',
  payout: 'purple',
  review: 'purple',
  cancelled: 'red'
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, BadgeColor> = {
  pending: 'gray',
  shortlisted: 'blue',
  invited: 'orange',
  accepted: 'green',
  declined: 'red',
  cancelled: 'red'
};

export const WORKER_STATUS_COLORS: Record<WorkerStatus, BadgeColor> = {
  assigned: 'gray',
  on_way: 'blue',
  checked_in: 'green',
  completed: 'dark-green'
};
