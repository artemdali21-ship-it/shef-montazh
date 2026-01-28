'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Briefcase, MessageCircle, User } from 'lucide-react';

interface WorkerLayoutProps {
  children: React.ReactNode;
}

export default function WorkerLayout({ children }: WorkerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { icon: Home, label: 'Лента', path: '/feed' },
    { icon: Search, label: 'Поиск', path: '/search' },
    { icon: Briefcase, label: 'Смены', path: '/shifts' },
    { icon: MessageCircle, label: 'Чат', path: '/messages' },
    { icon: User, label: 'Профиль', path: '/profile' }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col overflow-hidden">
      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>

      {/* TABBAR */}
      <nav className="flex-shrink-0 bg-black/40 backdrop-blur-2xl border-t border-white/10 h-20 z-50">
        <div className="flex items-center justify-around h-full px-4 max-w-screen-md mx-auto">
          {tabs.map(({ icon: Icon, label, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all"
                style={{
                  background: isActive ? 'rgba(232, 93, 47, 0.15)' : 'transparent',
                }}
              >
                <Icon
                  size={24}
                  strokeWidth={1.5}
                  style={{
                    color: isActive ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)',
                    transition: 'color 0.2s'
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#E85D2F' : 'rgba(255, 255, 255, 0.6)',
                    transition: 'color 0.2s'
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
