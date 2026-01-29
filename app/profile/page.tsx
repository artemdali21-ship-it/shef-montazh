'use client';

import { useEffect, useState } from 'react';
import WorkerProfile from '@/components/profile/WorkerProfile';
import ClientProfile from '@/components/profile/ClientProfile';
import { getUserRole } from '@/lib/auth';

export default function ProfilePage() {
  const [role, setRole] = useState<'worker' | 'client' | 'shef'>('worker');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRole(getUserRole());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Don't wrap with Layout - the parent layout already provides the navbar
  // Just render the profile component directly
  return (
    <>
      {role === 'worker' && <WorkerProfile />}
      {role === 'client' && <ClientProfile />}
      {role === 'shef' && <WorkerProfile />}
    </>
  );
}
