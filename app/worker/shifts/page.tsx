'use client'

import { EmptyShifts } from '@/components/shifts/EmptyShifts';
import { Clock, MapPin, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import SkeletonShift from '@/components/ui/SkeletonShift';
import { hapticLight } from '@/lib/haptic';
import { Logo } from '@/components/ui/Logo';

export default function ShiftsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showFilters, setShowFilters] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);

      // Load published shifts
      const { data: shiftsData, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'published')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      setShifts(shiftsData || []);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 min-h-screen overflow-y-auto">
        <div className="mb-4">
          <Logo size="md" showText={true} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
          Доступные смены
        </h1>
        {[1, 2, 3].map((i) => (
          <SkeletonShift key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen overflow-y-auto">
        <div className="mb-4">
          <Logo size="md" showText={true} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
          Доступные смены
        </h1>

        {shifts.length === 0 ? (
          <EmptyShifts
            userType="worker"
            onOpenFilters={() => setShowFilters(true)}
          />
        ) : (
          <>
            {shifts.map((shift) => (
          <div
            key={shift.id}
            onClick={() => {
              hapticLight();
              router.push(`/shift/${shift.id}`);
            }}
            className="card-hover animate-fade-in cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(232, 93, 47, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                {shift.title}
              </h3>
              <span style={{
                color: '#4ADE80',
                fontSize: '12px',
                fontWeight: 600,
                background: 'rgba(74, 222, 128, 0.1)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                Опубликована
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} />
                <span>{shift.location_address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>{new Date(shift.date).toLocaleDateString('ru-RU')} • {shift.start_time} - {shift.end_time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} />
                <span style={{ color: '#E85D2F', fontWeight: 600 }}>
                  {shift.pay_amount?.toLocaleString('ru-RU') || '0'} ₽
                </span>
              </div>
            </div>
          </div>
            ))}
          </>
        )}
    </div>
  );
}
