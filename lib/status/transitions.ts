import { ShiftStatus, ApplicationStatus, WorkerStatus } from '@/lib/types/status';
import { supabase } from '@/lib/supabase';

// ============ РАЗРЕШЁННЫЕ ПЕРЕХОДЫ ДЛЯ СМЕН ============
export const SHIFT_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  draft: ['published', 'cancelled'],
  published: ['applications', 'cancelled'],
  applications: ['shortlist', 'offer_sent', 'cancelled'],
  shortlist: ['offer_sent', 'cancelled'],
  offer_sent: ['accepted', 'cancelled'],
  accepted: ['check_in', 'cancelled'],
  check_in: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['payout'],
  payout: ['review'],
  review: [],
  cancelled: []
};

// ============ РАЗРЕШЁННЫЕ ПЕРЕХОДЫ ДЛЯ ОТКЛИКОВ ============
export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ['shortlisted', 'invited', 'declined', 'cancelled'],
  shortlisted: ['invited', 'declined', 'cancelled'],
  invited: ['accepted', 'declined', 'cancelled'],
  accepted: [],
  declined: [],
  cancelled: []
};

// ============ РАЗРЕШЁННЫЕ ПЕРЕХОДЫ ДЛЯ РАБОТНИКОВ ============
export const WORKER_TRANSITIONS: Record<WorkerStatus, WorkerStatus[]> = {
  assigned: ['on_way'],
  on_way: ['checked_in'],
  checked_in: ['completed'],
  completed: []
};

// ============ ПРОВЕРКА ВОЗМОЖНОСТИ ПЕРЕХОДА ============

export function canTransitionShift(
  currentStatus: ShiftStatus,
  newStatus: ShiftStatus
): boolean {
  return SHIFT_TRANSITIONS[currentStatus].includes(newStatus);
}

export function canTransitionApplication(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): boolean {
  return APPLICATION_TRANSITIONS[currentStatus].includes(newStatus);
}

export function canTransitionWorker(
  currentStatus: WorkerStatus,
  newStatus: WorkerStatus
): boolean {
  return WORKER_TRANSITIONS[currentStatus].includes(newStatus);
}

// ============ АВТОМАТИЧЕСКИЕ ПЕРЕХОДЫ (ТРИГГЕРЫ) ============

/**
 * Проверяет и выполняет автоматические переходы статусов смены
 */
export async function checkAutoTransitions(shiftId: string) {
  try {
    // Получаем смену
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*, applications(*), shift_workers(*)')
      .eq('id', shiftId)
      .single();

    if (shiftError || !shift) {
      console.error('Error fetching shift:', shiftError);
      return;
    }

    const currentStatus = shift.status as ShiftStatus;

    // Автопереход: published → applications (если есть хотя бы 1 отклик)
    if (currentStatus === 'published' && shift.applications?.length > 0) {
      await updateShiftStatusSafe(shiftId, 'applications');
    }

    // Автопереход: accepted → check_in (за 30 минут до начала)
    if (currentStatus === 'accepted') {
      const now = new Date();
      const shiftStart = new Date(`${shift.date}T${shift.start_time}`);
      const minutesUntilStart = (shiftStart.getTime() - now.getTime()) / 60000;

      if (minutesUntilStart <= 30 && minutesUntilStart > 0) {
        await updateShiftStatusSafe(shiftId, 'check_in');
      }
    }

    // Автопереход: check_in → in_progress (когда все работники checked_in)
    if (currentStatus === 'check_in' && shift.shift_workers?.length > 0) {
      const allCheckedIn = shift.shift_workers.every(
        (w: any) => w.worker_status === 'checked_in'
      );

      if (allCheckedIn) {
        await updateShiftStatusSafe(shiftId, 'in_progress');
      }
    }

    // Автопереход: in_progress → completed (когда все работники completed)
    if (currentStatus === 'in_progress' && shift.shift_workers?.length > 0) {
      const allCompleted = shift.shift_workers.every(
        (w: any) => w.worker_status === 'completed'
      );

      if (allCompleted) {
        await updateShiftStatusSafe(shiftId, 'completed');
      }
    }
  } catch (error) {
    console.error('Error in auto transitions:', error);
  }
}

/**
 * Безопасное обновление статуса смены с валидацией
 */
async function updateShiftStatusSafe(shiftId: string, newStatus: ShiftStatus) {
  // Получаем текущий статус
  const { data: shift } = await supabase
    .from('shifts')
    .select('status')
    .eq('id', shiftId)
    .single();

  if (!shift) return;

  const currentStatus = shift.status as ShiftStatus;

  // Проверяем возможность перехода
  if (!canTransitionShift(currentStatus, newStatus)) {
    console.warn(`Invalid transition: ${currentStatus} → ${newStatus}`);
    return;
  }

  // Обновляем статус
  await supabase
    .from('shifts')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', shiftId);

  console.log(`Shift ${shiftId} status: ${currentStatus} → ${newStatus}`);
}

// ============ ПОЛУЧЕНИЕ ДОСТУПНЫХ ДЕЙСТВИЙ ============

/**
 * Возвращает список доступных действий для смены в текущем статусе
 */
export function getAvailableShiftActions(status: ShiftStatus): {
  label: string;
  action: ShiftStatus;
  color: string;
}[] {
  const transitions = SHIFT_TRANSITIONS[status];
  const actions: { label: string; action: ShiftStatus; color: string }[] = [];

  transitions.forEach((nextStatus) => {
    switch (nextStatus) {
      case 'published':
        actions.push({ label: 'Опубликовать', action: nextStatus, color: 'blue' });
        break;
      case 'shortlist':
        actions.push({ label: 'Добавить в шортлист', action: nextStatus, color: 'orange' });
        break;
      case 'offer_sent':
        actions.push({ label: 'Отправить приглашение', action: nextStatus, color: 'orange' });
        break;
      case 'accepted':
        actions.push({ label: 'Принять', action: nextStatus, color: 'green' });
        break;
      case 'check_in':
        actions.push({ label: 'Начать выход', action: nextStatus, color: 'green' });
        break;
      case 'in_progress':
        actions.push({ label: 'Начать смену', action: nextStatus, color: 'dark-green' });
        break;
      case 'completed':
        actions.push({ label: 'Завершить смену', action: nextStatus, color: 'dark-green' });
        break;
      case 'payout':
        actions.push({ label: 'Оплатить', action: nextStatus, color: 'purple' });
        break;
      case 'review':
        actions.push({ label: 'Оценить', action: nextStatus, color: 'purple' });
        break;
      case 'cancelled':
        actions.push({ label: 'Отменить', action: nextStatus, color: 'red' });
        break;
    }
  });

  return actions;
}
