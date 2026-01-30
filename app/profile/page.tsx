'use client'

import { useEffect, useState } from 'react';
import WorkerProfile from '@/components/profile/WorkerProfile';
import ClientProfile from '@/components/profile/ClientProfile';
import { getUserRole } from '@/lib/auth';

export default function ProfilePage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {role === 'worker' && <WorkerProfile />}
      {role === 'client' && <ClientProfile />}
      {role === 'shef' && <WorkerProfile />}
    </>
  );
}
