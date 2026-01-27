'use client';

import { useEffect, useState } from 'react';
import ProfileScreen from '@/components/ProfileScreen';
import WorkerLayout from '@/components/layouts/WorkerLayout';
import ClientLayout from '@/components/layouts/ClientLayout';
import ShefLayout from '@/components/layouts/ShefLayout';
import { getUserRole } from '@/lib/auth';

export default function ProfilePage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRole(getUserRole());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const Layout = role === 'worker' ? WorkerLayout : role === 'client' ? ClientLayout : ShefLayout;

  return (
    <Layout>
      <ProfileScreen />
    </Layout>
  );
}
