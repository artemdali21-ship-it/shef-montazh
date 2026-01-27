'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Briefcase, FileText, User, LayoutDashboard, Zap } from 'lucide-react';

interface BottomNavProps {
  userType: 'worker' | 'b2b' | 'shef';
}

export function BottomNav({ userType }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const workerTabs = [
    { icon: Briefcase, label: 'Смены', path: '/feed' },
    { icon: FileText, label: 'Заявки', path: '/applications' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];
  
  const b2bTabs = [
    { icon: LayoutDashboard, label: 'Панель', path: '/dashboard' },
    { icon: Zap, label: 'Смены', path: '/monitoring' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];
  
  const shefTabs = [
    { icon: LayoutDashboard, label: 'Панель', path: '/shef-dashboard' },
    { icon: Briefcase, label: 'Смены', path: '/shift' },
    { icon: User, label: 'Профиль', path: '/profile' },
  ];
  
  const tabs = userType === 'worker' ? workerTabs : userType === 'b2b' ? b2bTabs : shefTabs;
  
  const isActive = (path: string) => {
    if (path === '/feed') return pathname === '/feed' || pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };
  
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '8px 0 20px 0',
      }}
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-2 py-2 px-4 rounded-lg transition-all"
              style={{
                background: active ? 'rgba(232, 93, 47, 0.2)' : 'transparent',
              }}
            >
              <Icon 
                className="w-5 h-5"
                strokeWidth={1.5}
                style={{ color: active ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)' }}
              />
              <span
                className="text-xs font-medium font-montserrat"
                style={{ color: active ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
