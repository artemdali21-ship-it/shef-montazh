'use client'

import { useEffect, useState } from 'react';
import WorkerProfile from '@/components/profile/WorkerProfile';
import ClientProfile from '@/components/profile/ClientProfile';
import WorkerLayout from '@/components/layouts/WorkerLayout';
import ClientLayout from '@/components/layouts/ClientLayout';
import { getUserRole } from '@/lib/auth';

export default function ProfilePage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const userRole = getUserRole();
    setRole(userRole);
    setMounted(true);
  }, []);

  // Use WorkerLayout by default, then switch based on role
  const Layout = role === 'client' ? ClientLayout : WorkerLayout;

  return (
    <Layout>
      {role === 'worker' && <WorkerProfile />}
      {role === 'client' && <ClientProfile />}
      {role === 'shef' && <WorkerProfile />}
    </Layout>
  );
}
