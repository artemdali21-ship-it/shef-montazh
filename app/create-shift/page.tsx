'use client';

import { useEffect, useState } from 'react';
import CreateShiftScreen from '@/components/CreateShiftScreen';
import ClientLayout from '@/components/layouts/ClientLayout';
import ShefLayout from '@/components/layouts/ShefLayout';
import { getUserRole } from '@/lib/auth';

export default function CreateShiftPage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('client');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const userRole = getUserRole();
    if (userRole === 'worker') {
      // Workers can't create shifts
      return;
    }
    setRole(userRole);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const Layout = role === 'client' ? ClientLayout : ShefLayout;

  return (
    <Layout>
      <CreateShiftScreen />
    </Layout>
  );
}
