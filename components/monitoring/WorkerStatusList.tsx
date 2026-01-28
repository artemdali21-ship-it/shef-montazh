'use client';
import React, { useState, useMemo } from 'react';
import { Phone, MessageCircle, X, Clock, AlertCircle } from 'lucide-react';
import { ShiftStatus } from '../shift/ShiftStatus';

export interface Worker {
  id: string;
  name: string;
  avatar: string;
  status: 'assigned' | 'on_way' | 'checked_in' | 'completed';
  checkInTime?: string;
  checkInPhoto?: string;
  lateMinutes?: number;
}

interface WorkerStatusListProps {
  workers: Worker[];
  shiftStartTime: string;
}

export const WorkerStatusList: React.FC<WorkerStatusListProps> = ({ workers, shiftStartTime }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);

  const getStatusVariant = (status: Worker['status']): 'open' | 'accepted' | 'on_way' | 'checked_in' | 'completed' => {
    const statusMap = {
      assigned: 'accepted' as const,
      on_way: 'on_way' as const,
      checked_in: 'checked_in' as const,
      completed: 'completed' as const,
    };
    return statusMap[status] || 'open';
  };

  const getLateStatus = (lateMinutes?: number) => {
    if (!lateMinutes || lateMinutes <= 0) return { type: 'on_time', color: '#10B981', text: 'На время' };
    if (lateMinutes < 30) return { type: 'late_minor', color: '#E85D2F', text: `Опаздывает на ${lateMinutes} мин` };
    return { type: 'late_major', color: '#DC2626', text: `Опаздывает на ${lateMinutes} мин` };
  };

  const sortedWorkers = useMemo(() => {
    return [...workers].sort((a, b) => {
      const aLate = a.lateMinutes || 0;
      const bLate = b.lateMinutes || 0;
      return bLate - aLate;
    });
  }, [workers]);

  return (
    <div className="w-full space-y-4">
      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
            >
              <X size={24} className="text-white" />
            </button>
            <img src={selectedPhoto} alt="Check-in photo" className="w-full h-auto object-cover" />
          </div>
        </div>
      )}

      {/* Workers List */}
      {sortedWorkers.map((worker) => {
        const lateStatus = getLateStatus(worker.lateMinutes);
        const statusVariant = getStatusVariant(worker.status);
        const isExpanded = expandedWorkerId === worker.id;

        return (
          <div
            key={worker.id}
            className="group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer"
            style={{
              borderColor:
                worker.status === 'checked_in'
                  ? '#10B98144'
                  : worker.status === 'on_way'
                    ? '#E85D2F44'
                    : '#6B728044',
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)`,
            }}
            onClick={() => setExpandedWorkerId(isExpanded ? null : worker.id)}
          >
            {/* Top Section */}
            <div className="p-4 flex items-center justify-between">
              {/* Left: Avatar + Name + Status */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  {worker.status === 'checked_in' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-700 text-white truncate">{worker.name}</p>
                  <ShiftStatus status={statusVariant} size="sm" />
                </div>
              </div>

              {/* Right: Check-in time + Late indicator */}
              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                {worker.checkInTime && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Clock size={14} />
                      <span>Заезд</span>
                    </div>
                    <p className="font-montserrat font-600 text-white">{worker.checkInTime}</p>
                  </div>
                )}

                {worker.lateMinutes !== undefined && (
                  <div
                    className="px-3 py-2 rounded-lg flex items-center gap-2 flex-shrink-0"
                    style={{
                      background: `${lateStatus.color}22`,
                      borderLeft: `3px solid ${lateStatus.color}`,
                    }}
                  >
                    <AlertCircle size={16} style={{ color: lateStatus.color }} />
                    <span className="text-xs font-montserrat font-600" style={{ color: lateStatus.color }}>
                      {worker.lateMinutes > 0 ? lateStatus.text : 'На время'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Section */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                {/* Photo Section */}
                {worker.checkInPhoto && (
                  <div className="space-y-2">
                    <p className="text-xs font-montserrat font-600 text-gray-400 uppercase tracking-wider">
                      Фото заезда
                    </p>
                    <div
                      className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedPhoto(worker.checkInPhoto!)}
                    >
                      <img
                        src={worker.checkInPhoto}
                        alt="Check-in"
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white/0 group-hover:text-white/70 text-sm font-montserrat font-600">
                          Увеличить
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Section */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`[v0] Calling worker ${worker.id}`);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 transition-all text-blue-300 font-montserrat font-600 text-sm"
                  >
                    <Phone size={16} />
                    <span>Позвонить</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`[v0] Message worker ${worker.id}`);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 transition-all text-emerald-300 font-montserrat font-600 text-sm"
                  >
                    <MessageCircle size={16} />
                    <span>Написать</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Empty State */}
      {workers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 font-montserrat font-500">Нет назначенных рабочих</p>
        </div>
      )}
    </div>
  );
};
