'use client'

import ShefLayout from '@/components/layouts/ShefLayout';
import { Users, Plus, Trash2 } from 'lucide-react';

export default function TeamsPage() {
  const teams = [
    {
      id: '1',
      name: 'Основная бригада',
      members: 5,
      leader: 'Иван Петров',
      active: true
    },
    {
      id: '2',
      name: 'Вспомогательная',
      members: 3,
      leader: 'Сергей Иванов',
      active: true
    }
  ];

  return (
    <ShefLayout>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
            Мои бригады
          </h1>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#E85D2F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <Plus size={18} />
            Добавить
          </button>
        </div>

        {teams.map((team) => (
          <div
            key={team.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(232, 93, 47, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(232, 93, 47, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={24} color="#E85D2F" />
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>
                  {team.name}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>
                  {team.members} человек • Лидер: {team.leader}
                </p>
              </div>
            </div>
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </ShefLayout>
  );
}
