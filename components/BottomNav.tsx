'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, User, LayoutDashboard, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BottomNavProps {
  userType?: 'worker' | 'client' | 'shef';
}

export function BottomNav({ userType: propsUserType }: BottomNavProps) {
  const pathname = usePathname();
  const [userType, setUserType] = useState<'worker' | 'client' | 'shef'>(propsUserType || 'worker');

  useEffect(() => {
    // Get role from props or localStorage
    if (propsUserType) {
      setUserType(propsUserType);
    } else {
      const storedRole = localStorage.getItem('userRole') as 'worker' | 'client' | 'shef' | null;
      if (storedRole) {
        setUserType(storedRole);
      }
    }
  }, [propsUserType]);
  
  const workerTabs = [
    { icon: Briefcase, label: 'Смены', path: '/feed' },
    { icon: FileText, label: 'Заявки', path: '/applications' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];
  
  const clientTabs = [
    { icon: LayoutDashboard, label: 'Панель', path: '/dashboard' },
    { icon: Zap, label: 'Смены', path: '/monitoring' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];
  
  const shefTabs = [
    { icon: LayoutDashboard, label: 'Панель', path: '/shef-dashboard' },
    { icon: Briefcase, label: 'Смены', path: '/shift' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];
  
  const tabs = userType === 'worker' ? workerTabs : userType === 'client' ? clientTabs : shefTabs;
  
  const isActive = (path: string) => {
    if (path === '/feed') return pathname === '/feed' || pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };
  
  return (
    <nav
      role="navigation"
      aria-label="Главное меню"
      className="fixed bottom-0 left-0 right-0 max-w-full mx-auto z-30"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '8px 0 20px 0',
      }}
    >
      <ul className="flex items-center justify-around list-none m-0 p-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <li key={tab.path} className="flex-1 flex justify-center">
              <Link
                href={tab.path}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-4 rounded-lg transition-all duration-200"
                style={{
                  background: active ? 'rgba(232, 93, 47, 0.2)' : 'transparent',
                }}
              >
                <Icon
                  className="w-6 h-6"
                  strokeWidth={1.5}
                  style={{ color: active ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-xs font-medium font-inter"
                  style={{ color: active ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)' }}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
