'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import WorkerLayout from '@/components/layouts/WorkerLayout';
import ClientLayout from '@/components/layouts/ClientLayout';
import ShefLayout from '@/components/layouts/ShefLayout';
import { getUserRole } from '@/lib/auth';

export default function SearchPage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker');
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setRole(getUserRole());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const Layout = role === 'worker' ? WorkerLayout : role === 'client' ? ClientLayout : ShefLayout;

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
          Поиск
        </h1>

        {/* SEARCH INPUT */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
        }}>
          <Search size={20} color="rgba(255, 255, 255, 0.5)" />
          <input
            type="text"
            placeholder={role === 'worker' ? 'Поиск смен...' : 'Поиск исполнителей...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              outline: 'none',
              fontSize: '16px',
            }}
          />
        </div>

        {!searchQuery && (
          <div style={{
            textAlign: 'center',
            paddingTop: '60px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            <p style={{ fontSize: '16px' }}>Введите запрос для поиска</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
