import {
  ShiftStatus,
  ApplicationStatus,
  WorkerStatus,
  SHIFT_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
  WORKER_STATUS_LABELS,
  SHIFT_STATUS_COLORS,
  APPLICATION_STATUS_COLORS,
  WORKER_STATUS_COLORS,
  BadgeColor
} from '@/lib/types/status';

interface StatusBadgeProps {
  status: ShiftStatus | ApplicationStatus | WorkerStatus;
  type: 'shift' | 'application' | 'worker';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, type, size = 'md' }: StatusBadgeProps) {
  const getColor = (): BadgeColor => {
    if (type === 'shift') {
      return SHIFT_STATUS_COLORS[status as ShiftStatus];
    }
    if (type === 'application') {
      return APPLICATION_STATUS_COLORS[status as ApplicationStatus];
    }
    return WORKER_STATUS_COLORS[status as WorkerStatus];
  };

  const getLabel = (): string => {
    if (type === 'shift') {
      return SHIFT_STATUS_LABELS[status as ShiftStatus];
    }
    if (type === 'application') {
      return APPLICATION_STATUS_LABELS[status as ApplicationStatus];
    }
    return WORKER_STATUS_LABELS[status as WorkerStatus];
  };

  const color = getColor();
  const label = getLabel();

  // Размеры
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  // Цветовые схемы
  const colorClasses: Record<BadgeColor, string> = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    'dark-green': 'bg-green-500 text-white border-green-600',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium border
        transition-all duration-200
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
    >
      {label}
    </span>
  );
}

// Экспорт удобных алиасов для разных типов
export function ShiftStatusBadge({
  status,
  size
}: {
  status: ShiftStatus;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <StatusBadge status={status} type="shift" size={size} />;
}

export function ApplicationStatusBadge({
  status,
  size
}: {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <StatusBadge status={status} type="application" size={size} />;
}

export function WorkerStatusBadge({
  status,
  size
}: {
  status: WorkerStatus;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <StatusBadge status={status} type="worker" size={size} />;
}
