'use client'

import WorkerLayout from '@/components/layouts/WorkerLayout';
import { Briefcase, Clock, MapPin, DollarSign } from 'lucide-react';

export default function ShiftsPage() {
  const myShifts = [
    {
      id: '1',
      title: 'Монтаж выставочного стенда',
      location: 'Crocus Expo, павильон 3',
      date: '28 января, 18:00 - 02:00',
      price: '2500 Р',
      status: 'active'
    },
    {
      id: '2',
      title: 'Демонтаж декораций',
      location: 'ЦВЗ Манеж',
      date: '29 января, 20:00 - 02:00',
      price: '3200 Р',
      status: 'active'
    }
  ];

  return (
    <WorkerLayout>
      <div style={{ padding: '20px' }} data-allow-scroll className="overflow-y-scroll">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
          Мои смены
        </h1>

        {myShifts.map((shift) => (
          <div
            key={shift.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
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
                Активна
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} />
                <span>{shift.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>{shift.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} />
                <span style={{ color: '#E85D2F', fontWeight: 600 }}>{shift.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WorkerLayout>
  );
}
